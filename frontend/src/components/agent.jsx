import React, { useState, useEffect } from "react";
import { postData, fetchData } from "../api"; // Import fetchData

const Agent = () => {
  const [viewAgents, setViewAgents] = useState("");
  const [agents, setAgents] = useState([]);
	const [message, setMessage]= useState("");
  const [errMessage, setErrMessage] = useState("");
  const [newAgent, setNewAgent] = useState({
    agent_name: "",
    agent_type: "",
  });

  // Add a new agent
  const addAgent = async () => {

		// Check if any field is empty
		if (newAgent.agent_name === "" || newAgent.agent_type === "") {
			setErrMessage("جميع الحقول مطلوبة، لا يمكن إضافة بيانات فارغة");
			return;
		}
    try {
      const data = await postData("dashboard?action=agents-add", {
        agent_name: newAgent.agent_name,
        agent_type: newAgent.agent_type,
      });
      setNewAgent({ agent_name: "", agent_type: "" }); // Reset the form
      fetchAgents(); // Refresh the agents list
			setMessage("تم اضافة العميل بنجاح");

    } catch (error) {
      console.error("Error adding agent:", error);
			setErrMessage(error.message);


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
		<h2>العملاء</h2>
      <div className="driver-options">
        <button onClick={() => {setViewAgents("add"); setMessage(""); setErrMessage("");}}>إضافة عميل</button>
        <button onClick={() => {setViewAgents("show"); setMessage(""); setErrMessage("");}}>عرض العملاء</button>
      </div>

      {viewAgents === "add" && (
        <>
          <div className="dashboard-form-group">
					<div className="form-field">
					<label htmlFor="agent_name">اسم العميل</label>
            <input
              type="text"
							id="agent_name"
              placeholder="اسم العميل"
              value={newAgent.agent_name}
              onChange={(e) =>
                setNewAgent({ ...newAgent, agent_name: e.target.value })
              }
            />
            <label htmlFor="agent_type">نوع العميل</label>
            <select
						  id="agent_type"
              value={newAgent.agent_type}
              onChange={(e) =>
                setNewAgent({ ...newAgent, agent_type: e.target.value })
              }
            >
              <option value="">اختر نوع العميل</option>
              <option value="تجاري">تجاري</option>
              <option value="منظمة">منظمة</option>
            </select>
						</div>
            <button onClick={addAgent}>حفظ</button>
          </div>
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}
					
        </>
      )}

      {viewAgents === "show" && (
        <>
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
