import {putData, deleteData } from "../api";
import React, { useState, useEffect } from "react";

const TripEditModal = ({ trip, onSave, initialTripState, carTypes, agents }) => {
  // const [formData, setFormData] = useState({ ...trip });
	const [formData, setFormData] = useState(() => {
    let sanitizedTrip = { ...trip };
    Object.keys(sanitizedTrip).forEach((key) => {
        if (sanitizedTrip[key] === null || sanitizedTrip[key] === undefined) {
            sanitizedTrip[key] = ""; // Default to empty string
        }
    });
    return sanitizedTrip;
});
		const [message, setMessage]= useState("");
		const [errMessage, setErrMessage] = useState("");
			const [editedFields, setEditedFields] = useState({});
		
		const [selectedAgentType, setSelectedAgentType] = useState("");



const handleChange = (field, value) => {
  setFormData((prevState) => {
		const updatedState = { ...prevState, [field]: value };


		
		  // Track only edited fields
			setEditedFields((prev) => ({
				...prev,
				[field]: value, // Store new value for comparison
			}));

		// If the changed field affects calculations, update derived values
		if (
			["aging_date", "nights_max", "company_loading_date", "night_value", "transport_fee", "expenses", "total_received_cash"].includes(field)
		) {
			calculateNightsCount(updatedState);
			calculateTotalTransport(updatedState);
		}

		if (field === "client_name") {
			const selectedAgent = agents.find((agent) => agent.agent_name === value);
			setSelectedAgentType(selectedAgent ? selectedAgent.agent_type : "");
		}

		return updatedState;
	});
};
		
	 // Validate date inputs
	 const validateDates = () => {
    if (formData.aging_date) {
      const agingDate = new Date(formData.aging_date);
      const dateFields = ["arrival_date", "company_loading_date"];

      for (let field of dateFields) {
        if (formData[field] && new Date(formData[field]) > agingDate) {
          setErrMessage(`لا يمكن أن يكون ${initialTripState[field]} أكبر من تاريخ التعتيق`);
          return false;
        }
      }
    }
    setErrMessage("");
    return true;
  };
	
 //MARK: NIGHTS COUNT
	const calculateNightsCount = () => {
		const arrivalDate = new Date(formData.aging_date);
		const loadingDate = new Date(formData.company_loading_date);
		const maxNights = parseFloat(formData.nights_max) || 0;
	
		if (!isNaN(arrivalDate.getTime()) && !isNaN(loadingDate.getTime())) {
			const diffTime = Math.abs(arrivalDate - loadingDate);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			const nightValue = parseFloat(formData.night_value) || 0;
			let totalNightsValue = 0;
			if (maxNights > 0) {
				totalNightsValue = diffDays > maxNights ? (diffDays - maxNights) * nightValue : 0;
			}
	
			setFormData((prevState) => ({
				...prevState,
				nights_count: diffDays,
				total_nights_value: totalNightsValue,
			}));
	
			// 🛠 Mark these fields as edited
			setEditedFields((prev) => ({
				...prev,
				nights_count: diffDays,
				total_nights_value: totalNightsValue,
			}));
		}
	};
	
		//MARK: Calculate total transport
		const calculateTotalTransport = () => {
			const totalNightsValue = parseFloat(formData.total_nights_value) || 0;
			const transportFee = parseFloat(formData.transport_fee) || 0;
			const expenses = parseFloat(formData.expenses) || 0;
			const totalTransport = totalNightsValue + transportFee + expenses;
		
			const totalReceivedCash = parseFloat(formData.total_received_cash) || 0;
			const remainCash = totalTransport - totalReceivedCash;
		
			setFormData((prevState) => ({
				...prevState,
				total_transport: totalTransport,
				remain_cash: remainCash,
			}));
		
			// 🛠 Mark these fields as edited
			setEditedFields((prev) => ({
				...prev,
				total_transport: totalTransport,
				remain_cash: remainCash,
			}));
		};
		

		useEffect(() => {
			let sanitizedTrip = { ...trip };
			Object.keys(sanitizedTrip).forEach((key) => {
				if (sanitizedTrip[key] === null || sanitizedTrip[key] === undefined) {
					sanitizedTrip[key] = ""; // Default to empty string
				}
			});
			setFormData(sanitizedTrip);
		}, [trip]); // Re-run when the trip prop changes
	
		useEffect(() => {
			calculateNightsCount();
			calculateTotalTransport();

		}, [
			formData.aging_date,
			formData.arrival_date,
			formData.company_loading_date,
			formData.night_value,
			formData.nights_max,
			formData.nights_count,
			formData.transport_fee,
			formData.expenses,
			formData.total_received_cash,
		]);
	

  // MARK: Save updated trip
	const handleSave = async () => {
		if (!validateDates()) return;
	
		try {
			let updatedData = { id: formData.id }; // Always include the ID
	
			const requiredFields = ["driver_name", "leader_name", "client_name", "fo_number", "national_id"];
	
			// Iterate over edited fields
			Object.keys(editedFields).forEach((key) => {
				const value = formData[key];
	
				// Validate only edited required fields
				if (requiredFields.includes(key) && (!value || value.trim() === "")) {
					throw new Error(`يجب إدخال ${getFieldArabicName(key)}`);
				}
	
				// Validate national_id length only if it's edited
				if (key === "national_id" && value.length !== 14) {
					throw new Error("الرقم القومي يجب أن يكون 14 رقمًا");
				}
	
				// Add the field to updatedData if it passed validation
				updatedData[key] = value;
			});
	
			// Ensure numeric fields are properly formatted
			Object.keys(updatedData).forEach((key) => {
				let value = updatedData[key];
	
				if (value === "" || value === null || value === undefined) {
					updatedData[key] = ["nights_count", "night_value", "nights_max", "total_nights_value", "transport_fee", "expenses", "total_transport", "deposit", "total_received_cash"].includes(key) ? 0 : "";
				} else if (!isNaN(value) && typeof value !== "boolean") {
					updatedData[key] = parseFloat(value);
				} else {
					updatedData[key] = value.toString().trim();
				}
			});
	
			console.log("Updated Data before sending:", updatedData);
	
			if (Object.keys(updatedData).length === 1) {
				alert("لا يوجد تغييرات لحفظها");
				return;
			}
	
			const updatedTrip = await putData("dashboard?action=comp2Trips-edit", updatedData);
			onSave(updatedTrip); // Notify parent about update
			window.alert("تم حفظ الرحلة بنجاح");
			setEditedFields({}); // Reset after saving
		} catch (error) {
			console.error("Error updating trip:", error);
			setErrMessage(`${error.message}`);
	
			setTimeout(() => {
				setErrMessage("");
			}, 5000);
		}
	};
	
	const getFieldArabicName = (field) => {
		const fieldNames = {
			driver_name: "اسم السائق",
			leader_name: "اسم المندوب",
			client_name: "اسم العميل",
			fo_number: "رقم FO",
			national_id: "الرقم القومي",
		};
		return fieldNames[field] || field;
	};
	

	const handleDeleteTrip = async () => {
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذه الرحلة؟");
    if (!confirmDelete) return;
    
    try {
      await deleteData("dashboard?action=comp2Trips-del", { id: trip.id });
      window.alert("تم حذف الرحلة بنجاح");
      onSave(null); // Close modal and refresh trips
			setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error deleting trip:", error);
      setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);
    }
  };


  return (
    <div className="tripModal-dashboard-form-group">
      {/* Ensure initialTripState is defined */}
      {Object.entries(initialTripState)
        .filter(([key]) => key !== "added_by")
        .map(([key, label]) => (
          <div key={key} className="comp2-form-field">
            <label htmlFor={key}>{label}</label>
            {key === "car_type" ? (
              <select id={key} value={formData[key] || ""}  onChange={(e) => handleChange(key, e.target.value)}>
                <option value="" disabled>اختر نوع السيارة</option>
                {carTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            ) : key === "client_name" ? (
              <select id={key} value={formData[key] || ""}  onChange={(e) => handleChange(key, e.target.value)}>
                <option value="" disabled>اختر اسم العميل</option>
                {agents.map((agent, index) => (
                  <option key={index} value={agent.agent_name}>{agent.agent_name}</option>
                ))}
              </select>
            ) : key === "notes" ? (
              <textarea id={key} name={key} value={formData[key]}  onChange={(e) => handleChange(key, e.target.value)} />
            ) : (
              <input
                id={key}
                name={key}
                type={
                  key.includes("date") ? "date" :
                  ["nights_count", "total_transport", "total_received_cash", "remain_cash"].includes(key) ? "number" :
                  "text"
                }
                value={formData[key] || ""}
								onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
      <div className="action-buttons">
        <button onClick={handleSave}>حفظ</button>
				<button onClick={() => handleDeleteTrip(trip.id)}>حذف</button>
        <button onClick={() => onSave(null)}>إلغاء</button>
      </div>
			{message && (<p className="suc-message">{message}</p>)}
			{errMessage && (<p className="err-message">{errMessage}</p>)}
    </div>
  );
};

export default TripEditModal;
