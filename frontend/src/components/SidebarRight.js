import React, { useState } from "react";
import { FaSearch, FaIndustry, FaBuilding, FaUserPlus, FaTruck, FaCar, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 



const SidebarRight = ({role, onSelect}) => {
	const handleLogout = async () => {
    try {
      const response = await fetch("logout", {
        method: "POST",
        credentials: "include", // يضمن إرسال وحذف الكوكيز من المتصفح
      });

      const data = await response.json();
      if (response.ok) {
        console.log("log out successfully")
        window.location.href = "/"; // إعادة توجيه المستخدم لصفحة تسجيل الدخول
      } else {
        alert("فشل تسجيل الخروج");
      }
    } catch (error) {
      console.error("Error logging out:", error);
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
