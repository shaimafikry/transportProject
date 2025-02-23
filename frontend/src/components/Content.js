import React, { useState, useEffect } from "react";
import Comp2 from "./comp2.jsx";
import Comp1 from "./comp1.jsx";
import Users from "./users.jsx";
import Drivers from "./drivers.jsx";
import Agent from "./agent.jsx"



const Content = ({ selected }) => {


  return (
    <div className="content">

      {/* Add Trip Section - Main Buttons */}
			{selected === "add-comp1" && <Comp1 />}

      {selected === "add-comp2" && <Comp2 />}

			{/* Add Organization Section */}
      {selected === "add-org" && <Agent />}

      {selected === "drivers" && <Drivers />}

      {selected === "users" && <Users />}

      {!selected && <h2>Ahmed Shaban Cor</h2>}
    </div>
  );
};

export default Content;
