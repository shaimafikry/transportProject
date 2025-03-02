import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import UserFilter from "./userFilter";

const Users = ({ showFilter, onSearchClick }) => {
  const [usersView, setUsersView] = useState("");
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editedFields, setEditedFields] = useState({}); // Track edited fields

  const initialUserState = {
    username: "اسم المستخدم",
    name: "الاسم الكلي",
    phone: "رقم الموبايل",
    role: "الوظيفة",
    password: "كلمة السر",
  };

  const [newUser, setNewUser] = useState(
    Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""]))
  );

  const signedInUsername = sessionStorage.getItem("username");
  console.log(signedInUsername);

  const fetchUsers = async () => {
    try {
      const data = await fetchData("dashboard?action=users");

      setUsers(
        Array.isArray(data.users)
          ? data.users.map((user) => ({ ...user, isEditing: false }))
          : []
      );
      setOriginalUsers(data.users);
      setIsSearching(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    setUsersView("");
    fetchUsers();
  }, [onSearchClick]);

  const handleSearch = (searchResults) => {
    setUsers(searchResults);
    setIsSearching(true);
  };

  const resetSearch = () => {
    setUsers(originalUsers);
    setIsSearching(false);
  };

  const handleUserChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
  };

  const handleEditUserChange = (id, field, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );

    // Track edited fields
    setEditedFields((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

    // Update originalUsers
    setOriginalUsers((prevOriginalUsers) =>
      prevOriginalUsers.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );
  };

  const handleAddUser = async () => {
    try {
      const data = await postData("dashboard?action=users-add", newUser);
      setUsers([...users, { ...data, isEditing: false }]);
      setNewUser(
        Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""]))
      );
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleEditUser = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? user.isEditing
            ? { ...user.originalData, isEditing: false }
            : { ...user, originalData: { ...user }, isEditing: true }
          : user
      )
    );

    // Update originalUsers
    setOriginalUsers((prevOriginalUsers) =>
      prevOriginalUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              isEditing: !user.isEditing,
              originalData: user.isEditing ? user.originalData : { ...user },
            }
          : user
      )
    );
  };

  const handleSaveUser = async (id) => {
    try {
      const fieldsToUpdate = editedFields[id] || {}; // Get edited fields for this user
      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log("No changes to save");
        return;
      }

      // Send only the edited fields and the user ID to the backend
      const dataToUpdate = { id, ...fieldsToUpdate };
      const updatedUser = await putData("dashboard?action=users-edit", dataToUpdate);

      // Update the user in the state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, ...updatedUser, isEditing: false } : user
        )
      );

      // Update originalUsers
      setOriginalUsers((prevOriginalUsers) =>
        prevOriginalUsers.map((user) =>
          user.id === id ? { ...updatedUser, isEditing: false } : user
        )
      );

      // Clear edited fields for this user
      setEditedFields((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteData("dashboard?action=users-del", { id });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      // Update originalUsers
      setOriginalUsers((prevOriginalUsers) =>
        prevOriginalUsers.filter((user) => user.id !== id)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    if (!showFilter) {
      resetSearch();
    } else {
      setUsersView("edit");
    }
  }, [showFilter]);

  // Filter out the signed-in user
  const filteredUsers = users.filter((user) => user.username !== signedInUsername);

  return (
    <>
      <div className="user-options">
        <button onClick={() => setUsersView("add")}>إضافة مستخدم</button>
        <button onClick={() => { fetchUsers(); setUsersView("edit"); }}>
          تعديل المستخدمين
        </button>
      </div>

      {showFilter && usersView !== "add" && (
        <UserFilter users={originalUsers} onSearch={handleSearch} />
      )}

      {usersView === "add" && (
        <>
          <h2>إضافة مستخدم جديد</h2>
          <div className="dashboard-form-group">
            {Object.entries(initialUserState).map(([key, label]) =>
              key === "role" ? (
                <select
                  key={key}
                  value={newUser[key]}
                  onChange={(e) => handleUserChange(key, e.target.value)}
                >
                  <option value="">اختر الوظيفة</option>
                  <option value="data entry">Data Entry</option>
                  <option value="manager">Manager</option>
                </select>
              ) : key === "password" ? (
                <input
                  key={key}
                  type="password"
                  placeholder={label}
                  value={newUser[key]}
                  onChange={(e) => handleUserChange(key, e.target.value)}
                />
              ) : (
                <input
                  key={key}
                  type="text"
                  placeholder={label}
                  value={newUser[key]}
                  onChange={(e) => handleUserChange(key, e.target.value)}
                />
              )
            )}
          </div>
          <button onClick={handleAddUser}>حفظ المستخدم</button>
        </>
      )}

      {usersView === "edit" && (
        <>
          <h2>تعديل المستخدمين</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.entries(initialUserState).map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {user.isEditing ? (
                      <>
                        {Object.keys(initialUserState).map((key) => (
                          <td key={key}>
                            {key === "role" ? (
                              <select
                                value={user[key]}
                                onChange={(e) =>
                                  handleEditUserChange(user.id, key, e.target.value)
                                }
                              >
                                <option value="data entry">Data Entry</option>
                                <option value="manager">Manager</option>
                              </select>
                            ) : key === "password" ? (
                              <input
                                type="text"
                                value={user[key]}
                                onChange={(e) =>
                                  handleEditUserChange(user.id, key, e.target.value)
                                }
                              />
                            ) : (
                              <input
                                type="text"
                                value={user[key]}
                                onChange={(e) =>
                                  handleEditUserChange(user.id, key, e.target.value)
                                }
                              />
                            )}
                          </td>
                        ))}
                        <td>
                          <button onClick={() => handleSaveUser(user.id)}>
                            حفظ
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)}>
                            حذف
                          </button>
                          <button onClick={() => handleEditUser(user.id)}>
                            إلغاء
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {Object.keys(initialUserState).map((key) => (
                          <td key={key}>{user[key]}</td>
                        ))}
                        <td>
                          <button onClick={() => handleEditUser(user.id)}>
                            تعديل
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default Users;
