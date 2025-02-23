import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";

const Comp2 = () => {
  const [viewComp2, setViewComp2] = useState("");
	const [tripsComp2, setTripsComp2] = useState([]);

	
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
    night_value: "قيمة البياتة",
    total_nights_value: "إجمالي قيمة البياتات",
    transport_fee: "ناوُلون",
    expenses: "مصاريف (كارتة + ميزان)",
    total_transport: "إجمالي النقلة",
    deposit: "عهدة",
    total_received_cash: "إجمالي النقدية المستلمة",
    transport_company: "الشركة الناقلة",
    notes: "ملاحظات",
  };


  const [newTripComp2, setNewTripComp2] = useState(
    Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""]))
  );

	const fetchTrips = async () => {
			try {
				const data = await fetchData("dashboard?action=comp2Trips");

				const formattedTrips = data.trips.map(trip => ({
					...trip,
					arrival_date: trip.arrivalDate.split("T")[0] // Extract only the date part
				}));

				setTripsComp2(Array.isArray(formattedTrips) ? formattedTrips : []);
			} catch (error) {
				console.error("Error fetching trips:", error);
			}
		};

  useEffect(() => {
    setViewComp2("");
		fetchTrips();
	}, []);

  // Handle trip input changes
  const handleTripChange = (field, value) => {
    setNewTripComp2({ ...newTripComp2, [field]: value });
  };


	// Add a new trip
  const handleAddTrip = async () => {
    try {
      console.log("Data sent to API:", newTripComp2); // ✅ تأكد أن البيانات ليست فارغة

      const data = await postData("dashboard?action=comp2-add", newTripComp2);
      setTripsComp2([...tripsComp2, data]);
      setNewTripComp2({ ...initialTripState });
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  // Toggle edit mode for a trip
  const handleEditTrip = (id) => {
    setTripsComp2(tripsComp2.map((trip) => (trip.id === id ? { ...trip, isEditing: !trip.isEditing } : trip)));
  };

	// Update trip
  const handleSaveTrip = async (id) => {
    try {
      const tripToUpdate = tripsComp2.find((trip) => trip.id === id);
      const updatedTrip = await putData('dashboard?action=comp2-edit', {tripToUpdate});

      setTripsComp2(tripsComp2.map((trip) => (trip.id === id ? {...updatedTrip, isEditing: false} : trip)));
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };


	// Delete trip
  const handleDeleteTrip = async (id) => {
    try {
			const tripToDel = tripsComp2.find((trip) => trip.id === id);
      await deleteData('dashboard?action=comp2-del', tripToDel);
      setTripsComp2(tripsComp2.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  return (
    <>
      <div className="trip-options">
        <button onClick={() => setViewComp2("add")}>إضافة رحلة</button>
        <button onClick={() =>{ fetchTrips(); setViewComp2("edit"); }}>تعديل الرحلات</button>
      </div>

      {viewComp2 === "add" && (
        <>
          <h2>إضافة رحلات لشركة النقل</h2>
          <div className="dashboard-form-group">
            {Object.entries(initialTripState).map(([key, label]) => (
              <input
                key={key}
                type={key.includes("date") ? "date" : "text"}
                placeholder={label}
                value={newTripComp2[key]}
                onChange={(e) => handleTripChange(key, e.target.value)}
              />
            ))}
          </div>
          <button onClick={handleAddTrip}>حفظ الرحلة</button>
        </>
      )}

      {viewComp2 === "edit" && (
        <>
          <h2>تعديل الرحلات</h2>
          <table className="trip-table">
            <thead>
              <tr>
                {Object.values(initialTripState).map((label, index) => (
                  <th key={index}>{label}</th>
                ))}
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tripsComp2.map((trip) => (
                <tr key={trip.id}>
                  {trip.isEditing ? (
                    <>
                      {Object.keys(initialTripState).map((key) => (
                        <td key={key}>
                          <input type={key.includes("date") ? "date" : "text"} defaultValue={trip[key]} />
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
                      {Object.keys(initialTripState).map((key) => (
                        <td key={key}>{trip[key]}</td>
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

export default Comp2;
