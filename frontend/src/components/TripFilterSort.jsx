import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";


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
    nights_max: "اقصى عدد بياتات",
    night_value: "قيمة البياتة",
    total_nights_value: "إجمالي قيمة البياتات",
    transport_fee: "ناوُلون",
    expenses: "مصاريف (كارتة + ميزان)",
    total_transport: "إجمالي النقلة",
    deposit: "عهدة",
    total_received_cash: "إجمالي النقدية المستلمة",
    remain_cash: "المتبقى",
    notes: "ملاحظات",
};

const TripFilterSort = ({ trips }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({ client_name: "", destination: "", leader_name: "", startDate: "", endDate: "" });
  const [uniqueClients, setUniqueClients] = useState([]);
  const [uniqueDestinations, setUniqueDestinations] = useState([]);
  const [uniqueLeaders, setUniqueLeaders] = useState([]);

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
        trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.car_type.toLowerCase().includes(searchQuery.toLowerCase())    ||
        trip.cargo_type.toLowerCase().includes(searchQuery.toLowerCase())  ||
        trip.fo_number.toLowerCase().includes(searchQuery.toLowerCase())   ||
        trip.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.leader_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.client_name) {
      result = result.filter((trip) => trip.client_name.toLowerCase().includes(filters.client_name.toLowerCase()));
    }
    if (filters.destination) {
      result = result.filter((trip) => trip.destination.toLowerCase().includes(filters.destination.toLowerCase()));
    }
    if (filters.leader_name) {
      result = result.filter((trip) => trip.leader_name.toLowerCase().includes(filters.leader_name.toLowerCase()));
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter((trip) => {
        const tripDate = new Date(trip.start_date);
        return tripDate >= new Date(filters.startDate) && tripDate <= new Date(filters.endDate);
      });
    }

    result.sort((a, b) => sortOrder === "asc" ? new Date(a.inserted_date) - new Date(b.inserted_date) : new Date(b.inserted_date) - new Date(a.inserted_date));
    
    return result;
  }, [trips, searchQuery, filters, sortOrder]);

  const exportToExcel = () => {
    const exportData = trips.map(trip => {
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
    <div>
      <div className="search-filter-bar">
        <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <select name="client_name" value={filters.client_name} onChange={(e) => setFilters({ ...filters, client_name: e.target.value })}>
          <option value="">Filter by Client Name</option>
          {uniqueClients.map(client => <option key={client} value={client}>{client}</option>)}
        </select>
        <select name="destination" value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })}>
          <option value="">Filter by Destination</option>
          {uniqueDestinations.map(destination => <option key={destination} value={destination}>{destination}</option>)}
        </select>
        <select name="leader_name" value={filters.leader_name} onChange={(e) => setFilters({ ...filters, leader_name: e.target.value })}>
          <option value="">Filter by Leader Name</option>
          {uniqueLeaders.map(leader => <option key={leader} value={leader}>{leader}</option>)}
        </select>
        <input type="date" name="startDate" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" name="endDate" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>Sort by Date ({sortOrder})</button>
        <button className="export-btn" onClick={exportToExcel}>Export to Excel</button>
      </div>

      <table  className="trip-table">
        <thead>
          <tr>
            {trips.length > 0 && Object.keys(initialTripState).map((key) => (
              <th key={key}>{key.replace(/_/g, " ").toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredTrips.map((trip) => (
            <tr key={trip.id}>
              {Object.keys(initialTripState).map((key) => (
                <td key={key}>{trip[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripFilterSort;
