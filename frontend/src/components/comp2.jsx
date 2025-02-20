import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";

const Comp2 = () => {
  const [viewComp2, setViewComp2] = useState("");
	const [tripsComp2, setTripsComp2] = useState([]);

	
  const initialTripState = {
    representativeName: "اسم المندوب",
    driverName: "اسم السائق",
    phoneNumber: "رقم الموبايل",
    nationalId: "الرقم القومي",
    passportNumber: "رقم الجواز",
    carLetters: "حروف السيارة",
    carNumbers: "أرقام السيارة",
    trailerLetters: "حروف المقطورة",
    trailerNumbers: "أرقام المقطورة",
    arrivalDate: "تاريخ الوصول",
    driverLoadingDate: "تاريخ التحميل للسائق",
    carType: "نوع السيارة",
    foNumber: "رقم FO",
    loadingPlace: "مكان التحميل",
    companyLoadingDate: "تاريخ التحميل للشركة",
    cargoType: "نوع الحمولة",
    destination: "الجهة",
    equipment: "المعدة",
    clientName: "اسم العميل",
    agingDate: "تاريخ التعتيق",
    nightsCount: "عدد البياتات",
    nightValue: "قيمة البياتة",
    totalNightsValue: "إجمالي قيمة البياتات",
    transportFee: "ناوُلون",
    expenses: "مصاريف (كارتة + ميزان)",
    totalTransport: "إجمالي النقلة",
    deposit: "عهدة",
    totalReceivedCash: "إجمالي النقدية المستلمة",
    transportCompany: "الشركة الناقلة",
    notes: "ملاحظات",
  };


  const [newTripComp2, setNewTripComp2] = useState(
    Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""]))
  );

	const fetchTrips = async () => {
			try {
				const data = await fetchData("dashboard?action=comp2Trips");
				setTripsComp2(data);
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
      const data = await putData('dashboard?action=comp2-edit', {
				id,
				...tripToUpdate, // Send full trip data
			});
      setTripsComp2(tripsComp2.map((trip) => (trip.id === id ? data : trip)));
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };


	// Delete trip
  const handleDeleteTrip = async (id) => {
    try {
      await deleteData('dashboard?action=comp2-del', {id});
      setTripsComp2(tripsComp2.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  return (
    <>
      <div className="trip-options">
        <button onClick={() => setViewComp2("add")}>إضافة رحلة</button>
        <button onClick={() => setViewComp2("edit")}>تعديل الرحلات</button>
      </div>

      {viewComp2 === "add" && (
        <>
          <h2>إضافة رحلات لشركة النقل</h2>
          <div className="dashboard-form-group">
            {Object.entries(initialTripState).map(([key, label]) => (
              <input
                key={key}
                type={key.includes("Date") ? "date" : "text"}
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
                          <input type={key.includes("Date") ? "date" : "text"} defaultValue={trip[key]} />
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
