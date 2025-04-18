import { FaIndustry, FaUserPlus, FaTruck, FaRegBuilding, FaUser, FaSignOutAlt } from "react-icons/fa"; 
import { postData } from "../api";
import { useNavigate } from "react-router-dom";



const SidebarRight = ({role, onSelect}) => {
	const navigate = useNavigate();
	const handleLogout = async () => {
    try {
      const response = await postData("logout"); // `response` is just JSON, not full response
  
        console.log("Logout successful:", response.message);
        sessionStorage.removeItem("token"); // حذف التوكن من التخزين المؤقت
        window.location.href = "/"; // ✅ Redirect to login
    } catch (error) {
      console.error(`${error.messasge}`);
    }
  };

  return (
    <div 
      className={"sidebar-right"} >
        <>
				<img src="/logo.jpg" alt="Logo"/>
          {/* <button onClick={() => onSelect("add-comp1")} title="المحاجر">
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
           <>
					 <button onClick={() => onSelect("users")} title="الموظفين">
							 <FaUserPlus />الموظفين
					 </button>
					 <button onClick={() => onSelect("attendance")} title="الحضور والانصراف">
							 <FaUserPlus />الحضور والانصراف
					 </button> */}
            <button onClick={() => navigate("/dashboard/construct")} title="المحاجر">
            <FaIndustry /> المحاجر
          </button>
          <button onClick={() => navigate("/dashboard/transport")} title="النقل">
            <FaTruck /> النقل
          </button>
          <button onClick={() => navigate("/dashboard/drivers")} title="السائقين">
            <FaUserPlus />السائقين
          </button>
          <button onClick={() => navigate("/dashboard/orgs")} title="العملاء">
            <FaRegBuilding />العملاء
          </button>
					{role === "manager" && (
           <>
					 <button onClick={() => navigate("/dashboard/users")} title="الموظفين">
							 <FaUserPlus />الموظفين
					 </button>
					 <button onClick={() => navigate("/dashboard/attendance")} title="الحضور والانصراف">
							 <FaUserPlus />الحضور والانصراف
					 </button>
			 </>

          )}

          <button onClick={() => navigate("/dashboard/profile")} title="الملف الشخصي">
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
