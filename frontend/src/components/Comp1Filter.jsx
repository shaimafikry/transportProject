import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import './search.css'

const initialTripState = {
  bon_number: "رقم البون",
  driver_name: "اسم السائق",
  car_number: "رقم السيارة",
  quantity: "الكمية",
  trip_date: "تاريخ التحميل",
  price: "السعر",
};

const TripFilterSortComp1 = ({ trips, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    driver_name: "",
    car_number: "",
    bon_number: "",
    startDate: "",
    endDate: "",
  });

  // Automatically filter trips when searchQuery or filters change
  const filteredTrips = useMemo(() => {
    let result = trips;

    if (searchQuery) {
      result = result.filter(
        (trip) =>
          trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.car_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.bon_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.added_by.toLowerCase().includes(searchQuery.toLowerCase())

      );
    }

    if (filters.driver_name) {
      result = result.filter((trip) =>
        trip.driver_name.toLowerCase().includes(filters.driver_name.toLowerCase())
      );
    }
    if (filters.car_number) {
      result = result.filter((trip) =>
        trip.car_number.toLowerCase().includes(filters.car_number.toLowerCase())
      );
    }
    if (filters.bon_number) {
      result = result.filter((trip) =>
        trip.bon_number.toLowerCase().includes(filters.bon_number.toLowerCase())
      );
    }
		if (filters.added_by) {
      result = result.filter((trip) =>
        trip.added_by.toLowerCase().includes(filters.added_by.toLowerCase())
      );
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter((trip) => {
        const tripDate = new Date(trip.trip_date);
        return (
          tripDate >= new Date(filters.startDate) &&
          tripDate <= new Date(filters.endDate)
        );
      });
    }

      // Preserve isEditing state for filtered trips
  return result.map((trip) => ({
    ...trip,
    isEditing: trips.find((t) => t.id === trip.id)?.isEditing || false,
  }));
}, [trips, searchQuery, filters]);

  // Trigger search automatically when filteredTrips changes
  useEffect(() => {
    onSearch(filteredTrips);
  }, [filteredTrips, onSearch]);

  const exportToExcel = () => {
    const exportData = filteredTrips.map((trip) => {
      let formattedTrip = {};
      Object.keys(initialTripState).forEach((key) => {
        formattedTrip[initialTripState[key]] = trip[key];
      });
      return formattedTrip;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
    worksheet["!direction"] = "rtl";
    worksheet["!cols"] = new Array(Object.keys(initialTripState).length)
      .fill({ wch: 20 })
      .reverse();

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips Data");
    XLSX.writeFile(workbook, "trips_data.xlsx");
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 البحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

        <button className="export-btn" onClick={exportToExcel}>
          حفظ الي ملف اكسيل
        </button>
      </div>
    </div>
  );
};

export default TripFilterSortComp1;
