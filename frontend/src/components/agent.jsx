import React, { useState, useEffect } from "react";
import { postData, fetchData } from "../api"; // Import fetchData

const Agent = () => {
  const [viewAgents, setViewAgents] = useState("");
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({
    agent_name: "",
    agent_type: "",
  });

  // Add a new agent
  const addAgent = async () => {
    try {
      const data = await postData("dashboard?action=agents-add", {
        agent_name: newAgent.agent_name,
        agent_type: newAgent.agent_type,
      });
      setNewAgent({ agent_name: "", agent_type: "" }); // Reset the form
      fetchAgents(); // Refresh the agents list
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  // Fetch agents data from API
  const fetchAgents = async () => {
    try {
      const data = await fetchData("dashboard?action=agents");
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    }
  };

  useEffect(() => {
    if (viewAgents === "show") {
      fetchAgents(); // Fetch agents when the "show" view is active
    }
  }, [viewAgents]);

  return (
    <>
      <div className="driver-options">
        <button onClick={() => setViewAgents("add")}>إضافة منظمة</button>
        <button onClick={() => setViewAgents("show")}>عرض المنظمات</button>
      </div>

      {viewAgents === "add" && (
        <>
          <h2>اضافة عميل</h2>
          <div className="dashboard-form-group">
            <input
              type="text"
              placeholder="اسم العميل"
              value={newAgent.agent_name}
              onChange={(e) =>
                setNewAgent({ ...newAgent, agent_name: e.target.value })
              }
            />

            <select
              value={newAgent.agent_type}
              onChange={(e) =>
                setNewAgent({ ...newAgent, agent_type: e.target.value })
              }
            >
              <option value="">اختر نوع العميل</option>
              <option value="تجاري">تجاري</option>
              <option value="منظمة">منظمة</option>
            </select>
            <button onClick={addAgent}>حفظ</button>
          </div>
        </>
      )}

      {viewAgents === "show" && (
        <>
          <h2>العملاء</h2>
          <table className="driver-table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>نوع العميل</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.agent_name}</td>
                  <td>{agent.agent_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};

export default Agent;
