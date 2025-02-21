import React, { useState, useEffect } from "react";
import Comp2 from "./comp2.jsx";
import Comp1 from "./comp1.jsx";
import Users from "./users.jsx";


import { login } from '../api';


const Content = ({ selected }) => {

  const initialLead = { name: "", phone: "", nationalID: "", drivers: [] };
  const initialDriver = { lead: "", name: "", phone: "", nationalID: "" };
  const initialCar = { type: "", number: "", letters: "" };
  const initialOrganization = { name: "", type: "" };


  // const [trips, setTrips] = useState([initialTrip]);
  const [leads, setLeads] = useState([initialLead]);
  const [organizations, setOrganizations] = useState([initialOrganization]);
  const [leadOptions, setLeadOptions] = useState([]);

 // useEffect(() => {
//    setLeadOptions(["Ahmed", "Mohamed", "Sara"]);
//  }, []);


	useEffect(() => {
    setLeads([initialLead]);
    setOrganizations([initialOrganization]);
  }, [selected]);

  const handleInputChange = (setter, index, field, value) => {
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };




  return (
    <div className="content">

      {/* Add Trip Section - Main Buttons */}
			{selected === "add-comp1" && <Comp1 />}

      {selected === "add-comp2" && <Comp2 />}

      {/* Add Lead Section */}
      {selected === "add-lead" && (
        <>
          <h2>إضافة مندوب</h2>
          {leads.map((lead, index) => (
            <div key={index} className="dashboard-form-group">
              <input type="text" placeholder="اسم المندوب" value={lead.name} onChange={(e) => handleInputChange(setLeads, index, "name", e.target.value)} />
              <input type="text" placeholder="رقم الموبايل" value={lead.phone} onChange={(e) => handleInputChange(setLeads, index, "phone", e.target.value)} />
              <input type="text" placeholder="الرقم القومي" value={lead.nationalID} onChange={(e) => handleInputChange(setLeads, index, "nationalID", e.target.value)} />
            </div>
          ))}
          <button onClick={() => setLeads([...leads, initialLead])}>Add More</button>
          <button className="save-btn">Save</button>
        </>
      )}


			{/* Add Organization Section */}
      {selected === "add-org" && (
        <>
          <h2>إضافة منظمة</h2>
          {organizations.map((org, index) => (
            <div key={index} className="dashboard-form-group">
              <input type="text" placeholder="اسم المنظمة" />
              <input type="text" placeholder="نوع المنظمة" />
            </div>
          ))}
          <button onClick={() => setOrganizations([...organizations, initialOrganization])}>Add More</button>
          <button className="save-btn">Save</button>
        </>
      )}

      {selected === "users" && <Users />}



      {!selected && <h2>مرحبا...</h2>}
    </div>
  );
};

export default Content;
