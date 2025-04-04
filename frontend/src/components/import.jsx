import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData } from "../api";

const initialTripState = {
  leader_name: "اسم المندوب",
  driver_name: "اسم السائق",
  phone_number: "رقم الموبايل",
  national_id: "الرقم القومي",
  passport_number: "رقم الجواز",
  car_letters: "حروف السيارة",
  car_numbers: "أرقام السيارة",
  trailer_letters: "حروف المقطورة",
  trailer_numbers: "أرقام المقطورة",
  arrival_date: "تاريخ الوصول",
  driver_loading_date: "تاريخ التحميل للسائق",
  car_type: "نوع السيارة",
  fo_number: "رقم FO",
  loading_place: "مكان التحميل",
  company_loading_date: "تاريخ التحميل للشركة",
  cargo_type: "نوع الحمولة",
  destination: "الجهة",
  equipment: "المعدة",
  client_name: "اسم العميل",
  client_type: "نوع العميل",
  aging_date: "تاريخ التعتيق",
  nights_count: "عدد البياتات",
  night_value: "قيمة البياتة",
  total_nights_value: "إجمالي قيمة البياتات",
  transport_fee: "ناوُلون",
  expenses: "مصاريف (كارتة + ميزان)",
  total_transport: "إجمالي النقلة",
  total_received_cash: "إجمالي النقدية المستلمة",
  notes: "ملاحظات",
};

const dateFields = ["arrival_date", "driver_loading_date", "company_loading_date", "aging_date"];


const ImportTrips = () => {
  const [importedData, setImportedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientType, setClientType] = useState("");
  const [loadMessage, setLoadMessage] = useState("");
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: ""
  });

  const handleConfirm = (isOrganization) => {
    setShowConfirmModal(false);
    const type = isOrganization ? "منظمة" : "تجاري";
    setClientType(type);
    processFile(selectedFile);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      let allData = [];
      let fileErrors = [];

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length < 2) return;

      const headers = jsonData[0];
      const columnMapping = {};

      Object.keys(initialTripState).forEach((key) => {
        // String comparison is intentional here - comparing trimmed header values
        const columnIndex = headers.findIndex((col) => col.trim() === initialTripState[key].trim());
        if (columnIndex !== -1) {
          columnMapping[key] = columnIndex;
        }
      });

      const rows = jsonData.slice(1);
      const mappedData = rows
        .map((row, rowIndex) => {
          let mappedRow = {};
          let isEmptyRow = true;
          let hasError = false;
          let rowErrors = [];

          Object.keys(columnMapping).forEach((key) => {
            if (columnMapping[key] !== undefined) {
              let value = row[columnMapping[key]];
              if (value === undefined || value === null) value = "";

                 // Convert Excel date serial numbers to readable date format
              if (dateFields.includes(key) && !isNaN(value) && value > 40000) {
                try {
                  const excelDate = XLSX.SSF.parse_date_code(value);
                  if (excelDate) {
                    value = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
                  }
                } catch (error) {
                  console.warn(`فشل تحويل التاريخ في الصف ${rowIndex + 2}:`, value);
                  rowErrors.push(`خطأ في تحويل التاريخ في الصف ${rowIndex + 2}`);
                  hasError = true;
                }
              }

              mappedRow[key] = String(value).trim();
              if (mappedRow[key] !== "") isEmptyRow = false;
            }
          });

          if (isEmptyRow) return null;

          mappedRow.client_type = clientType;

          Object.keys(mappedRow).forEach((key) => {
            let value = mappedRow[key];
            if (["nights_count", "night_value", "total_nights_value", "transport_fee", "expenses", "total_transport", "total_received_cash"].includes(key)) {
              if (value === "") {
                mappedRow[key] = 0;
              } else if (!isNaN(value)) {
                mappedRow[key] = parseInt(value);
              } else {
                console.warn(`خطأ في الصف ${rowIndex + 2}: ${key} يجب أن يكون رقمًا`, value);
                rowErrors.push(`خطأ في الصف ${rowIndex + 2}: ${initialTripState[key]} يجب أن يكون رقمًا`);
                hasError = true;
              }
            }
          });

          if (!mappedRow.driver_name || !mappedRow.leader_name || !mappedRow.national_id) {
            console.warn(`تم تخطي الصف ${rowIndex + 2} بسبب نقص البيانات الأساسية`);
            rowErrors.push(`تم تخطي الصف ${rowIndex + 2} بسبب نقص البيانات الأساسية`);
            hasError = true;
          }

          if (rowErrors.length > 0) {
            fileErrors.push(...rowErrors);
          }

          return hasError ? null : mappedRow;
        })
        .filter((row) => row !== null);

      allData = allData.concat(mappedData);

      if (fileErrors.length > 0) {
        setErrorModal({
          isOpen: true,
          message: "تم العثور على الأخطاء التالية:\n\n" + fileErrors.join("\n")
        });
        // return; // Prevent setting imported data
      }

      setImportedData(allData);
      setShowModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = importedData.map(trip => ({
        ...trip,   
        client_type: trip.client_type || clientType 
      }));

       setLoadMessage("جارٍ حفظ البيانات...");
       const response = await postData("dashboard/transport?action=import", updatedData);
      setLoadMessage("");
        alert("تم حفظ البيانات");
        setShowModal(false);
        setImportedData([]);
        setClientType("");
        setSelectedFile(null);
        setShowConfirmModal(false);
    } catch (error) {
      console.error("Error saving data:", error);
      setLoadMessage("");
      alert("فشل في حفظ البيانات. الرجاء المحاولة مرة أخرى.");

      

    }
  };




  const handleCancel = () => {
    setShowModal(false);
    setImportedData([]); 
    setClientType(""); 
  };

  const ErrorModal = () => {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <h3>الأخطاء</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {errorModal.message.split('\n').map((line, index) => (
              <p key={index} style={{ margin: '5px 0' }}>{line}</p>
            ))}
          </div>
          <button 
            style={styles.button}
            onClick={() => {
              setErrorModal({ isOpen: false, message: "" });
              setImportedData(importedData); // Continue with the import
              setShowModal(true);
            }}
          >
            متابعة
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {showConfirmModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>هل العملاء في هذا الملف منظمات أم تجاري؟</h3>
            <div style={styles.buttonContainer}>
              <button onClick={() => handleConfirm(true)}>منظمات</button>
              <button onClick={() => handleConfirm(false)}>تجاري</button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>البيانات المستوردة</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {Object.keys(initialTripState).map((field) => (
                    <th key={field}>{initialTripState[field]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(initialTripState).map((field) => (
                      field === "client_type" 
                        ? <td key={field}>{clientType}</td> 
                        : <td key={field}>{row[field] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {loadMessage && (
            <p style={{ color: "white", backgroundColor: "green", padding: "10px" }}>{loadMessage || ""}</p>)}
            <button onClick={handleSave}>حفظ</button>
            <button onClick={handleCancel}>إلغاء</button>
          </div>
        </div>
      )}
      {errorModal.isOpen && <ErrorModal />}
    </div>
  );
};


const styles = {
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "80%",
    maxHeight: "80%",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px'
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    margin: "5px",
  },
};

export default ImportTrips;
