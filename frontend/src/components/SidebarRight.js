import React, { useState } from "react";
import { FaSearch, FaIndustry, FaBuilding, FaUserPlus, FaTruck, FaCar, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 
import SearchForm from "./SearchForm";


const SidebarRight = ({ role, onSelect }) => {
  const [showSearch, setShowSearch] = useState(false);
	const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
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
      {!showSearch ? (
        <>
          <button onClick={() => setShowSearch(true)} title="البحث">
            <FaSearch /> البحث
          </button>
          <button onClick={() => onSelect("add-comp1")} title="المحاجر">
            <FaIndustry /> المحاجر
          </button>
          <button onClick={() => onSelect("add-comp2")} title="النقل">
            <FaTruck /> النقل
          </button>
          <button onClick={() => onSelect("drivers")} title="اضافة سائق">
            <FaUserPlus /> اضافة سائق
          </button>
          <button onClick={() => onSelect("add-org")} title="اضافة عميل">
            <FaRegBuilding /> اضافة عميل
          </button>
					{role === "manager" && (
            <button onClick={() => onSelect("users")} title="اضافة مستخدم">
              <FaUserPlus /> اضافة مستخدم
            </button>
          )}

          <button title="الملف الشخصي">
            <FaUser /> الملف الشخصي
          </button>
          
          <button onClick={handleLogout}title="تسجيل خروج">
            <FaSignOutAlt /> تسجيل خروج
          </button>
        </>
      ) : (
        <SearchForm onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
};

export default SidebarRight;
