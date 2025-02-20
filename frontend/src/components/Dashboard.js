import React, { useEffect, useState } from 'react';
import SidebarRight from "./SidebarRight";
import Content from "./Content";
import './Dashboard.css';
 

function Dashboard() {

	
const [selectedSection, setSelectedSection] = useState(null);
const [role, setRole] = useState("");

  // ✅ Correctly Fetch Role from sessionStorage
  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

return (
	<div className="container-fluid">
		<SidebarRight onSelect={role, setSelectedSection} />
		<Content selected={selectedSection} />
	</div>
);
};

export default Dashboard;
