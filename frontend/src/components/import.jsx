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
  aging_date: "تاريخ التعتيق",
  nights_count: "عدد البياتات",
  nights_max: "اقصى عدد بياتات",
  night_value: "قيمة البياتة",
  total_nights_value: "إجمالي قيمة البياتات",
  transport_fee: "ناوُلون",
  expenses: "مصاريف (كارتة + ميزان)",
  total_transport: "إجمالي النقلة",
  deposit: "عهدة",
  total_received_cash: "إجمالي النقدية المستلمة",
  remain_cash: "المتبقى",
  notes: "ملاحظات",
};

const ImportTrips = () => {
  const [importedData, setImportedData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      let allData = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length === 0) return;
        
        const headers = jsonData[0]; // الصف الأول كعناوين أعمدة
        const columnMapping = {};

        Object.keys(initialTripState).forEach((key) => {
          const columnIndex = headers.findIndex((col) => col.trim() === initialTripState[key].trim());
          if (columnIndex !== -1) {
            columnMapping[key] = columnIndex;
          }
        });

        const rows = jsonData.slice(1);
        const mappedData = rows.map((row) => {
          let mappedRow = {};
          Object.keys(columnMapping).forEach((key) => {
            const value = row[columnMapping[key]];
            mappedRow[key] = value !== undefined && value !== null ? String(value).trim() : "";
          });
          return mappedRow;
        });

        allData = allData.concat(mappedData);
      });

      setImportedData(allData);
      setShowModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    try {
      for (const trip of importedData) {
        const tripToSend = {
					...trip, // Copy existing trip data
					added_by: sessionStorage.getItem("username"), // Add new key-value pair
				};
        await postData("dashboard?action=comp2Trips-add", tripToSend);
      }
      alert("تم حفظ البيانات");
      setShowModal(false);
      setImportedData([]);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("فشل في حفظ البيانات. الرجاء المحاولة مرة أخرى.");
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
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
                      <td key={field}>{row[field] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSave}>حفظ</button>
            <button onClick={() => setShowModal(false)}>إلغاء</button>
          </div>
        </div>
      )}
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
    display: "flex",
    justifyContent: "center",
    gap: "10px", // Space between buttons
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default ImportTrips;
