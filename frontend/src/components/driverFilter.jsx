import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";

const initialDriverState = {
  leader_name: "اسم المندوب" ,
		driver_name: "اسم السائق" ,
		phone_number: "رقم التليفون" ,
		national_id: "الرقم القومي" ,
		passport_number: "رقم الجواز " ,
		company: "الشركة" ,
		trip_num:"عدد الرحلات" ,
		price: "الحساب الكلي",
		remaining_money_fees: "الحساب المتبقي",
};

const DriverFilter = ({ drivers, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
		leader_name: "اسم المندوب" ,
		driver_name: "اسم السائق" ,
		phone_number: "رقم التليفون" ,
		national_id: "الرقم القومي" ,
		passport_number: "رقم الجواز " ,
		company: "الشركة" ,
  });


  const filteredDrivers = useMemo(() => {
    let result = drivers;

    if (searchQuery) {
      result = result.filter(
        (driver) =>
          driver.leader_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				driver.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				driver.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.national_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.passport_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.leader_name) {
      result = result.filter((driver) =>
        driver.leader_name.toLowerCase().includes(filters.leader_name.toLowerCase())
      );
    }
    if (filters.driver_name) {
      result = result.filter((driver) =>
        driver.driver_name.toLowerCase().includes(filters.driver_name.toLowerCase())
      );
    }
    if (filters.phone_number) {
      result = result.filter((driver) =>
        driver.phone_number.toLowerCase().includes(filters.phone_number.toLowerCase())
      );
    }

		if (filters.national_id) {
      result = result.filter((driver) =>
        driver.national_id.toLowerCase().includes(filters.national_id.toLowerCase())
      );
    }
		if (filters.passport_number) {
      result = result.filter((driver) =>
        driver.passport_number.toLowerCase().includes(filters.passport_number.toLowerCase())
      );
    }

		if (filters.company) {
      result = result.filter((driver) =>
        driver.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }


      // Preserve isEditing state for filtered drivers
  return result.map((driver) => ({
    ...driver,
    isEditing: drivers.find((t) => t.id === driver.id)?.isEditing || false,
  }));
}, [drivers, searchQuery, filters]);

  // Trigger search automatically when filteredTrips changes
  useEffect(() => {
    onSearch(filteredDrivers);
  }, [filteredDrivers, onSearch]);

  const exportToExcel = () => {
    const exportData = filteredDrivers.map((driver) => {
      let formattedDrivers = {};
      Object.keys(initialDriverState).forEach((key) => {
        formattedDrivers[initialDriverState[key]] = driver[key];
      });
      return formattedDrivers;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
    worksheet["!direction"] = "rtl";
    worksheet["!cols"] = new Array(Object.keys(initialDriverState).length)
      .fill({ wch: 20 })
      .reverse();

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips Data");
    XLSX.writeFile(workbook, "drivers_data.xlsx");
  };

  return (
    <div>
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="🔍 البحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="export-btn" onClick={exportToExcel}>
          حفظ الي ملف اكسيل
        </button>
      </div>
    </div>
  );
};

export default DriverFilter;
