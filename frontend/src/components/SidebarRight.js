import React, { useState } from "react";
import { FaSearch, FaIndustry, FaBuilding, FaUserPlus, FaTruck, FaCar, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 
import { postData } from "../api";



const SidebarRight = ({role, onSelect}) => {
	const handleLogout = async () => {
    try {
      const response = await postData("logout"); // `response` is just JSON, not full response
  
      if (response && response.message) { // ✅ Check if response contains a valid message
        console.log("Logout successful:", response.message);
        sessionStorage.removeItem("token"); // حذف التوكن من التخزين المؤقت
        window.location.href = "/"; // ✅ Redirect to login
      } else {
        console.error("Unexpected logout response:", response);
      }
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div 
      className={"sidebar-right"} >
        <>
				<img src="/logo.jpg" alt="Logo"/>
          <button onClick={() => onSelect("add-comp1")} title="المحاجر">
            <FaIndustry /> المحاجر
          </button>
          <button onClick={() => onSelect("add-comp2")} title="النقل">
            <FaTruck /> النقل
          </button>
          <button onClick={() => onSelect("drivers")} title="السائقين">
            <FaUserPlus />السائقين
          </button>
          <button onClick={() => onSelect("add-org")} title="العملاء">
            <FaRegBuilding />العملاء
          </button>
					{role === "manager" && (
            <button onClick={() => onSelect("users")} title="الموظفين">
              <FaUserPlus />الموظفين</button>
          )}

          <button onClick={() => onSelect("profile")} title="الملف الشخصي">
            <FaUser /> الملف الشخصي
          </button>
          
          <button onClick={handleLogout}title="تسجيل خروج">
            <FaSignOutAlt /> تسجيل خروج
          </button>
        </>
    </div>
  );
};

export default SidebarRight;
