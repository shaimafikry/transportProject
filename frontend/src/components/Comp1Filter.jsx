import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

const initialTripState = {
    bon_number: "رقم البون",
    driver_name: "اسم السائق",
    car_number: "رقم السيارة",
    quantity: "الكمية",
    trip_date: "تاريخ التحميل",
    price: "السعر",
};

const TripFilterSortComp1 = ({ trips }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({ driver_name: "", car_number: "", bon_number: "", startDate: "", endDate: "" });

  const filteredTrips = useMemo(() => {
    let result = trips;
    
    if (searchQuery) {
      result = result.filter((trip) =>
        trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.car_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.bon_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.driver_name) {
      result = result.filter((trip) => trip.driver_name.toLowerCase().includes(filters.driver_name.toLowerCase()));
    }
    if (filters.car_number) {
      result = result.filter((trip) => trip.car_number.toLowerCase().includes(filters.car_number.toLowerCase()));
    }
    if (filters.bon_number) {
      result = result.filter((trip) => trip.bon_number.toLowerCase().includes(filters.bon_number.toLowerCase()));
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter((trip) => {
        const tripDate = new Date(trip.trip_date);
        return tripDate >= new Date(filters.startDate) && tripDate <= new Date(filters.endDate);
      });
    }

    result.sort((a, b) => sortOrder === "asc" ? new Date(a.trip_date) - new Date(b.trip_date) : new Date(b.trip_date) - new Date(a.trip_date));
    
    return result;
  }, [trips, searchQuery, filters, sortOrder]);

  const exportToExcel = () => {
    const exportData = filteredTrips.map(trip => {
      let formattedTrip = {};
      Object.keys(initialTripState).forEach(key => {
        formattedTrip[initialTripState[key]] = trip[key];
      });
      return formattedTrip;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
    worksheet['!direction'] = "rtl";
    worksheet['!cols'] = new Array(Object.keys(initialTripState).length).fill({ wch: 20 }).reverse();
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips Data");
    XLSX.writeFile(workbook, "trips_data.xlsx");
  };

  return (
    <div>
      <div className="search-filter-bar">
        <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <label> البدء:</label>
        <input type="date" name="startDate" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <label> الانتهاء:</label>
        <input type="date" name="endDate" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
    
        <button className="export-btn" onClick={exportToExcel}>Export to Excel</button>
      </div>

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
          {filteredTrips.map((trip) => (
            <tr key={trip.id}>
              {Object.keys(initialTripState).map((key) => (
                <td key={key}>{trip[key]}</td>
              ))}
              <td>
                <button onClick={() => console.log("Edit", trip.id)}>تعديل</button>
                <button onClick={() => console.log("Delete", trip.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripFilterSortComp1;
