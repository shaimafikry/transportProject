import React, { useState } from "react";
import { FaSearch, FaIndustry, FaBuilding, FaUserPlus, FaTruck, FaCar, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 
import SearchForm from "./SearchForm";
import LogoutButton from "./LogoutButton";


const SidebarRight = ({ role, onSelect }) => {
  const [showSearch, setShowSearch] = useState(false);

  const [expanded, setExpanded] = useState(false); // Expand on hover

  return (
    <div 
      className={`sidebar-right ${expanded ? "expanded" : ""}`} 
      onMouseEnter={() => setExpanded(true)} 
      onMouseLeave={() => setExpanded(false)}
    >
      {!showSearch ? (
        <>
          <button onClick={() => setShowSearch(true)} title="البحث">
            <FaSearch />
          </button>
          <button onClick={() => onSelect("add-comp1")} title="المحاجر">
            <FaIndustry />
          </button>
          <button onClick={() => onSelect("add-comp2")} title="النقل">
            <FaTruck />
          </button>
          <button onClick={() => onSelect("add-lead")} title="اضافة مندوب">
            <FaUserPlus />
          </button>
          <button onClick={() => onSelect("add-org")} title="اضافة منظمة">
            <FaRegBuilding />
          </button>
					{role === "manager" && (
            <button onClick={() => onSelect("users")} title="اضافة مستخدم">
              <FaUserPlus />
            </button>
          )}

          <button title="الملف الشخصي">
            <FaUser />
          </button>
          
          <button title="تسجيل خروج">
            <LogoutButton />
            <FaSignOutAlt />
          </button>
        </>
      ) : (
        <SearchForm onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
};

export default SidebarRight;
