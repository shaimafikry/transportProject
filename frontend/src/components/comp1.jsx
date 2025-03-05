import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import TripFilterSortComp1 from "./Comp1Filter";
import ImportTripsFile from "./import_stones";

const Comp1 = () => {
  const [viewComp1, setViewComp1] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [tripsComp1, setTripsComp1] = useState([]);
  const [originalTrips, setOriginalTrips] = useState([]); 
  const [isSearching, setIsSearching] = useState(false);
	const [message, setMessage]= useState("");
	const [errMessage, setErrMessage] = useState("");
	
	

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
    { name: "quantity", type: "number", placeholder: "الكمية" },
    { name: "trip_date", type: "date", placeholder: "تاريخ التحميل" },
    { name: "price", type: "number", placeholder: "السعر" },
		{ name: "added_by", type: "text", placeholder: "بواسطة" },

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
      setOriginalTrips(formattedTrips); 

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


   // Handle saving imported data
   const handleSaveImportedData = (data) => {
    console.log("Data to save:", data);
    // Call your backend API here to save the data
    // Example: axios.post("/api/trips/add", data);
    setShowImportModal(false); // Close the modal after saving
  };



  // Handle search results from TripFilterSortComp1
  const handleSearch = (searchResults) => {
    setTripsComp1(searchResults); // Update the table with filtered data
    setIsSearching(true); // Set searching to active
		// Ensure search stays active when editing
		if (viewComp1 === "edit") {
			setIsSearching(true);
		}
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

  //MARK: Add a new trip
  const handleAddTrip = async () => {
			// if (newTripComp1.bon_number === "" || newTripComp1.driver_name === "" || newTripComp1.car_number === ""){
      //   setErrMessage('رقم البون، اسم السائق، اسم السيارة : هذه الحقول لا يجب ان تكون فارغة')
			// 	return
			// }
		try {
			const tripToSend = {
				...newTripComp1,
				added_by: sessionStorage.getItem("username"),
			};

			Object.keys(tripToSend).forEach((key) => {
				let value = tripToSend[key];

				if (value === "" || value === null || value === undefined) {
						// Default numeric fields to 0
						if (["price", "quantity"].includes(key)) {
							tripToSend[key] = 0;
						} else {
							tripToSend[key] = ""; // Default empty fields to an empty string
						}
				}
		});

			console.log(tripToSend)
      const data = await postData("dashboard?action=comp1Trips-add", tripToSend);
      setTripsComp1([...tripsComp1, data]);
      setNewTripComp1({
        bon_number: "",
        driver_name: "",
        car_number: "",
        quantity: "",
        trip_date: "",
        price: "",
      }); // Reset fields
			setMessage("تم اضافة الرحلة بنجاح");

    } catch (error) {
      console.error("Error adding trip:", error);
			setErrMessage(`${error.message}`);

    }
  };

  // MARK: Save updated trip
  const handleSaveTrip = async (id) => {
    try {
      const tripToUpdate = tripsComp1.find((trip) => trip.id === id) || {};
			if (Object.keys(tripToUpdate).length === 0) {
				console.log("No changes to save");
				return;
			}

      const updatedTrip = await putData("dashboard?action=comp1Trips-edit", tripToUpdate);

      setTripsComp1((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === id
            ? { ...updatedTrip, trip_date: trip.trip_date.split("T")[0], isEditing: false }
            : trip
        )
      );


			 // MARK: Update originalTrips
			 setOriginalTrips((prevOriginalTrips) =>
				prevOriginalTrips.map((trip) =>
					trip.id === id
						? { ...updatedTrip, trip_date: trip.trip_date.split("T")[0], isEditing: false }
						: trip
				)
			);
			setMessage('تم تعديل الرحلة بنجاح')
    } catch (error) {
      console.error("Error updating trip:", error);
			setErrMessage(`${error.message}`)

    }
  };

  // Delete trip
  const handleDeleteTrip = async (id) => {
	  const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذه الرحلة");
      if (!confirmDelete) return;
    try {
      const tripToDel = tripsComp1.find((trip) => trip.id === id);
      await deleteData("dashboard?action=comp1Trips-del", tripToDel);
      setTripsComp1((prevTrips) => prevTrips.filter((trip) => trip.id !== id));
			
    // Update originalTrips
    setOriginalTrips((prevOriginalTrips) =>
      prevOriginalTrips.filter((trip) => trip.id !== id)
    );
		setMessage('تم حذف الرحلة بنجاح')
    } catch (error) {
      console.error("Error deleting trip:", error);
			setErrMessage(`${error.message}`)

    }
  };

  return (
    <>
		  <h2>رحلات شركة المحاجر</h2>
        <div className="trip-options">
          <button onClick={() => {setViewComp1("add"); setMessage(""); setErrMessage("");}}>إضافة رحلة</button>
          <button onClick={() => {setViewComp1("import"); setMessage(""); setErrMessage("");}}>اضافة من ملف اكسيل</button>
          <button onClick={() => { setMessage(""); fetchTrips(); setViewComp1("edit"); setErrMessage(""); setIsSearching(true); }}>تعديل رحلة</button>
        </div>

      {viewComp1 === "edit" && (
        <TripFilterSortComp1 trips={originalTrips} onSearch={handleSearch} />
      )}

      {viewComp1 === "add" && (
        <>
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
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}
        </>
      )}

      {viewComp1 === "edit" && (
        <>
				{message && (<p className="suc-message">{message}</p>)}
				{errMessage && (<p className="err-message">{errMessage}</p>)}
					<div className="table-container">
          <table>
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
											<td>{trip.added_by}</td> {/* Display added_by as plain text */}
                      <td>
											<div className="action-buttons">
                        <button onClick={() => handleSaveTrip(trip.id)}>حفظ</button>
                        <button onClick={() => handleDeleteTrip(trip.id)}>حذف</button>
                        <button onClick={() => handleEditTrip(trip.id)}>إلغاء</button>
											</div>
                      </td>
											
                    </>
                  ) : (
                    <>
                      {["bon_number", "driver_name", "car_number", "quantity", "trip_date", "price", "added_by"].map((name) => (
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
					</div>
        </>
      )}
      {viewComp1 === "import" && (
        <ImportTripsFile
          onClose={() => setShowImportModal(false)}
          onSave={handleSaveImportedData}
        />
      )}
    </>
  );
};

export default Comp1;
