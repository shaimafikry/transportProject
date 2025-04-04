import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData } from "../api";

const tripFields = {
  bon_number: "رقم البون",
  driver_name: "اسم السائق",
  car_number: "رقم السيارة",
  quantity: "الكمية",
  trip_date: "تاريخ التحميل",
  price: "السعر",
};

const ImportTripsFile = () => {
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

        Object.keys(tripFields).forEach((key) => {
          const columnIndex = headers.findIndex((col) => col.trim() === tripFields[key].trim());
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
        await postData("dashboard/construct?action=add", trip);
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
                  {Object.keys(tripFields).map((field) => (
                    <th key={field}>{tripFields[field]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(tripFields).map((field) => (
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
};

export default ImportTripsFile;
