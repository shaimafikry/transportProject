import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";

const Users = () => {
  const [usersView, setUsersView] = useState("");
  const [users, setUsers] = useState([]);

  const initialUserState = {
    username: "الاسم",
    email: "الايميل",
    phone: "رقم الموبايل",
    role: "الوظيفة",
    password: "كلمة السر"
  };

  const [newUser, setNewUser] = useState(
    Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""]))
  );

  const fetchUsers = async () => {
    try {
      const data = await fetchData("dashboard?action=users");
      setUsers(Array.isArray(data.users) ? data.users.map(user => ({ ...user, isEditing: false })) : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    setUsersView("");
    fetchUsers();
  }, []);

  const handleUserChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
  };

  const handleEditUserChange = (id, field, value) => {
    setUsers(users.map(user => (user.id === id ? { ...user, [field]: value } : user)));
  };

  const handleAddUser = async () => {
    try {
      const data = await postData("dashboard?action=users-add", newUser);
      setUsers([...users, { ...data, isEditing: false }]);
      setNewUser(Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""])));
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleEditUser = (id) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, isEditing: !user.isEditing } : user)));
  };

  const handleSaveUser = async (id) => {
    try {
      const userToUpdate = users.find((user) => user.id === id);
      const updatedUser = await putData("dashboard?action=users-edit", userToUpdate);

      setUsers(users.map((user) => (user.id === id ? { ...updatedUser, isEditing: false } : user)));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteData("dashboard?action=users-del", { id });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <div className="user-options">
        <button onClick={() => setUsersView("add")}>إضافة مستخدم</button>
        <button onClick={() => { fetchUsers(); setUsersView("edit"); }}>تعديل المستخدمين</button>
      </div>

      {usersView === "add" && (
        <>
          <h2>إضافة مستخدم جديد</h2>
          <div className="dashboard-form-group">
            {Object.entries(initialUserState).map(([key, label]) =>
              key === "role" ? (
                <select key={key} value={newUser[key]} onChange={(e) => handleUserChange(key, e.target.value)}>
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
          <table className="user-table">
            <thead>
              <tr>
                {Object.entries(initialUserState).map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  {user.isEditing ? (
                    <>
                      {Object.keys(initialUserState).map((key) => (
                        <td key={key}>
                          {key === "role" ? (
                            <select value={user[key]} onChange={(e) => handleEditUserChange(user.id, key, e.target.value)}>
                              <option value="data entry">Data Entry</option>
                              <option value="manager">Manager</option>
                            </select>
                          ) : key === "password" ? (
                            <input
                              type="text"
                              value={user[key]}
                              onChange={(e) => handleEditUserChange(user.id, key, e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              value={user[key]}
                              onChange={(e) => handleEditUserChange(user.id, key, e.target.value)}
                            />
                          )}
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
                        <td key={key}>
                          {key === "password" ? "******" : user[key]}
                        </td>
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
