import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import TripFilterSortComp1 from "./Comp1Filter";

const Comp1 = ({ showFilter, onSearchClick }) => {
  const [viewComp1, setViewComp1] = useState("");
  const [tripsComp1, setTripsComp1] = useState([]);
  const [originalTrips, setOriginalTrips] = useState([]); // To store the original data
  const [isSearching, setIsSearching] = useState(false); // To track if searching is active

  const [newTripComp1, setNewTripComp1] = useState({
    bon_number: "",
    driver_name: "",
    car_number: "",
    quantity: "",
    trip_date: "",
    price: "",
  });

  const tripFields = [
    { name: "bon_number", type: "text", placeholder: "رقم البون" },
    { name: "driver_name", type: "text", placeholder: "اسم السائق" },
    { name: "car_number", type: "text", placeholder: "رقم السيارة" },
    { name: "quantity", type: "text", placeholder: "الكمية" },
    { name: "trip_date", type: "date", placeholder: "تاريخ التحميل" },
    { name: "price", type: "number", placeholder: "السعر" },
  ];

  // Fetch trips data from API
  const fetchTrips = async () => {
    try {
      const data = await fetchData("dashboard?action=comp1Trips");
      const formattedTrips = data.comp1Trips.map((trip) => ({
        ...trip,
        trip_date: trip.trip_date.split("T")[0], // Extract only the date part
				isEditing: false, // Initialize isEditing for all trips

      }));

      setTripsComp1(formattedTrips);
      setOriginalTrips(formattedTrips); // Save the original data
      setIsSearching(false); // Reset search state
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTripsComp1([]);
    }
  };

  useEffect(() => {
    setViewComp1("");
    fetchTrips();
  }, []);

  // Handle search results from TripFilterSortComp1
  const handleSearch = (searchResults) => {
    setTripsComp1(searchResults); // Update the table with filtered data
    setIsSearching(true); // Set searching to active
  };

  // Reset to show all trips
  const resetSearch = () => {
    setTripsComp1(originalTrips); // Reset to original data
    setIsSearching(false); // Set searching to inactive
  };

  // Handle input changes for adding a new trip
  const handleTripChange = (field, value) => {
    setNewTripComp1((prev) => ({ ...prev, [field]: value }));
  };

  // Handle input changes for editing a trip
  const handleEditTripChange = (tripId, field, value) => {
    setTripsComp1((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === tripId ? { ...trip, [field]: value } : trip
      )
    );

		// Update originalTrips
  setOriginalTrips((prevOriginalTrips) =>
    prevOriginalTrips.map((trip) =>
      trip.id === tripId ? { ...trip, [field]: value } : trip
    )
  );
  };


	const handleEditTrip = (id) => {
		console.log("Edit button clicked for trip ID:", id); // Debugging
	
		// Update tripsComp1
		setTripsComp1((prevTrips) =>
			prevTrips.map((trip) =>
				trip.id === id
					? { ...trip, isEditing: !trip.isEditing, originalData: trip.isEditing ? trip.originalData : { ...trip } }
					: trip
			)
		);
	
		// Update originalTrips
		setOriginalTrips((prevOriginalTrips) =>
			prevOriginalTrips.map((trip) =>
				trip.id === id
					? { ...trip, isEditing: !trip.isEditing, originalData: trip.isEditing ? trip.originalData : { ...trip } }
					: trip
			)
		);
	};

  // Add a new trip
  const handleAddTrip = async () => {
    try {
      const data = await postData("dashboard?action=comp1Trips-add", newTripComp1);
      setTripsComp1([...tripsComp1, data]);
      setNewTripComp1({
        bon_number: "",
        driver_name: "",
        car_number: "",
        quantity: "",
        trip_date: "",
        price: "",
      }); // Reset fields
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  // Save updated trip
  const handleSaveTrip = async (id) => {
    try {
      const tripToUpdate = tripsComp1.find((trip) => trip.id === id);
      const updatedTrip = await putData("dashboard?action=comp1Trips-edit", tripToUpdate);

      setTripsComp1((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === id
            ? { ...updatedTrip, trip_date: trip.trip_date.split("T")[0], isEditing: false }
            : trip
        )
      );


			 // Update originalTrips
			 setOriginalTrips((prevOriginalTrips) =>
				prevOriginalTrips.map((trip) =>
					trip.id === id
						? { ...updatedTrip, trip_date: trip.trip_date.split("T")[0], isEditing: false }
						: trip
				)
			);
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };

  // Delete trip
  const handleDeleteTrip = async (id) => {
    try {
      const tripToDel = tripsComp1.find((trip) => trip.id === id);
      await deleteData("dashboard?action=comp1Trips-del", tripToDel);
      setTripsComp1((prevTrips) => prevTrips.filter((trip) => trip.id !== id));
			
    // Update originalTrips
    setOriginalTrips((prevOriginalTrips) =>
      prevOriginalTrips.filter((trip) => trip.id !== id)
    );
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };



	useEffect(() => {
    if (!showFilter) {
      resetSearch(); // Restore full data when search is toggled off
    } else {
      setViewComp1("edit"); // Show edit page when search is toggled on
    }
  }, [showFilter]);

  return (
    <>
        <div className="trip-options">
          <button onClick={() => setViewComp1("add")}>إضافة رحلة</button>
          <button onClick={() => { fetchTrips(); setViewComp1("edit"); }}>تعديل رحلة</button>
        </div>


      {showFilter &&  viewComp1 !== "add" && (
        <TripFilterSortComp1 trips={originalTrips} onSearch={handleSearch} />
      )}

      {viewComp1 === "add" && (
        <>
          <h2>اضافة رحلة لشركة المحاجر</h2>
          <div className="dashboard-form-group">
            {tripFields.map(({ name, type, placeholder }) => (
              <div key={name} className="form-field">
                <label htmlFor={name}>{placeholder}</label>
                <input
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  value={newTripComp1[name]}
                  onChange={(e) => handleTripChange(name, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button onClick={handleAddTrip}>حفظ الرحلة</button>
        </>
      )}

      {viewComp1 === "edit" && (
        <>
          <h2>رحلات شركة المحاجر</h2>
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
                      {["bon_number", "driver_name", "car_number", "quantity", "trip_date", "price"].map((name) => (
                        <td key={name}>
                          <input
                            type={name === "trip_date" ? "date" : name === "price" ? "number" : "text"}
                            value={trip[name]}
                            onChange={(e) => handleEditTripChange(trip.id, name, e.target.value)}
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
                      {["bon_number", "driver_name", "car_number", "quantity", "trip_date", "price"].map((name) => (
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
