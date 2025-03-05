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
	const [message, setMessage]= useState("");
	const [errMessage, setErrMessage] = useState("");

	

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
		added_by: "بواسطة",
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
        const tripData = { ...newTripComp2 };

        // Sanitize input
        Object.keys(tripData).forEach((key) => {
            let value = tripData[key];

            if (value === "" || value === null || value === undefined) {
                // Default numeric fields to 0
                if ([
                    "nights_count",
                    "night_value",
                    "total_nights_value",
                    "transport_fee",
                    "expenses",
                    "total_transport",
                    "deposit",
                    "total_received_cash"
                ].includes(key)) {
                    tripData[key] = 0;
                } else {
                    tripData[key] = ""; // Default empty fields to an empty string
                }
            } else {
                // Convert national_id and phone_number to strings
                if (key === "national_id" || key === "phone_number") {
                    tripData[key] = String(value).trim();
                }
                // Convert numeric fields to numbers
                else if (!isNaN(value) && typeof value !== "boolean") {
                    tripData[key] = parseFloat(value);
                } else {
                    tripData[key] = value.toString().trim();
                }
            }
        });

        // Validate required fields before submission
        if (!tripData.driver_name) {
            setErrMessage("يجب إدخال اسم السائق");
            return;
        }
        if (!tripData.client_name) {
            setErrMessage("يجب إدخال اسم العميل");
            return;
        }
        if (!tripData.fo_number) {
            setErrMessage("يجب إدخال رقم FO");
            return;
        }
        if (!tripData.national_id) {
            setErrMessage("يجب إدخال الرقم القومي للسائق");
            return;
        }

        // Send sanitized data to backend
				const tripToSend = {
					...tripData, // Copy existing trip data
					added_by: sessionStorage.getItem("username"), // Add new key-value pair
				};
        const data = await postData("dashboard?action=comp2Trips-add", tripToSend);
        setTripsComp2([...tripsComp2, data]);

        // Reset form fields
        setNewTripComp2(Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""])));

        setMessage("تم اضافة الرحلة بنجاح");
    } catch (error) {
        console.error("Error adding trip:", error);
        setErrMessage(error.message);
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
      const tripToUpdate = tripsComp2.find((trip) => trip.id === id) || {};
			
			if (Object.keys(tripToUpdate).length === 0) {
				console.log("No changes to save");
				return;
			}

				const tripData = { ...tripToUpdate };
				Object.keys(tripData).forEach((key) => {
					if (tripData[key] === "") {
						tripData[key] = "";
					}
				});

      const updatedTrip = await putData('dashboard?action=comp2Trips-edit', tripData );


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
			setMessage('تم تعديل الرحلة بنجاح')
		}catch (error) {
      console.error("Error updating trip:", error);
			setErrMessage(`${error.message}`)
    }
  };

  // Delete trip
  const handleDeleteTrip = async (id) => {
		const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذه الرحلة");
    if (!confirmDelete) return;
    try {
      const tripToDel = tripsComp2.find((trip) => trip.id === id);
      await deleteData('dashboard?action=comp2Trips-del', tripToDel);
      setTripsComp2(tripsComp2.filter((trip) => trip.id !== id));

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
		  <h2>رحلات شركة النقل</h2>
      <div className="trip-options">
        <button onClick={() => { setMessage(""); fetchAgents(); setViewComp2("add"); setErrMessage("");}}>إضافة رحلة</button>
        <button onClick={() =>{ setViewComp2("import"); setMessage(""); setErrMessage("");}}>اضافة من ملف اكسيل</button>
        <button onClick={() => { setMessage(""); fetchTrips(); setViewComp2("edit"); setErrMessage("");}}>تعديل رحلة</button>
        <button onClick={() => {setMessage(""); fetchTrips(); setViewComp2("all"); setErrMessage("");}}>الرحلات</button>
      </div>
      
      {/*//MARK: call FilterSort*/}
			{/*i need to make it work with all too */}
			{(viewComp2 === "edit" || viewComp2 === "all") && (
        <TripFilterSortComp2 trips={originalTrips} onSearch={handleSearch} />
      )}
  
      {viewComp2 === "add" && (
        <>
          <div className="comp2-dashboard-form-group">
            {Object.entries(initialTripState) .filter(([key]) => key !== "added_by").map(([key, label]) => (
              <div key={key} className="comp2-form-field">
                <label htmlFor={key}>{label}</label>
                {key === "car_type" ? (
                  <select
                    id={key}
                    value={newTripComp2[key]}
                    onChange={(e) => handleTripChange(key, e.target.value)}
                  >
										<option value="" disabled>
											اختر نوع السيارة 
										</option>
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
										<option value="" disabled>
											اختر اسم العميل
										</option>
                    {agents.map((agent, index) => (
                      <option key={index} value={agent.agent_name}>{agent.agent_name}</option>
                    ))}
                  </select>
                ) : key === "notes" ? (
									<textarea
										id={key}
										value={newTripComp2[key]}
										onChange={(e) => handleTripChange(key, e.target.value)}

									/>
								) :  (
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
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}
        </>
      )}

      {viewComp2 === "edit" && (
        <>
				{message && (<p className="suc-message">{message}</p>)}
				{errMessage && (<p className="err-message">{errMessage}</p>)}
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
                <th>بواسطة</th>
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
											<td>{trip.added_by}</td>
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
                      <td>{trip.added_by}</td>
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
			
      {viewComp2 === "all" && (
        <>
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
      {viewComp2 === "import" && (
        <ImportTrips />
      )}
    </>
  );
};

export default Comp2;
