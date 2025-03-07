import React, { useEffect, useState } from 'react';
import SidebarRight from "./SidebarRight";
import Content from "./Content";
import './Dashboard.css';
 

function Dashboard() {

	
const [selectedSection, setSelectedSection] = useState(null);
const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
	console.log(role);


return (
	<div className="container-fluid">
		<SidebarRight  role={role} onSelect={setSelectedSection}/>
		<Content selected={selectedSection} />
	</div>
);
};

export default Dashboard;
