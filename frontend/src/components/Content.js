import React, { useState, useEffect } from "react";
import Comp2 from "./comp2.jsx";
import Comp1 from "./comp1.jsx";
import Users from "./users.jsx";
import Drivers from "./drivers.jsx";
import Agent from "./agent.jsx"
import Profile from "./profile.jsx"


const Content = ({ selected, showFilter, onSearchClick }) => {


  return (
    <div className="content">

      {/* Add Trip Section - Main Buttons */}
			{selected === "add-comp1" && <Comp1 showFilter={showFilter} onSearchClick={onSearchClick} />}

      {selected === "add-comp2" && <Comp2 showFilter={showFilter} />}

      {selected === "profile" && <Profile />}

			{/* Add Organization Section */}
      {selected === "add-org" && <Agent />}

      {selected === "drivers" && <Drivers showFilter={showFilter} />}

      {selected === "users" && <Users />}

      {!selected && ( <div className="fixed inset-0 flex items-center justify-center">
    <h2 className="text-6xl font-extrabold text-purple-600 tracking-wide" style={{ fontFamily: 'Lobster, cursive' }}>
      Ahmed Shaban Cor
    </h2>
  </div>)}
    </div>
  );
};

export default Content;
