import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import './search.css'


	
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

  company_night_value: "قيمة البياتة للشركة",
  total_company_nights_value: "إجمالي البياتات للشركة",


  transport_fee: "ناولون",
  company_naulon: "ناولون الشركة",

  expenses: "مصاريف (كارتة + ميزان)",
  total_transport: "إجمالي النقلة",
  total_received_cash: "إجمالي النقدية المستلمة",
  remain_cash: "المتبقى",

  company_toll_fee: "حساب الكارتة للشركة",
  total_company_account: "الحساب الاجمالي للشركة",
  net_profit: "صافي الربح",

  notes: "ملاحظات",
  status: "حالة الرحلة",
  added_by: "اضافة بواسطة ",
  edited_by: "آخر تعديل بواسطة",
};

const TripFilterSortComp2 = ({ trips, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({client_name: "", destination: "", leader_name: "", driver_name:"",startDate: "", endDate: "", status: "", hasAgingDate: "", hasFoNumber:"", client_type:"" });

  const [uniqueClients, setUniqueClients] = useState([]);
  const [uniqueDestinations, setUniqueDestinations] = useState([]);
  const [uniqueLeaders, setUniqueLeaders] = useState([]);


	// console.log(trips)


	
	const resetSearch = () => {
    setSearchQuery(""); // Clear search input
    setFilters({
      loading_place: "",
      client_name: "",
      destination: "",
      leader_name: "",
      driver_name: "",
      startDate: "",
      endDate: "",
			status: "",
			client_type: "",
			hasAgingDate: "",
			hasFoNumber: ""
    }); // Reset filters
    onSearch(trips); // Reset displayed trips to original list
  };

  useEffect(() => {
    if (trips.length > 0) {
      const clients = [...new Set(trips.map(trip => trip.client_name))];
      const destinations = [...new Set(trips.map(trip => trip.destination))];
      const leaders = [...new Set(trips.map(trip => trip.leader_name))];

      
      setUniqueClients(clients);
      setUniqueDestinations(destinations);
      setUniqueLeaders(leaders);
    }
  }, [trips]);

  const filteredTrips = useMemo(() => {
    let result = trips;
    
    if (searchQuery) {
      result = result.filter((trip) =>
			(trip.driver_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.national_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.car_type?.toLowerCase() || "").includes(searchQuery.toLowerCase())    ||
			(trip.cargo_type?.toLowerCase() || "").includes(searchQuery.toLowerCase())  ||
			(trip.fo_number?.toLowerCase() || "").includes(searchQuery.toLowerCase())   ||
			(trip.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.destination?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.leader_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.loading_place?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.status?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.client_type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.edited_by?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
			(trip.added_by?.toLowerCase() || "").includes(searchQuery.toLowerCase())

      );
    }

    if (filters.client_name) {
      result = result.filter((trip) => (trip.client_name?.toLowerCase() || "").includes(filters.client_name.toLowerCase()));
    }
    if (filters.destination) {
      result = result.filter((trip) => (trip.destination?.toLowerCase() || "").includes(filters.destination.toLowerCase()));
    }
    if (filters.leader_name) {
      result = result.filter((trip) => (trip.leader_name?.toLowerCase() || "").includes(filters.leader_name.toLowerCase()));
    }

				// Add status filter check
				if (filters.status) {
					result = result.filter((trip) => 
						(trip.status?.toLowerCase() || "") === filters.status.toLowerCase()
					);
				}
				// Add client_type filter check
				if (filters.client_type) {
					result = result.filter((trip) => 
						(trip.client_type?.toLowerCase() || "") === filters.client_type.toLowerCase()
					);
				}


		if (filters.hasAgingDate) {
      result = result.filter((trip) => {
        if (filters.hasAgingDate === "yes") {
          return trip.aging_date && trip.aging_date.trim() !== ""; // Has aging date
        } else if (filters.hasAgingDate === "no") {
          return !trip.aging_date || trip.aging_date.trim() === ""; // No aging date
        }
        return true; // Shouldn't reach here with proper filter values
      });
    }

		if (filters.hasFoNumber) {
      result = result.filter((trip) => {
        if (filters.hasFoNumber === "yes") {
          return trip.fo_number && trip.fo_number.trim() !== ""; // Has aging date
        } else if (filters.hasFoNumber === "no") {
          return !trip.fo_number || trip.fo_number.trim() === ""; // No aging date
        }
        return true; // Shouldn't reach here with proper filter values
      });
    }
		
		//filter acordong to cmpny loading date
    if (filters.startDate && filters.endDate) {
      result = result.filter((trip) => {
        const tripDate = new Date(trip.company_loading_date);
        return tripDate >= new Date(filters.startDate) && tripDate <= new Date(filters.endDate);
      });
    }

   
        // Apply sorting
				result.sort((a, b) => {
					const dateA = new Date(a.company_loading_date); // Use the correct field for sorting
					const dateB = new Date(b.company_loading_date);
		
					if (sortOrder === "asc") {
						return dateA - dateB; // Ascending order
					} else {
						return dateB - dateA; // Descending order
					}
				});
    
    // return result;

		return result.map((trip) => ({
			...trip,
			isEditing: trips.find((t) => t.id === trip.id)?.isEditing || false,
		}));


  }, [trips, searchQuery, filters, sortOrder]);

	// Trigger search automatically when filteredTrips changes
	useEffect(() => {
		onSearch({
			trips: filteredTrips,
			count: filteredTrips.length, // Add count based on filtered trips
		});
	}, [filteredTrips, onSearch]);

  const exportToExcel = () => {
    const exportData = filteredTrips.map(trip => {
      let formattedTrip = {};
      Object.keys(initialTripState).forEach(key => {
        formattedTrip[initialTripState[key]] = trip[key];
      });
      return formattedTrip;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
    worksheet['!direction'] = "rtl"; // Set right-to-left direction
    worksheet['!cols'] = new Array(Object.keys(initialTripState).length).fill({ wch: 20 }).reverse(); // Reverse columns to align right
    
    // Center align all cells
    Object.keys(worksheet).forEach(cell => {
      if (worksheet[cell] && worksheet[cell].t) {
        worksheet[cell].s = { alignment: { horizontal: "center", vertical: "center" } };
      }
    });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips Data");
    XLSX.writeFile(workbook, "trips_data.xlsx");
  };

  return (
      <div className="trans-search-container">
  <input
    type="text"
    placeholder="🔍 البحث..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />

  <select
    name="client_name"
    value={filters.client_name}
    onChange={(e) => setFilters({ ...filters, client_name: e.target.value })}
  >
    <option value="">  العميل</option>
    {uniqueClients.map((client) => (
      <option key={client} value={client}>
        {client}
      </option>
    ))}
  </select>

  <select
    name="destination"
    value={filters.destination}
    onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
  >
    <option value="">  الواجهة</option>
    {uniqueDestinations.map((destination) => (
      <option key={destination} value={destination}>
        {destination}
      </option>
    ))}
  </select>

  <select
    name="leader_name"
    value={filters.leader_name}
    onChange={(e) => setFilters({ ...filters, leader_name: e.target.value })}
  >
    <option value="">  المندوب</option>
    {uniqueLeaders.map((leader) => (
      <option key={leader} value={leader}>
        {leader}
      </option>
    ))}
  </select>

	<select
    name="status"
    value={filters.status}
    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
  >
    <option value="">  الحالة</option>
    <option value="غير مطالبة">غير مطالبة</option>
    <option value="مطالبة">مطالبة</option>
  </select>

	<select
    name="client_type"
    value={filters.client_type}
    onChange={(e) => setFilters({ ...filters, client_type: e.target.value })}
  >
    <option value="">نوع العميل</option>
    <option value="تجاري">تجاري</option>
    <option value="منظمة">منظمة</option>
  </select>


	<select
        name="hasAgingDate"
        value={filters.hasAgingDate}
        onChange={(e) => setFilters({ ...filters, hasAgingDate: e.target.value })}
      >
        <option value="">الكل (تاريخ التعتيق)</option>
        <option value="yes">يوجد تاريخ تعتيق</option>
        <option value="no">لا يوجد تاريخ تعتيق</option>
      </select>

	<select
        name="hasFoNumber"
        value={filters.hasFoNumber}
        onChange={(e) => setFilters({ ...filters, hasFoNumber: e.target.value })}
      >
        <option value=""> (FOD)الكل</option>
        <option value="yes">يوجد  FOD</option>
        <option value="no">لا يوجد FOD </option>
      </select>

  

	<div className="date-filter">
  <label htmlFor="startDate">البدء:</label>
  <input
    type="date"
    name="startDate"
    value={filters.startDate}
    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
  />
  <label htmlFor="endDate">النهاية:</label>
  <input
    type="date"
    name="endDate"
    value={filters.endDate}
    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
  />
</div>
  <button className="exl-btn" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
ترتيب ({sortOrder === "asc" ? "تصاعدي" : "تنازلي"})
  </button>


  <button className="export-btn" onClick={exportToExcel}>
    حفظ
  </button>
	<button className="export-btn" onClick={resetSearch}>الغاء</button>
</div>
  );
};

export default TripFilterSortComp2;
