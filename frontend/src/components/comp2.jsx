import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import TripFilterSortComp2 from "./Comp2Filter";
import ImportTrips from "./import"

const Comp2 = ({ showFilter, onSearchClick }) => {
	const [showImportModal, setShowImportModal] = useState(false);
  const [viewComp2, setViewComp2] = useState("");
  const [tripsComp2, setTripsComp2] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgentType, setSelectedAgentType] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [originalTrips, setOriginalTrips] = useState([]); // To store the original data
	

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
		nights_max: " اقصى عدد بياتات",
    night_value: "قيمة البياتة",
    total_nights_value: "إجمالي قيمة البياتات",
    transport_fee: "ناوُلون",
    expenses: "مصاريف (كارتة + ميزان)",
    total_transport: "إجمالي النقلة",
    deposit: "عهدة",
    total_received_cash: "إجمالي النقدية المستلمة",
    remain_cash: " المتبقى",
    notes: "ملاحظات",
  };

  const [newTripComp2, setNewTripComp2] = useState(
    Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""]))
  );

  const carTypes = [
    "دبابه",
    "جامبو",
    "جامبو شاسيه طويل",
    "نقل محور قصير",
    "نقل جار و مجرور",
    "تريلا فرش",
    "١٢",
    "١٢.٦٠",
    "١٣",
    "١٣.٢٠",
    "١٣.٦٠",
    "تريلا جوانب",
    "تريلا ستاره",
    "تريلا حافظه",
    "تريلا براد",
    "كساحه",
    "كساحه ١٠ عجل",
    "كساحه ٢ دور",
  ];

  // Fetch trips
  const fetchTrips = async () => {
    try {
      const data = await fetchData("dashboard?action=comp2Trips");
      const formattedTrips = data.comp2Trips.map((trip) => ({
        ...trip, }));
      setTripsComp2(Array.isArray(formattedTrips) ? formattedTrips : []);
			// setTripsComp2(formattedTrips);
      setOriginalTrips(formattedTrips); 
      setIsSearching(false); // Reset search state
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTripsComp2([]);

    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const data = await fetchData("dashboard?action=agents");
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  useEffect(() => {
    setViewComp2("");
    fetchAgents();
    fetchTrips();

  }, [onSearchClick]);

	
  // Handle saving imported data
  const handleSaveImportedData = (data) => {
    console.log("Data to save:", data);
    // Call your backend API here to save the data
    // Example: axios.post("/api/trips/add", data);
    setShowImportModal(false); // Close the modal after saving
  };

  // Calculate nights count
  const calculateNightsCount = () => {
		// subtract company loading date from aging date
    const arrivalDate = new Date(newTripComp2.aging_date);
    const loadingDate = new Date(newTripComp2.company_loading_date);
		const maxNights = parseFloat(newTripComp2.nights_max) || 0;

    if (!isNaN(arrivalDate) && !isNaN(loadingDate)) {
      const diffTime = Math.abs(arrivalDate - loadingDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nightValue = parseFloat(newTripComp2.night_value) || 0;
      const totalNightsValue = diffDays > maxNights ? (diffDays-maxNights) * nightValue : 0;

      setNewTripComp2((prevState) => ({
        ...prevState,
        nights_count: diffDays,
        total_nights_value: totalNightsValue,
      }));
    }
  };

  // Calculate total transport
  const calculateTotalTransport = () => {
    const totalNightsValue = parseFloat(newTripComp2.total_nights_value) || 0;
    const transportFee = parseFloat(newTripComp2.transport_fee) || 0;
    const expenses = parseFloat(newTripComp2.expenses) || 0;
    const totalTransport = totalNightsValue + transportFee + expenses;

    const totalReceivedCash = parseFloat(newTripComp2.total_received_cash) || 0;
    const remainCash = totalTransport - totalReceivedCash;

    setNewTripComp2((prevState) => ({
      ...prevState,
      total_transport: totalTransport,
      remain_cash: remainCash,
    }));
  };


  useEffect(() => {
    calculateNightsCount();
    calculateTotalTransport();
  }, [
    newTripComp2.arrival_date,
    newTripComp2.company_loading_date,
    newTripComp2.night_value,
    newTripComp2.transport_fee,
    newTripComp2.expenses,
    newTripComp2.total_received_cash,
  ]);

	// Handle search results from TripFilterSortComp2Comp1
  const handleSearch = (searchResults) => {
    setTripsComp2(searchResults); // Update the table with filtered data
    setIsSearching(true); // Set searching to active
  };

  // Reset to show all trips
  const resetSearch = () => {
    setTripsComp2(originalTrips); // Reset to original data
    setIsSearching(false); // Set searching to inactive
  };

  // Handle trip input changes
  const handleTripChange = (field, value) => {
    setNewTripComp2((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    if (field === "client_name") {
      const selectedAgent = agents.find((agent) => agent.agent_name === value);
      setSelectedAgentType(selectedAgent ? selectedAgent.agent_type : "");
    }
  };


	  // Handle input changes for editing a trip
		const handleEditTripChange = (tripId, field, value) => {
			setTripsComp2((prevTrips) =>
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

  // Add a new trip
  const handleAddTrip = async () => {
    try {
      const data = await postData("dashboard?action=comp2Trips-add", newTripComp2);
      setTripsComp2([...tripsComp2, data]);
      setNewTripComp2({ ...initialTripState });
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };


  // Toggle edit mode for a trip
	const handleEditTrip = (id) => {
		setTripsComp2((prevTrips) =>
			prevTrips.map((trip) =>
				trip.id === id
					? trip.isEditing
						? { ...trip.originalData, isEditing: false } 
						: { ...trip, originalData: { ...trip }, isEditing: true } 
					: trip
			)
		);
		//check here


			// Update originalTrips
			setOriginalTrips((prevOriginalTrips) =>
				prevOriginalTrips.map((trip) =>
					trip.id === id
						? { ...trip, isEditing: !trip.isEditing, originalData: trip.isEditing ? trip.originalData : { ...trip } }
						: trip
				)
			);
	};


  // Update trip
  const handleSaveTrip = async (id) => {
    try {
      const tripToUpdate = tripsComp2.find((trip) => trip.id === id);
      const updatedTrip = await putData('dashboard?action=comp2Trips-edit', tripToUpdate );
			setTripsComp2((prevTrips) =>
        prevTrips.map((trip) => (trip.id === id ? { ...updatedTrip, isEditing: false }  : trip)))


			
			 // Update originalTrips
			 setOriginalTrips((prevOriginalTrips) =>
				prevOriginalTrips.map((trip) =>
					trip.id === id
						? { ...updatedTrip, isEditing: false }
						: trip
				)
			);
		}catch (error) {
      console.error("Error updating trip:", error);
    }
  };

  // Delete trip
  const handleDeleteTrip = async (id) => {
    try {
      const tripToDel = tripsComp2.find((trip) => trip.id === id);
      await deleteData('dashboard?action=comp2Trips-del', tripToDel);
      setTripsComp2(tripsComp2.filter((trip) => trip.id !== id));

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
				resetSearch();
			} else {
				setViewComp2("edit"); 
			}
		}, [showFilter]);

  return (
    <>

  
      <div className="trip-options">
        <button onClick={() => { fetchAgents(); setViewComp2("add"); }}>إضافة رحلة</button>
        <button onClick={() => setShowImportModal(true)}>اضافة من ملف اكسيل</button>
        <button onClick={() => { fetchTrips(); setViewComp2("edit"); }}>تعديل رحلة</button>
        <button onClick={() => { fetchTrips(); setViewComp2("all"); }}>الرحلات</button>
      </div>
      
      {/*//MARK: call FilterSort*/}
			{showFilter &&  viewComp2 !== "add" && (
        <TripFilterSortComp2 trips={originalTrips} onSearch={handleSearch} />
      )}
  
      {viewComp2 === "add" && (
        <>
          <h2>إضافة رحلات لشركة النقل</h2>
          <div className="comp2-dashboard-form-group">
            {Object.entries(initialTripState).map(([key, label]) => (
              <div key={key} className="comp2-form-field">
                <label htmlFor={key}>{label}</label>
                {key === "car_type" ? (
                  <select
                    id={key}
                    value={newTripComp2[key]}
                    onChange={(e) => handleTripChange(key, e.target.value)}
                  >
                    {carTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                ) : key === "client_name" ? (
                  <select
                    id={key}
                    value={newTripComp2[key]}
                    onChange={(e) => handleTripChange(key, e.target.value)}
                  >
                    {agents.map((agent, index) => (
                      <option key={index} value={agent.agent_name}>{agent.agent_name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={key}
                    type={
                      key.includes("date") ? "date" : 
                      [
                        "nights_count",
                        "nights_max",
                        "night_value",
                        "total_nights_value",
                        "transport_fee",
                        "expenses",
                        "total_transport",
                        "total_received_cash",
                        "remain_cash"
                      ].includes(key) ? "number" : "text"
                    }
                    value={newTripComp2[key]}
                    onChange={(e) => handleTripChange(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <button onClick={handleAddTrip}>حفظ الرحلة</button>
        </>
      )}

      {viewComp2 === "edit" && (
        <>
          <h2>تعديل رحلات شركة النقل </h2>
					<div className="table-container">
          <table >
            <thead>
              <tr>
                <th>اسم السائق</th>
                <th>تاريخ الوصول</th>
                <th>تاريخ التحميل للسائق</th>
                <th>رقم FO</th>
                <th>مكان التحميل</th>
                <th>تاريخ التحميل للشركة</th>
                <th>الجهة</th>
                <th>تاريخ التعتيق</th>
                <th>اسم العميل</th>
                <th>عدد البياتات</th>
                <th>إجمالي النقلة</th>
                <th>إجمالي النقدية المستلمة</th>
                <th>المتبقى</th>
                <th>ملاحظات</th>

                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tripsComp2.map((trip) => (
                <tr key={trip.id}>
                  {trip.isEditing ? (
                    <>
                      <td>
                        <input type="text" defaultValue={trip.driver_name} 
												 onChange={(e) => handleEditTripChange(trip.id, "driver_name", e.target.value)}/>
                      </td>
                      <td>
                        <input type="date" defaultValue={trip.arrival_date}
												 onChange={(e) => handleEditTripChange(trip.id, "arrival_date", e.target.value)}/>
                      </td>
                      <td>
                        <input type="date" defaultValue={trip.driver_loading_date}
												 onChange={(e) => handleEditTripChange(trip.id, "driver_loading_date", e.target.value)}/>
                      </td>
                      <td>
                        <input type="text" defaultValue={trip.fo_number} 
												onChange={(e) => handleEditTripChange(trip.id, "fo_number", e.target.value)}/>
                      </td>
                      <td>
                        <input type="text" defaultValue={trip.loading_place} 
												onChange={(e) => handleEditTripChange(trip.id, "loading_place", e.target.value)}/>
                      </td>
                      <td>
                        <input type="date" defaultValue={trip.company_loading_date} 
												onChange={(e) => handleEditTripChange(trip.id, "company_loading_date", e.target.value)}/>
                      </td>
                      <td>
                        <input type="text" defaultValue={trip.destination} 
												onChange={(e) => handleEditTripChange(trip.id, "destination", e.target.value)}/>
                      </td>
											<td>
                        <input type="date" defaultValue={trip.aging_date} 
												onChange={(e) => handleEditTripChange(trip.id, "aging_date", e.target.value)}/>
                      </td>
                      <td>
                        <input type="text" defaultValue={trip.client_name}
												onChange={(e) => handleEditTripChange(trip.id, "client_name", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" defaultValue={trip.nights_count} 
												onChange={(e) => handleEditTripChange(trip.id, "nights_count", e.target.value)}/>
                      </td>
                      <td>
                        <input type="number" defaultValue={trip.total_transport}
												onChange={(e) => handleEditTripChange(trip.id, "total_transport", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" defaultValue={trip.total_received_cash}
												onChange={(e) => handleEditTripChange(trip.id, "total_received_cash", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" defaultValue={trip.remain_cash}
												onChange={(e) => handleEditTripChange(trip.id, "total_received_cash", e.target.value)} />
                      </td>
											<td>
                        <input type="text" defaultValue={trip.notes}
												onChange={(e) => handleEditTripChange(trip.id, "notes", e.target.value)} />
                      </td>
                      <td>
                        <button onClick={() => handleSaveTrip(trip.id)}>حفظ</button>
                        <button onClick={() => handleDeleteTrip(trip.id)}>حذف</button>
                        <button onClick={() => handleEditTrip(trip.id)}>إلغاء</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{trip.driver_name}</td>
                      <td>{trip.arrival_date}</td>
                      <td>{trip.driver_loading_date}</td>
                      <td>{trip.fo_number}</td>
                      <td>{trip.loading_place}</td>
                      <td>{trip.company_loading_date}</td>
                      <td>{trip.destination}</td>
                      <td>{trip.aging_date}</td>
                      <td>{trip.client_name}</td>
                      <td>{trip.nights_count}</td>
                      <td>{trip.total_transport}</td>
                      <td>{trip.total_received_cash}</td>
                      <td>{trip.remain_cash}</td>
                      <td>{trip.notes}</td>

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
			
      {!showFilter && viewComp2 === "all" && (
        <>
          <h2>سجل رحلات شركة النقل </h2>
          <table className="table-large">
            <thead>
              <tr>
							{Object.entries(initialTripState).map(([key, label]) => (
            <th key={key}>{label}</th>
          ))}
								</tr>
							</thead>
							<tbody>
								{tripsComp2.map((trip) => (
									<tr key={trip.id}>
										{Object.keys(initialTripState).map((key) => (
											<td key={key}>{trip[key]}</td>
										))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

			{/* Import Excel Modal */}
      {showImportModal && (
        <ImportTrips
          onClose={() => setShowImportModal(false)}
          onSave={handleSaveImportedData}
        />
      )}
    </>
  );
};

export default Comp2;
