import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData} from "../api";
import UserFilter from "./userFilter";

const Users = () => {
  const [usersView, setUsersView] = useState("");
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editedFields, setEditedFields] = useState({}); // Track edited fields
	const [message, setMessage]= useState("");
	const [errMessage, setErrMessage] = useState("");
	
	

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
      const data = await fetchData("dashboard/users");

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
  }, []);

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
					// Check if any field is empty
				const isEmptyField = Object.values(newUser).some((value) => value.trim() === "");
				if (isEmptyField) {
					throw new Error("جميع الحقول مطلوبة، لا يمكن إضافة بيانات فارغة");
				}

				if(! /^[a-zA-Z0-9]+$/.test(newUser.username)) {
					throw new Error("اسم المستخدم يجب ان يحتوى فقط علي حروف او ارقام");
				}

			if (newUser.password.length < 6) {
				throw new Error("يجب أن تكون كلمة المرور أكثر من 5 أحرف أو أرقام");
			}
      const data = await postData("dashboard/users?action=add", newUser);
      setUsers([...users, { ...data, isEditing: false }]);
      setNewUser(
        Object.fromEntries(Object.keys(initialUserState).map((key) => [key, ""]))
      );
			// console.log(data.message)
			setMessage(data);
			setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error adding user:", error);
			setErrMessage(`${error.message}`)
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };

  
  const handleCancelEdit = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user.originalData, isEditing: false }
          : user
      )
    );

    // Update originalUsers
    setOriginalUsers((prevOriginalUsers) =>
      prevOriginalUsers.map((user) =>
        user.id === id
          ? { ...user.originalData, isEditing: false }
          : user
      )
    );
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
      const fieldsToUpdate = editedFields[id] || {}; 
      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log("No changes to save");
        return;
      }

			if (fieldsToUpdate.password && fieldsToUpdate.password.length < 6) {
				setErrMessage("يجب أن تكون كلمة المرور أكثر من 5 أحرف أو أرقام");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return ;
			}

			if (fieldsToUpdate.username === "" || (fieldsToUpdate.username && fieldsToUpdate.username.length < 4)) {
				setErrMessage("اسم المستخدم لا يمكن ان يكون فارغا او اقل من 4 حروف");
          setTimeout(() => {
            setErrMessage("");
          }, 5000);
          return ;
			}

      // Send only the edited fields and the user ID to the backend
      const dataToUpdate = { id, ...fieldsToUpdate };
      const updatedUser = await putData("dashboard/users?action=edit", dataToUpdate);

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
			setMessage('تم تعديل المستخدم بنجاح');
			setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error updating user:", error);
			setErrMessage(`${error.message}`)
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };

  const handleDeleteUser = async (id) => {
		const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم");
    if (!confirmDelete) return;
    try {
      await deleteData("dashboard/users?action=del", { id });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      // Update originalUsers
      setOriginalUsers((prevOriginalUsers) =>
        prevOriginalUsers.filter((user) => user.id !== id)
      );
			window.alert('تم حذف المستخدم بنجاح');
			setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error deleting user:", error);
			setErrMessage(`${error.message}`)
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };

  // Filter out the signed-in user
  const filteredUsers = users.filter((user) => user.username !== signedInUsername);

  return (
    <>
		  <h2>سجل الموظفين</h2>
      <div className="user-options">
        <button onClick={() =>{ setUsersView("add"); setMessage(""); setErrMessage("");}}>إضافة موظف</button>
        <button onClick={() => { fetchUsers(); setUsersView("edit"); setErrMessage(""); setMessage("");}}>
          تعديل الموظفين
        </button>
      </div>

      {usersView === "edit" && (
        <UserFilter users={originalUsers} onSearch={handleSearch} />
      )}

      {usersView === "add" && (
        <>
          <div className="dashboard-form-group">
            {Object.entries(initialUserState).map(([key, label]) =>(
						<div key={key} className="form-field">
            <label htmlFor={key}>{label}</label>
              {key === "role" ? (
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
							)}
							</div>
              )
            )}
          </div>
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}
          <button onClick={handleAddUser}>حفظ المستخدم</button>
        </>
      )}

      {usersView === "edit" && (
        <>
				
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
												<div className="action-buttons">
                          <button onClick={() => handleSaveUser(user.id)}>
                            حفظ
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="del-button">                            حذف                  </button>
                          <button onClick={() => handleCancelEdit(user.id)}>
                            إلغاء
                          </button>
													</div>
													{message && (<p className="suc-message">{message}</p>)}
			                  	{errMessage && (<p className="err-message">{errMessage}</p>)}
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
