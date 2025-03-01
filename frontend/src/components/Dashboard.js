import React, { useEffect, useState } from 'react';
import SidebarRight from "./SidebarRight";
import Content from "./Content";
import './Dashboard.css';
 

function Dashboard() {

	
const [selectedSection, setSelectedSection] = useState(null);
const [showFilter, setShowFilter] = useState(false);
const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
	console.log(role);

  const toggleFilter = () => {
    setShowFilter((prev) => !prev);
  };

return (
	<div className="container-fluid">
		<SidebarRight  role={role} onSelect={setSelectedSection} onSearch={toggleFilter} />
		<Content selected={selectedSection} showFilter={showFilter} onSearchClick={toggleFilter} />
	</div>
);
};

export default Dashboard;
