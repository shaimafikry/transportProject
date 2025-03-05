import React, { useState } from "react";
import { FaSearch, FaIndustry, FaBuilding, FaUserPlus, FaTruck, FaCar, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 
import { postData } from "../api";



const SidebarRight = ({role, onSelect}) => {
	const handleLogout = async () => {
    try {
      const response = await postData("logout");
        window.location.href = "/"; 
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
