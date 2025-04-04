import React, { useState, useEffect, useRef } from "react";
import { fetchData, postData } from "../api";
import TripFilterSortComp2 from "./Comp2Filter";
import ImportTrips from "./import"
import TripEditModal from "./tripModal"
import './comp2.css'
import { FaFileImport } from "react-icons/fa";


const Comp2 = () => {
	const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewComp2, setViewComp2] = useState("");
  const [tripsComp2, setTripsComp2] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgentType, setSelectedAgentType] = useState("");
  const [drivers, setDrivers] = useState([]);
	const [originalTrips, setOriginalTrips] = useState([]); 
	const [message, setMessage]= useState("");
	const [errMessage, setErrMessage] = useState("");
	const [tripsCount, setTripsCount] = useState(0); // New state for count
	const [userRole, setUserRole] = useState( sessionStorage.getItem("role")); 
  const [nationalIdPredictions, setNationalIdPredictions] = useState([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [fieldsEditable, setFieldsEditable] = useState(true)
  const predictionsRef = useRef(null);
  // Agent prediction states
  const [agentSearchTerm, setAgentSearchTerm] = useState("")
  const [agentPredictions, setAgentPredictions] = useState([])
  const [showAgentPredictions, setShowAgentPredictions] = useState(false)
  const agentPredictionsRef = useRef(null)

	
  const initialTripState = {
    national_id: "الرقم القومي",
    driver_name: "اسم السائق",
    leader_name: "اسم المندوب",
    phone_number: "رقم الموبايل",
    passport_number: "رقم الجواز",

    car_letters: "حروف السيارة",
    car_numbers: "أرقام السيارة",
    trailer_letters: "حروف المقطورة",
    trailer_numbers: "أرقام المقطورة",
    car_type: "نوع السيارة",

    cargo_type: "نوع الحمولة",
    loading_place: "مكان التحميل",
    destination: "الجهة",

    driver_loading_date: "تاريخ التحميل للسائق",
    arrival_date: "تاريخ الوصول",
    company_loading_date: "تاريخ التحميل للشركة",
    aging_date: "تاريخ التعتيق",

    fo_number: "رقم FO",
    equipment: "المعدة",
    client_name: "اسم العميل",
    client_type: "نوع العميل",

		

    nights_count: "عدد البياتات",
    nights_max: "اقصى عدد بياتات",
    night_value: "قيمة البياتة",
    total_nights_value: "إجمالي قيمة البياتات",

    transport_fee: "ناولون",

    expenses: "مصاريف (كارتة + ميزان)",
    total_transport: "إجمالي النقلة",
    total_received_cash: "إجمالي النقدية المستلمة",
    remain_cash: "المتبقى",


		status: "حالة الرحلة",

    company_night_value: "قيمة البياتة للشركة",
    total_company_nights_value: "إجمالي البياتات للشركة",
		company_naulon: "ناولون الشركة",


    company_toll_fee: "حساب الكارتة للشركة",
    total_company_account: "الحساب الاجمالي للشركة",
    net_profit: "صافي الربح",


    notes: "ملاحظات",
    added_by: "اضافة بواسطة",
    edited_by: "آخر تعديل بواسطة",
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
      const data = await fetchData("dashboard/transport");
      const formattedTrips = data.comp2Trips.map((trip) => ({
        ...trip, }));
      setTripsComp2(Array.isArray(formattedTrips) ? formattedTrips : []);
			console.log("fetch", data);
			// setTripsComp2(formattedTrips);
      setOriginalTrips(formattedTrips); 
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTripsComp2([]);

    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const data = await fetchData("dashboard/orgs");
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };
  // Fetch agents
  const fetchDrivers = async () => {
    try {
      const data = await fetchData("dashboard/drivers");
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    setViewComp2("");
    fetchAgents();
    fetchDrivers();
  }, []);


	const validateDates = () => {
		if (newTripComp2.aging_date) {
			const agingDate = new Date(newTripComp2.aging_date);
			const dateFields = ["arrival_date", "company_loading_date"];
	
			for (let field of dateFields) {
				if (newTripComp2[field] && new Date(newTripComp2[field]) > agingDate) {
					setErrMessage(`لا يمكن أن يكون ${initialTripState[field]} أكبر من تاريخ التعتيق`);
					return false;
				}
			}
		}
		setErrMessage("");
		return true;
	};
	
  //MARK: front calculations
	const calculateNightsCount = (updatedTrip = newTripComp2) => {
		const arrivalDate = new Date(updatedTrip.aging_date);
		const loadingDate = new Date(updatedTrip.company_loading_date);
		const maxNights = parseFloat(updatedTrip.nights_max) || 0;
	
		if (!isNaN(arrivalDate.getTime()) && !isNaN(loadingDate.getTime())) {
			const diffDays = Math.ceil((arrivalDate - loadingDate) / (1000 * 60 * 60 * 24));
			const nightValue = parseFloat(updatedTrip.night_value) || 0;
			let totalNightsValue = maxNights > 0 && diffDays > maxNights ? (diffDays - maxNights) * nightValue : 0;
	
			setNewTripComp2((prevState) => ({
				...prevState,
				nights_count: diffDays,
				total_nights_value: totalNightsValue,
			}));
		}
	};
	
	const calculateTotalTransport = (updatedTrip = newTripComp2) => {
		const totalNightsValue = parseFloat(updatedTrip.total_nights_value) || 0;
		const transportFee = parseFloat(updatedTrip.transport_fee) || 0;
		const expenses = parseFloat(updatedTrip.expenses) || 0;
		const totalTransport = totalNightsValue + transportFee + expenses;
		const totalReceivedCash = parseFloat(updatedTrip.total_received_cash) || 0;
		const remainCash = totalTransport - totalReceivedCash;
	
		setNewTripComp2((prevState) => ({
			...prevState,
			total_transport: totalTransport,
			remain_cash: remainCash,
		}));
	};


	const calculateCompanyNights = (updatedTrip = newTripComp2) => {
		const arrivalDate = new Date(updatedTrip.aging_date);
		const loadingDate = new Date(updatedTrip.company_loading_date);
		const maxNights = parseFloat(updatedTrip.nights_max) || 0;

	
		if (!isNaN(arrivalDate.getTime()) && !isNaN(loadingDate.getTime())) {
			const diffDays = Math.ceil((arrivalDate - loadingDate) / (1000 * 60 * 60 * 24)) || 0;
			const nightValue = parseFloat(updatedTrip.company_night_value) || 0;
			let totalCompanyNightsValue = maxNights > 0 && diffDays > maxNights ? (diffDays - maxNights) * nightValue : 0;
	
			setNewTripComp2((prevState) => ({
				...prevState,
				nights_count: diffDays,
				total_company_nights_value: totalCompanyNightsValue,
			}));
		}
	};

	const calculateTotalCompanyTransport = (updatedTrip = newTripComp2) => {
		const totalCompanyNightsValue = parseFloat(updatedTrip.total_company_nights_value) || 0;

		const CompanyTollFee = parseFloat(updatedTrip.company_toll_fee) || 0;

		const companyNaulon = parseFloat(updatedTrip.company_naulon) || 0;

		const totalCompanyTransport = totalCompanyNightsValue + CompanyTollFee + companyNaulon;
		
		const totalTransport = parseFloat(updatedTrip.total_transport) || 0;

		const netProfit = totalCompanyTransport - totalTransport;
	
		setNewTripComp2((prevState) => ({
			...prevState,
			total_company_account: totalCompanyTransport,
			net_profit: netProfit,
		}));
	};
	

  useEffect(() => {
    calculateNightsCount();
    calculateTotalTransport();
    calculateCompanyNights();
		calculateTotalCompanyTransport();
  }, [
		newTripComp2.aging_date,
		newTripComp2.nights_max,
    newTripComp2.arrival_date,
    newTripComp2.company_loading_date,
    newTripComp2.night_value,
    newTripComp2.transport_fee,
    newTripComp2.expenses,
    newTripComp2.total_received_cash,
		newTripComp2.company_night_value,
		newTripComp2.company_naulon,
		newTripComp2.company_toll_fee,
  ]);


	const handleSearch = (searchResults) => {
		setTripsComp2(searchResults.trips || []);
		setTripsCount(searchResults.count || 0);
	};
	


	const handleTripChange = (field, value) => {
		setNewTripComp2((prevState) => {
			const updatedState = { ...prevState, [field]: value };
	
			// If the changed field affects calculations, update derived values
			if (
				["aging_date", "nights_max", "company_loading_date", "night_value", "transport_fee", "expenses", "total_received_cash", "company_night_value", "company_naulon", "company_toll_fee" ].includes(field)
			) {
				calculateNightsCount(updatedState);
				calculateTotalTransport(updatedState);
				calculateCompanyNights(updatedState);
		    calculateTotalCompanyTransport(updatedState);
			}

       // If the national_id field is being changed, check for predictions
    if (field === "national_id" && value.length > 0) {
      const predictions = drivers
        .filter((driver) => driver.national_id && driver.national_id.startsWith(value))
        .map((driver) => driver.national_id)

      // Remove duplicates
      const uniquePredictions = [...new Set(predictions)]
      setNationalIdPredictions(uniquePredictions)
      setShowPredictions(uniquePredictions.length > 0)

      // If the national ID is complete (typically 14 digits in Egypt), check if it exists
      if (value.length >= 10) {
        checkNationalId(value)
      }
    } else if (field === "national_id" && value.length === 0) {
      setShowPredictions(false)
      setFieldsEditable(true)
      updatedState.driver_name = ""
      updatedState.phone_number = ""
      updatedState.passport_number = ""
      updatedState.leader_name = ""
      

    }
	
    if (field === "client_name") {
      const selectedAgent = agents.find((agent) => agent.agent_name === value)
      setSelectedAgentType(selectedAgent ? selectedAgent.agent_type : "")
      updatedState.client_type = selectedAgent ? selectedAgent.agent_type : ""
    }
	
			return updatedState;
		});
	};
	
    // Check if national ID exists and populate form
    const checkNationalId = (nationalId) => {
      const existingDriver = drivers.find((driver) => driver.national_id === nationalId)
  
      if (existingDriver) {
        // Preserve existing form data while updating only driver fields
        setNewTripComp2((prevState) => ({
          ...prevState, // Keep all existing form values
          national_id: existingDriver.national_id,
          leader_name: existingDriver.leader_name,
          driver_name: existingDriver.driver_name,
          phone_number: existingDriver.phone_number,
          passport_number: existingDriver.passport_number,
        }))
        
        setFieldsEditable(false)
      } else {
        setFieldsEditable(true)
        setErrMessage("")
      }
    }
  
    // // Reset form to initial state
    // const resetForm = () => {
    //   setNewTripComp2(Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""])))
    // }
  
    // Select a prediction
    const selectPrediction = (prediction) => {
      setNewTripComp2((prev) => ({ ...prev, national_id: prediction }))
      setShowPredictions(false)
      checkNationalId(prediction)
    }
  
    // Close predictions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (predictionsRef.current && !predictionsRef.current.contains(event.target)) {
          setShowPredictions(false)
        }
        if (agentPredictionsRef.current && !agentPredictionsRef.current.contains(event.target)) {
          setShowAgentPredictions(false)
        }
      }
  
  
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    // Handle agent search
  const handleAgentSearch = (value) => {
    setAgentSearchTerm(value)

    if (value.length > 0) {
      const predictions = agents
        .filter((agent) => agent.agent_name && agent.agent_name.toLowerCase().includes(value.toLowerCase()))
        .map((agent) => agent.agent_name)

      setAgentPredictions(predictions)
      setShowAgentPredictions(predictions.length > 0)
    } else {
      setShowAgentPredictions(false)
    }
  }

  // Select an agent from predictions
  const selectAgent = (agentName) => {
    setAgentSearchTerm(agentName)
    setShowAgentPredictions(false)

    // Find the selected agent
    const selectedAgent = agents.find((agent) => agent.agent_name === agentName)

    if (selectedAgent) {
      // Update client_name and client_type fields
      setNewTripComp2((prev) => ({
        ...prev,
        client_name: selectedAgent.agent_name,
        client_type: selectedAgent.agent_type || "",
      }))
      setSelectedAgentType(selectedAgent.agent_type || "")
    }
  }


  // MARK:Add a new trip
  const handleAddTrip = async () => {
		if (!validateDates()) return;
    try {
        const tripData = { ...newTripComp2 };
        console.log("Submitting trip data before:", newTripComp2)

        // Sanitize input
        Object.keys(tripData).forEach((key) => {
            let value = tripData[key];

            if (value === "" || value === null || value === undefined) {
                // Default numeric fields to 0
                  if ([
                    "nights_count", 
                    "nights_max", 
                    "night_value",
                    "total_nights_value", 
                    "transport_fee", 
                    "expenses", 
                    "total_transport", 
                    "total_received_cash",
                    "company_night_value", 
                    "company_toll_fee",
                    "company_naulon", 
                    "total_company_nights_value",
                    "total_company_account",
                    "net_profit",
                    "remain_cash"
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
                    tripData[key] = parseInt(value);
                } else {
                    tripData[key] = value.toString().trim();
                }
            }
        });

        // Validate required fields before submission
        if (!tripData.leader_name) {
          setErrMessage("يجب إدخال اسم المندوب");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return;
      }
        if (!tripData.driver_name) {
            setErrMessage("يجب إدخال اسم السائق");
            setTimeout(() => {
              setErrMessage("");
            }, 5000);
            return;
        }

        if (!tripData.national_id) {
          setErrMessage("يجب إدخال الرقم القومي للسائق");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return ;
        }
        if (tripData.national_id.length !== 14) {
          setErrMessage("الرقم القومي يجب أن يكون 14 رقمًا");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return ;
        }

        if (tripData.arrival_date && tripData.driver_loading_date && tripData.arrival_date < tripData.driver_loading_date) {
          setErrMessage("تاريخ الوصول لا يمكن أن يكون قبل تاريخ التحميل");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return;
        }
        if (tripData.aging_date && tripData.company_loading_date && tripData.aging_date < tripData.company_loading_date) {
          setErrMessage("تاريخ التعتيق لا يمكن أن يكون قبل تاريخ التحميل للشركة");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return ;
        }
        if (tripData.car_letters && !/^\p{Script=Arabic}(\s\p{Script=Arabic}){0,4}$/u.test(tripData.car_letters)) {
          setErrMessage("يجب أن تحتوي حروف السيارة على مسافة بين الحروف");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return;
        }
        
        if (tripData.trailer_letters && !/^\p{Script=Arabic}(\s\p{Script=Arabic}){0,4}$/u.test(tripData.trailer_letters)) {
          setErrMessage("يجب أن تحتوي حروف المقطورة على مسافة بين الحروف");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return;
        }
        
        if (tripData.passport_number && tripData.passport_number.length > 9) {
          setErrMessage("رقم الجواز لا يمكن أن يكون أكثر من 9 أرقام");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return;
        }

        console.log("Submitting trip data after:", tripData)
       
        const data = await postData("dashboard/transport?action=add", tripData);
        setTripsComp2([...tripsComp2, data]);

        // Reset form fields
        setNewTripComp2(Object.fromEntries(Object.keys(initialTripState).map((key) => [key, ""])));

        setMessage("تم اضافة الرحلة بنجاح");
        setTimeout(() => {
          setMessage("");
        }, 5000);
    } catch (error) {
        console.error("Error adding trip:", error);
        setErrMessage(error.message);
        setTimeout(() => {
          setErrMessage("");
        }, 5000);
				setTripsComp2([]);

    }
};



//MARK: RETURN html
return (
	<>
		<h2>رحلات شركة النقل</h2>
		<div className="trip-options">
      <button  title="اضافة من ملف اكسيل" onClick={() =>{ setViewComp2("import"); setMessage(""); setErrMessage("");}}><FaFileImport /></button>
			<button onClick={() => { setMessage(""); fetchAgents(); setViewComp2("add"); setErrMessage("");}}>إضافة رحلة</button>
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
				{Object.entries(initialTripState)
  .filter(([key]) => 
    !["added_by", "edited_by"].includes(key) && 
    (userRole === "manager" || ![
      "company_naulon",
      "company_night_value",
      "company_toll_fee",
      "total_company_account",
      "net_profit",
      "total_company_nights_value"
    ].includes(key))
  )
  .map(([key, label]) => (
    <div key={key} className="comp2-form-field">
      <label htmlFor={key}>{label}</label>
      {key === "car_type" ? (
        <select id={key} value={newTripComp2[key]} onChange={(e) => handleTripChange(key, e.target.value)}>
          <option value="" disabled>اختر نوع السيارة</option>
          {carTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      ) : key === "client_name" ? (
        <div className="relative">
          <input
            id={key}
            type="text"
            value={agentSearchTerm}
            onChange={(e) => handleAgentSearch(e.target.value)}
            placeholder="اسم العميل"
            className="w-full"
            onClick={() => {
              // Show all agents when clicking on empty field
              if (!agentSearchTerm) {
                setAgentPredictions(agents.map((agent) => agent.agent_name))
                setShowAgentPredictions(true)
              }
            }}
          />
          {showAgentPredictions && (
            <div
              ref={agentPredictionsRef}
              className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              {agentPredictions.map((prediction, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectAgent(prediction)}
                >
                  {prediction}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : key === "client_type" ? (
				<input
						id={key}
						type="text"
						value={newTripComp2[key]}
						readOnly
						style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
				/>
		): key === "national_id" ? (
      <div className="relative">
        <input
          id={key}
          type="text"
          value={newTripComp2[key]}
          onChange={(e) => handleTripChange(key, e.target.value)}
          className="w-full"
        />
        {showPredictions && (
          <div
            ref={predictionsRef}
            className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
          >
            {nationalIdPredictions.map((prediction, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectPrediction(prediction)}
              >
                {prediction}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : key === "status" ? (
        <select id={key} value={newTripComp2[key]} onChange={(e) => handleTripChange(key, e.target.value)}>
          <option value="" disabled>اختر الحالة</option>
          <option value="مطالبة">مطالبة</option>
          <option value="غير مطالبة">غير مطالبة</option>
        </select>
      ) : key === "notes" ? (
        <textarea id={key} value={newTripComp2[key]} onChange={(e) => handleTripChange(key, e.target.value)} />
      ) : ["net_profit", "remain_cash", "total_company_account", "total_company_nights_value", "nights_count", "total_transport", "total_nights_value"].includes(key) ? (
        <input
          id={key}
          name={key}
          type="text"
          value={newTripComp2[key]}
          onChange={(e) => handleTripChange(key, e.target.value)}
          readOnly
          style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
        />
      ): (
        <input
          id={key}
          type={key.includes("date") ? "date" :
                [ "nights_max", "night_value",
                 "transport_fee", "expenses", "total_received_cash"]
                .includes(key) ? "number" : "text"}
          value={newTripComp2[key]}
          onChange={(e) => handleTripChange(key, e.target.value)}
        />
      )}
    </div>
  ))}
				</div>
				{message && (<p className="suc-message">{message}</p>)}
				{errMessage && (<p className="err-message">{errMessage}</p>)}
				<button onClick={handleAddTrip}>حفظ الرحلة</button>
			</>
		)}

		{viewComp2 === "edit" && (
			<>

			<div className="trips-count">عدد الرحلات: {tripsCount}</div>
				<div className="table-container">
				<table >
					<thead>
						<tr>
							<th>اسم السائق</th>
							<th>رقم FO</th>
							<th>تاريخ التحميل للشركة</th>
							<th>تاريخ التعتيق</th>
							<th>اسم العميل</th>
							<th>إجمالي النقلة</th>
							<th>اضافة بواسطة</th>
							<th>اخر تعديل بواسطة</th>
							<th>الإجراءات</th>
						</tr>
					</thead>
					<tbody>
						{tripsComp2.map((trip) => (
							<tr key={trip.id}>
										<td>{trip.driver_name}</td>
										<td>{trip.fo_number}</td>
										<td>{trip.company_loading_date}</td>
										<td>{trip.aging_date}</td>
										<td>{trip.client_name}</td>
										<td>{trip.total_transport}</td>
										<td>{trip.added_by}</td>
										<td>{trip.edited_by}</td>
										<td>
											<button onClick={() => setSelectedTrip(trip)}>تعديل</button>
										</td>
							</tr>
						))}
					</tbody>
				</table>
				</div>
			</>
		)}

		
		{viewComp2 === "all" && (
			<>
			<div className="trips-count">عدد الرحلات: {tripsCount}</div>
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

	{selectedTrip && (
					<TripEditModal
						trip={selectedTrip}
						initialTripState={initialTripState}
						carTypes={carTypes}
						agents={agents}
						role={userRole}
						onSave={() => {
							setSelectedTrip(null);
							fetchTrips();
						}}
					/>
									)}
	</>
);
};

export default Comp2;
