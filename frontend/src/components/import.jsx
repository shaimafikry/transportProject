import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData} from "../api";

const ImportTrips = () => {
  const [importedData, setImportedData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Define the expected fields in the correct order
  const expectedFields = [
    "leader_name",
    "driver_name",
    "phone_number",
    "national_id",
    "passport_number",
    "car_letters",
    "car_numbers",
    "trailer_letters",
    "trailer_numbers",
    "arrival_date",
    "driver_loading_date",
    "car_type",
    "fo_number",
    "loading_place",
    "company_loading_date",
    "cargo_type",
    "destination",
    "equipment",
    "client_name",
    "aging_date",
    "nights_count",
    "nights_max",
    "night_value",
    "total_nights_value",
    "transport_fee",
    "expenses",
    "total_transport",
    "deposit",
    "total_received_cash",
    "remain_cash",
    "notes",
  ];

  // Handle file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get raw data with headers

      // Extract data rows (ignore headers)
      const rows = jsonData.slice(1); // Skip the header row

      // Map columns to expected fields by order
      const mappedData = rows.map((row) => {
        const mappedRow = {};
        expectedFields.forEach((field, index) => {
          mappedRow[field] = row[index] || null; // Assign column value to field (or null if missing)
        });
        return mappedRow;
      });

      setImportedData(mappedData);
      setShowModal(true); // Show the modal with the imported data
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle saving data to the backend
  const handleSave = async () => {
    try {
      for (const trip of importedData) {
        await postData("dashboard?action=comp2Trips-add", trip); // Call the backend API
      }
      alert("تم حفظ البيانات");
      setShowModal(false); // Close the modal
      setImportedData([]); /git / Clear the imported data
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  return (
    <div>
      {/* File input */}
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {/* Modal to display imported data */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Imported Data</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {expectedFields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, index) => (
                  <tr key={index}>
                    {expectedFields.map((field) => (
                      <td key={field}>{row[field] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for the modal and table
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

export default ImportTrips;
