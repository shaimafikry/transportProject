import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";

const initialDriverState = {
  leader_name: "اسم المندوب",
  driver_name: "اسم السائق",
  phone_number: "رقم التليفون",
  national_id: "الرقم القومي",
  passport_number: "رقم الجواز",
  company: "الشركة",
  trip_num: "عدد الرحلات",
  price: "الحساب الكلي",
  remaining_money_fees: "الحساب المتبقي",
};

const DriverFilter = ({ drivers, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    leader_name: "",
    driver_name: "",
    phone_number: "",
    national_id: "",
    passport_number: "",
    company: "",
  });

	const filteredDrivers = useMemo(() => {
		let result = drivers;
	
		if (searchQuery) {
			result = result.filter((driver) => {
				// Safely handle null/undefined values
				const leaderName = driver.leader_name || "";
				const driverName = driver.driver_name || "";
				const phoneNumber = driver.phone_number || "";
				const nationalId = driver.national_id || "";
				const passportNumber = driver.passport_number || "";
				const company = driver.company || "";
	
				return (
					leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					nationalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
					passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					company.toLowerCase().includes(searchQuery.toLowerCase())
				);
			});
		}
	
		// Apply filters
		if (filters.leader_name) {
			result = result.filter((driver) => {
				const leaderName = driver.leader_name || "";
				return leaderName.toLowerCase().includes(filters.leader_name.toLowerCase());
			});
		}
		if (filters.driver_name) {
			result = result.filter((driver) => {
				const driverName = driver.driver_name || "";
				return driverName.toLowerCase().includes(filters.driver_name.toLowerCase());
			});
		}
		if (filters.phone_number) {
			result = result.filter((driver) => {
				const phoneNumber = driver.phone_number || "";
				return phoneNumber.toLowerCase().includes(filters.phone_number.toLowerCase());
			});
		}
		if (filters.national_id) {
			result = result.filter((driver) => {
				const nationalId = driver.national_id || "";
				return nationalId.toLowerCase().includes(filters.national_id.toLowerCase());
			});
		}
		if (filters.passport_number) {
			result = result.filter((driver) => {
				const passportNumber = driver.passport_number || "";
				return passportNumber.toLowerCase().includes(filters.passport_number.toLowerCase());
			});
		}
		if (filters.company) {
			result = result.filter((driver) => {
				const company = driver.company || "";
				return company.toLowerCase().includes(filters.company.toLowerCase());
			});
		}
	
		// Preserve isEditing state for filtered drivers
		return result.map((driver) => ({
			...driver,
			isEditing: drivers.find((t) => t.id === driver.id)?.isEditing || false,
		}));
	}, [drivers, searchQuery, filters]);

  // Trigger search automatically when filteredDrivers changes
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers Data");
    XLSX.writeFile(workbook, "drivers_data.xlsx");
  };

  return (
    <div>
      <div className="user-search-container">
        <input
          type="text"
          placeholder="🔍 البحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
				  <select
          name="company"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        >
          <option value="">تصنيف حسب الشركة</option>
          <option value="النقل">النقل</option>
          <option value="المحاجر">المحاجر</option>
        </select>

        <button className="export-btn" onClick={exportToExcel}>
          حفظ الي ملف اكسيل
        </button>
      </div>
    </div>
  );
};

export default DriverFilter;
