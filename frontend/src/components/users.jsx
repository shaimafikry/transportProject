import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";

const Users = () => {
  const [usersView, setUsersView] = useState("");
	const [users, setUsers] = useState([]);

	
  const initialUserState = {
    username: "الاسم",
    email: "الايميل",
    phoneNumber: "رقم الموبايل",
    password: "كلمة السر",
		role : "الوظيفة"
  };

	

  const [newUser, setNewUser] = useState(
    Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""]))
  );


	const fetchUsers = async () => {
			try {
				const data = await fetchData("dashboard?action=users");
				setUsers(data);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

  useEffect(() => {
    setUsersView("");
		fetchUsers();
	}, []);

  // Handle user input changes
  const handleUserChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
  };



	// Add a new user
  const handleAddUser = async () => {
    try {
      const data = await postData("dashboard?action=user-add", newUser);
      setUsers([...users, data]);
      setNewUser({ ...initialUserState });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Toggle edit mode for a user
  const handleEditUser = (id) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, isEditing: !user.isEditing } : user)));
  };

	// Update user
  const handleSaveUser = async (id) => {
    try {
      const userToUpdate = users.find((user) => user.id === id);
      const data = await putData(`dashboard?action=user-edit/${id}`, userToUpdate);
      setUsers(users.map((user) => (user.id === id ? data : user)));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };


	// Delete user
  const handleDeleteUser = async (id) => {
    try {
      await deleteData(`dashboard?action=user-del/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <div className="user-options">
        <button onClick={() => setUsersView("add")}>إضافة مستخدم</button>
        <button onClick={() => setUsersView("edit")}>تعديل المستخدمين</button>
      </div>

      {viewUsers === "add" && (
        <>
          <h2>إضافة مستخدم جديد</h2>
          <div className="dashboard-form-group">
					{Object.entries(initialUserState).map(([key, label]) =>
        key === "role" ? (
          // Role Dropdown for "data entry" & "manager"
          <select
            key={key}
            value={newUserComp2[key]}
            onChange={(e) => handleUserChange(key, e.target.value)}
          >
            <option value="data entry">Data Entry</option>
            <option value="manager">Manager</option>
          </select>
        ) : (
          // Regular Input Fields
          <input
            key={key}
            type={key.includes("Date") ? "date" : "text"}
            placeholder={label}
            value={newUserComp2[key]}
            onChange={(e) => handleUserChange(key, e.target.value)}
          />
        )
      )}
    </div>
    <button onClick={handleAddUser}>حفظ المستخدم</button>
  </>
)}
      {viewUsers === "edit" && (
        <>
          <h2>تعديل المستخدمين</h2>
          <table className="user-table">
            <thead>
              <tr>
                {Object.values(initialUserState).map((label, index) => (
                  <th key={index}>{label}</th>
                ))}
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {usersComp2.map((user) => (
                <tr key={user.id}>
                  {user.isEditing ? (
                    <>
                      {Object.keys(initialUserState).map((key) => (
                        <td key={key}>
                          <input type={key.includes("Date") ? "date" : "text"} defaultValue={user[key]} />
                        </td>
                      ))}
                      <td>
                        <button onClick={() => handleSaveUser(user.id)}>حفظ</button>
                        <button onClick={() => handleDeleteUser(user.id)}>حذف</button>
                        <button onClick={() => handleEditUser(user.id)}>إلغاء</button>
                      </td>
                    </>
                  ) : (
                    <>
                      {Object.keys(initialUserState).map((key) => (
                        <td key={key}>{user[key]}</td>
                      ))}
                      <td>
                        <button onClick={() => handleEditUser(user.id)}>تعديل</button>
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

export default Users;
