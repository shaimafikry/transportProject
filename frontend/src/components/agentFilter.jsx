import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";



const AgentFilter = ({ agents, onSearch }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState({
		agent_name:"",
		agent_type :""
	});

	const initialAgentState =
	{
		agent_name:"اسم العميل",
		agent_type :"نوع العميل"
	}

	const filteredAgents = useMemo(() => {
		let result = agents;
	
		if (searchQuery) {
			result = result.filter((agent) => {
				// Safely handle null/undefined values
				const agentName = agent.agent_name || "";
				const agentType = agent.agent_type || "";

	
				return (
					agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					agentType.toLowerCase().includes(searchQuery.toLowerCase())
				);
			});
		}
	
		
		if (filters.agent_name) {
			result = result.filter((agent) => {
				const agentName = agent.agent_name || "";
				return agentName.toLowerCase().includes(filters.agent_name.toLowerCase());
			});
		}
		
		if (filters.agent_type) {
			result = result.filter((agent) => {
				const agent_type = agent.agent_type || "";
				return agent_type.toLowerCase().includes(filters.agent_type.toLowerCase());
			});
		}
	
		// Preserve isEditing state for filtered agents
		return result.map((agent) => ({
			...agent,
			isEditing: agents.find((t) => t.id === agent.id)?.isEditing || false,
		}));
	}, [agents, searchQuery, filters]);

	// Trigger search automatically when filteredAgents changes
	useEffect(() => {
		onSearch(filteredAgents);
	}, [filteredAgents, onSearch]);

	const exportToExcel = () => {
		const exportData = filteredAgents.map((agent) => {
			let formattedAgents = {};
			Object.keys(initialAgentState).forEach((key) => {
				formattedAgents[initialAgentState[key]] = agent[key];
			});
			return formattedAgents;
		});

		const worksheet = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });
		worksheet["!direction"] = "rtl";
		worksheet["!cols"] = new Array(Object.keys(initialAgentState).length)
			.fill({ wch: 20 })
			.reverse();

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Agents Data");
		XLSX.writeFile(workbook, "agents_data.xlsx");
	};

	return (
		<div>
			<div className="user-search-container">
				<input
					type="text"
					placeholder="🔍 البحث..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
					<select
					name="agent_type"
					value={filters.agent_type}
					onChange={(e) => setFilters({ ...filters, agent_type: e.target.value })}
				>
					<option value="">تصنيف حسب نوع العميل</option>
					<option value="تجاري">تجاري</option>
					<option value="منظمة">منظمة</option>
				</select>

				<button className="export-btn" onClick={exportToExcel}>
					حفظ الي ملف اكسيل
				</button>
			</div>
		</div>
	);
};

export default AgentFilter;
