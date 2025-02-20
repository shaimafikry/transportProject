import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";

const Comp1 = () => {
  const [viewComp1, setViewComp1] = useState(""); 
	const [tripsComp1, setTripsComp1] = useState([]);


  const [newTripComp1, setNewTripComp1] = useState({ bonNumber: "", driverName: "", carNumber: "", quantity: "", date: "", price: "" });



	
	const fetchTrips = async () => {
		try {
			const data = await fetchData("dashboard?action=comp1Trips");
			setTripsComp1(data);
		} catch (error) {
			console.error("Error fetching trips:", error);
		}
	};

	useEffect(() => {
    setViewComp1(""); 
		fetchTrips();
  }, []);


	const tripFields = [
		{ name: "bonNumber", type: "text", placeholder: "رقم البون" },
		{ name: "driverName", type: "text", placeholder: "اسم السائق" },
		{ name: "carNumber", type: "text", placeholder: "رقم السيارة" },
		{ name: "quantity", type: "text", placeholder: "الكمية" },
		{ name: "date", type: "date", placeholder: "تاريخ التحميل" },
		{ name: "price", type: "number", placeholder: "السعر" },
	];
	
	const handleTripChange = (field, value) => {
		setNewTrip((prev) => ({ ...prev, [field]: value }));
	};
	
  // Toggle edit mode for a trip
  const handleEditTrip = (id) => {
    setTripsComp1(tripsComp1.map((trip) => (trip.id === id ? { ...trip, isEditing: !trip.isEditing } : trip)));
  };


// Add a new trip
const handleAddTrip = async () => {
	try {
		const data = await postData("dashboard?action=comp1-add", newTripComp1);
		setTripsComp1([...tripsComp1, data]);
		setNewTripComp1({ ...initialTripState });
	} catch (error) {
		console.error("Error adding trip:", error);
	}
};

// Update trip
const handleSaveTrip = async (id) => {
	try {
		const tripToUpdate = tripsComp1.find((trip) => trip.id === id);
		const data = await putData(`dashboard?action=comp1-edit/${id}`, tripToUpdate);
		setTripsComp1(tripsComp1.map((trip) => (trip.id === id ? data : trip)));
	} catch (error) {
		console.error("Error updating trip:", error);
	}
};


// Delete trip
const handleDeleteTrip = async (id) => {
	try {
		await deleteData(`dashboard?action=comp1-del/${id}`);
		setTripsComp1(tripsComp1.filter((trip) => trip.id !== id));
	} catch (error) {
		console.error("Error deleting trip:", error);
	}
};

  return (
      <>
        <div className="trip-options">
          <button onClick={() => setViewComp1("add")}>إضافة رحلة</button>
          <button onClick={() => setViewComp1("edit")}>تعديل رحلة</button>
        </div>

        {viewComp1 === "add" && (
          <>
            <h2>رحلات شركة المحاجر</h2>
            <div className="dashboard-form-group">
              {tripFields.map(({ name, type, placeholder }) => (
                <input
                  key={name}
                  type={type}
                  placeholder={placeholder}
                  value={newTripComp1[name]}
                  onChange={(e) => handleTripChange(name, e.target.value)}
                />
              ))}
            </div>
            <button onClick={handleAddTrip}>Save Trip</button>
          </>
        )}

{viewComp1 === "edit" && (
  <>
    <h2>تعديل الرحلات</h2>
    <table className="trip-table">
      <thead>
        <tr>
          {tripFields.map(({ placeholder }) => (
            <th key={placeholder}>{placeholder}</th>
          ))}
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {tripsComp1.map((trip) => (
          <tr key={trip.id}>
            {trip.isEditing ? (
              <>
                {tripFields.map(({ name, type }) => (
                  <td key={name}>
                    <input
                      type={type}
                      defaultValue={trip[name]}
                      onChange={(e) => handleTripChange(trip.id, name, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={() => handleSaveTrip(trip.id)}>حفظ</button>
                  <button onClick={() => handleDeleteTrip(trip.id)}>حذف</button>
                  <button onClick={() => handleEditTrip(trip.id)}>إلغاء</button>
                </td>
              </>
            ) : (
              <>
                {tripFields.map(({ name }) => (
                  <td key={name}>{trip[name]}</td>
                ))}
                <td>
                  <button onClick={() => handleEditTrip(trip.id)}>تعديل</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
		</>
      )}
    </>
  );
};


	export default Comp1;
