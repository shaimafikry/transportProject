import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData } from "../api";

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

      // Array to store data from all sheets
      const allSheetData = [];

      // Iterate over all sheet names
      workbook.SheetNames.forEach((sheetName) => {
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

        // Filter out empty rows
        const nonEmptyRows = mappedData.filter((row) =>
          Object.values(row).some((value) => value !== null && value !== "")
        );

        // Add data from this sheet to the allSheetData array
        allSheetData.push(...nonEmptyRows);
      });

      // Set the imported data state
      setImportedData(allSheetData);
      setShowModal(true); // Show the modal with the imported data
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle saving data to the backend
  const handleSave = async () => {
    try {
      console.log("Data to save:", importedData);
      for (const tripData of importedData) {
        // Sanitize the data (replace empty strings with null)
        const sanitizedData = { ...tripData };
        Object.keys(sanitizedData).forEach((key) => {
          if (sanitizedData[key] === "" ||sanitizedData[key] === null) {
            sanitizedData[key] = null;
          }
        });

        // Save the trip
        await postData("dashboard?action=comp2Trips-add", sanitizedData);
      }
      alert("تم حفظ البيانات");
      setShowModal(false); // Close the modal
      setImportedData([]);
    } catch (error) {
      console.error("Error saving imported data:", error);
      alert(`حدث خطأ أثناء حفظ البيانات: ${error.message}`);
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
                  <th>#</th> {/* Counter column */}
                  {expectedFields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td> {/* Counter value */}
                    {expectedFields.map((field) => (
                      <td key={field}>{row[field] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.buttonContainer}>
              <button style={styles.button} onClick={handleSave}>
                حفظ
              </button>
              <button
                style={styles.button}
                onClick={() => setShowModal(false)}
              >
                الغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for the modal, table, and buttons
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
