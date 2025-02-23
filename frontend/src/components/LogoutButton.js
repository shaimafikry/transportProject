import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton = () => {
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
    <button  onClick={handleLogout}>
      <FaSignOutAlt />
    </button>
  );
};

export default LogoutButton;
