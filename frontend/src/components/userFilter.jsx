import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";

const initialUserState = {
	username: "اسم المستخدم",
	name: "الاسم الكلي",
  phone: "رقم الموبايل",
  role: "الوظيفة",
  password: "كلمة السر",
};

const UserFilter = ({ users, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    username: "",
    name: "",
    phone: "",
    role: "",
  });

  const filteredUsers = useMemo(() => {
    let result = users;

    // Apply search query filter
    if (searchQuery) {
      result = result.filter((user) => {
        const username = user.username || "";
        const name = user.name || "";
        const phone = user.phone || "";
        const role = user.role || "";

        return (
          username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply filters
    if (filters.username) {
      result = result.filter((user) => {
        const username = user.username || "";
        return username.toLowerCase().includes(filters.username.toLowerCase());
      });
    }
    if (filters.name) {
      result = result.filter((user) => {
        const name = user.name || "";
        return name.toLowerCase().includes(filters.name.toLowerCase());
      });
    }
    if (filters.phone) {
      result = result.filter((user) => {
        const phone = user.phone || "";
        return phone.toLowerCase().includes(filters.phone.toLowerCase());
      });
    }
    if (filters.role) {
      result = result.filter((user) => {
        const role = user.role || "";
        return role.toLowerCase().includes(filters.role.toLowerCase());
      });
    }

    // Preserve isEditing state for filtered users
    return result.map((user) => ({
      ...user,
      isEditing: users.find((u) => u.id === user.id)?.isEditing || false,
    }));
  }, [users, searchQuery, filters]);

  // Trigger search automatically when filteredUsers changes
  useEffect(() => {
    onSearch(filteredUsers);
  }, [filteredUsers, onSearch]);

  const exportToExcel = () => {
    const exportData = filteredUsers.map((user) => {
      let formattedUser = {};
      Object.keys(initialUserState).forEach((key) => {
        formattedUser[initialUserState[key]] = user[key];
      });
      return formattedUser;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
    worksheet["!direction"] = "rtl";
    worksheet["!cols"] = new Array(Object.keys(initialUserState).length)
      .fill({ wch: 20 })
      .reverse();

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");
    XLSX.writeFile(workbook, "users_data.xlsx");
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
          name="role"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">  الوظيفة</option>
          <option value="data entry">Data Entry</option>
          <option value="manager">Manager</option>
        </select>

        <button className="export-btn" onClick={exportToExcel}>
          حفظ إلى ملف إكسيل
        </button>
      </div>
    </div>
  );
};

export default UserFilter;
