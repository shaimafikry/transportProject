import React, { useState, useEffect } from "react";
import { postData, fetchData, putData, deleteData } from "../api"; 
import AgentFilter from "./agentFilter";

const Agent = () => {
  const [viewAgents, setViewAgents] = useState("");
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [newAgent, setNewAgent] = useState({
    agent_name: "",
    agent_type: "",
  });
  const [originalAgents, setOriginalAgents] = useState([]);

  // Edit agent
  const handleEditAgent = (id) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === id
		? agent.isEditing
		? { ...agent.originalData, isEditing: false }
		: { ...agent, originalData: { ...agent }, isEditing: true }
	: agent
)
)

		// Update originalAgents
		setOriginalAgents((prevOriginalAgents) =>
			prevOriginalAgents.map((agent) =>
				agent.id === id
					? { ...agent, isEditing: !agent.isEditing, originalData: agent.isEditing ? agent.originalData : { ...agent } }
					: agent
			)
		);
  };

	const handleEditAgentChange = (agentId, field, value) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === agentId ? { ...agent, [field]: value } : agent
      )
    );

    // Update originalAgents
    setOriginalAgents((prevOriginalAgents) =>
      prevOriginalAgents.map((agent) =>
        agent.id === agentId ? { ...agent, [field]: value } : agent
      )
    );
  };

  // Save edited agent
  const handleSaveAgent = async (id) => {
    try {
      const agentToUpdate = agents.find((agent) => agent.id === id);
      if (!agentToUpdate) {
        console.log("No changes to save");
        return;
      }
      const updatedAgent = await putData("dashboard?action=agents-edit", agentToUpdate);

      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.id === id ? { ...updatedAgent, isEditing: false } : agent
        )
      );
      setOriginalAgents((prevOriginalAgents) =>
        prevOriginalAgents.map((agent) =>
          agent.id === id ? { ...updatedAgent, isEditing: false } : agent
        )
      );
      setMessage("تم تعديل بيانات العميل بنجاح");
			setInterval(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating agent:", error);
      setErrMessage();
			setInterval(() => {
        setErrMessage("العميل موجود مسبقا");
      }, 5000);
    }
  };

  // Delete agent
  const handleDeleteAgent = async (id) => {
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا العميل؟");
    if (!confirmDelete) return;
    try {
      await deleteData("dashboard?action=agents-del", { id });
      setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== id));
			window.alert('تم حذف المستخدم بنجاح');
			setInterval(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error deleting agent:", error);
      setErrMessage(`${error.message}`);
			setInterval(() => {
        setErrMessage("");
      }, 5000);

    }
  };

  // Add a new agent
  const addAgent = async () => {
    if (!newAgent.agent_name || !newAgent.agent_type) {
      setErrMessage("جميع الحقول مطلوبة، لا يمكن إضافة بيانات فارغة");
      return;
    }
    try {
      await postData("dashboard?action=agents-add", newAgent);
      setNewAgent({ agent_name: "", agent_type: "" });
      fetchAgents();
      setMessage("تم اضافة العميل بنجاح");
      setInterval(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding agent:", error);
      setErrMessage("المنظمة موجودة مسبقا");
      setInterval(() => {
        setErrMessage("");
      }, 5000);
    }
  };

  // Fetch agents data from API
  const fetchAgents = async () => {
    try {
      const data = await fetchData("dashboard?action=agents");
      setAgents(Array.isArray(data.agents) ? data.agents : []);
      setOriginalAgents(data.agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    }
  };

  // Handle search results from AgentFilter
  const handleSearch = (searchResults) => {
    setAgents(searchResults);
  };

  useEffect(() => {
    if (viewAgents === "show") {
      fetchAgents();
    }
  }, [viewAgents]);

  return (
    <>
      <h2>العملاء</h2>
      <div className="driver-options">
        <button onClick={() => { setViewAgents("add"); setMessage(""); setErrMessage(""); }}>إضافة عميل</button>
        <button onClick={() => { setViewAgents("show"); setMessage(""); setErrMessage(""); }}>عرض العملاء</button>
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
                onChange={(e) => setNewAgent({ ...newAgent, agent_name: e.target.value })}
              />
              <label htmlFor="agent_type">نوع العميل</label>
              <select
                id="agent_type"
                value={newAgent.agent_type}
                onChange={(e) => setNewAgent({ ...newAgent, agent_type: e.target.value })}
              >
                <option value="">اختر نوع العميل</option>
                <option value="تجاري">تجاري</option>
                <option value="منظمة">منظمة</option>
              </select>
            </div>
          {message && <p className="suc-message">{message}</p>}
          {errMessage && <p className="err-message">{errMessage}</p>}
            <button onClick={addAgent}>حفظ</button>
          </div>
        </>
      )}

      {viewAgents === "show" && <AgentFilter agents={originalAgents} onSearch={handleSearch} />}

      {viewAgents === "show" && (
        <>
          <table className="agent-table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>نوع العميل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  {agent.isEditing ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={agent.agent_name}
                          onChange={(e) => 
														handleEditAgentChange(agent.id,"agent_name", e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={agent.agent_type}
                          onChange={(e) => 
														handleEditAgentChange(agent.id, "agent_type", e.target.value)}
                        >
                          <option value="تجاري">تجاري</option>
                          <option value="منظمة">منظمة</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleSaveAgent(agent.id)}>حفظ</button>
                        <button onClick={() => handleDeleteAgent(agent.id)}>حذف</button>
                        <button onClick={() => handleEditAgent(agent.id)}>إلغاء</button>
												{message && <p className="suc-message">{message}</p>}
												{errMessage && <p className="err-message">{errMessage}</p>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{agent.agent_name}</td>
                      <td>{agent.agent_type}</td>
                      <td>
                        <button onClick={() => handleEditAgent(agent.id)}>تعديل</button>
                      </td>
                    </>
                  )}
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
