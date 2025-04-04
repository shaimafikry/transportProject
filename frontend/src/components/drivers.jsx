import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import { useNavigate } from 'react-router-dom';
import DriverFilter from "./driverFilter";
import DriverProfile from "./driverProfile";


const Drivers = () => {
  const navigate = useNavigate();
  const [viewDrivers, setViewDrivers] = useState("");
	const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [drivers, setDrivers] = useState([]);
	const [editedFields, setEditedFields] = useState({});
	const [message, setMessage]= useState("");
	const [errMessage, setErrMessage] = useState("");
  const [newDriver, setNewDriver] = useState({
    leader_name: "",
    driver_name: "",
    phone_number: "",
    national_id: "",
    passport_number: "",
    company: "",
  });

  const [originalDrivers, setOriginalDrivers] = useState([]);

  const driverFields = [
    { name: "leader_name", type: "text", placeholder: "اسم المندوب" },
    { name: "driver_name", type: "text", placeholder: "اسم السائق" },
    { name: "phone_number", type: "text", placeholder: "رقم التليفون" },
    { name: "national_id", type: "text", placeholder: "الرقم القومي" },
    { name: "passport_number", type: "text", placeholder: "رقم الجواز" },
    { name: "company", type: "text", placeholder: "الشركة" },
  ];

  const editFields = [
    ...driverFields,
    { name: "trip_counter", type: "number", placeholder: "عدد الرحلات", disabled: true },
  ];

  // Fetch drivers data from API
  const fetchDrivers = async () => {
    try {
      const data = await fetchData("dashboard/drivers");
      setDrivers(Array.isArray(data.drivers) ? data.drivers.map((driver) => ({ ...driver, isEditing: false })) : []);
      setOriginalDrivers(data.drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  useEffect(() => {
    setViewDrivers("");
    fetchDrivers();
  }, []);

  // Handle search results from filterDriver
  const handleSearch = (searchResults) => {
    setDrivers(searchResults);
  };

  // Reset to show all drivers
  const resetSearch = () => {
    setDrivers(originalDrivers);
  };

  //MARK: EDIT THIS url
	/* const handleDriverProfile = (id)=> {
		navigate(`${id}`)
	} */

  const handleDriverChange = (field, value) => {
    setNewDriver((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditDriverChange = (driverId, field, value) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
      )
    );

		 // Track edited fields
		 setEditedFields((prev) => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        [field]: value,
      },
    }));

    // Update originalDrivers
    setOriginalDrivers((prevOriginalDrivers) =>
      prevOriginalDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
      )
    );
  };

  const handleCancelEdit = (id) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === id
          ? { ...driver.originalData, isEditing: false }
          : driver
      )
    );

    // Update originalDrivers
    setOriginalDrivers((prevOriginalDrivers) =>
      prevOriginalDrivers.map((driver) =>
        driver.id === id
          ? { ...driver.originalData, isEditing: false }
          : driver
      )
    );
  };

  const handleEditDriver = (id) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === id
          ? driver.isEditing
            ? { ...driver.originalData, isEditing: false }
            : { ...driver, originalData: { ...driver }, isEditing: true }
          : driver
      )
    );

    // Update originalDrivers
    setOriginalDrivers((prevOriginalDrivers) =>
      prevOriginalDrivers.map((driver) =>
        driver.id === id
          ? { ...driver, isEditing: !driver.isEditing, originalData: driver.isEditing ? driver.originalData : { ...driver } }
          : driver
      )
    );
  };

  const handleAddDriver = async () => {

    try {
			if (newDriver.phone_number === "" || newDriver.driver_name === "" || newDriver.national_id === ""){
				throw new Error('رقم التليفون، اسم السائق، الرقم القومي : هذه الحقول لا يجب ان تكون فارغة')
			}

			if (newDriver.national_id && newDriver.national_id.length !== 14) {
				throw new Error("يجب ان يكون الرقم القومي 14 رقم");
			}

      const data = await postData("dashboard/drivers?action=add", newDriver);
      setDrivers([...drivers, { ...data, isEditing: false }]);
      setNewDriver({
        leader_name: "",
        driver_name: "",
        phone_number: "",
        national_id: "",
        passport_number: "",
        company: "",
      });
			setMessage(data);
			setTimeout(() => {
        setMessage("");
      }, 3000);


    } catch (error) {
      console.error("Error adding driver:", error);
			setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };

  const handleSaveDriver = async (id) => {
		try {
      const fieldsToUpdate = editedFields[id] || {}; 
      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log("No changes to save");
        return;
      }

			if (fieldsToUpdate.national_id && fieldsToUpdate.national_id.length !== 14) {
				throw new Error("يجب ان يكون الرقم القومي 14 رقم");
			}

			const dataToUpdate = { id, ...fieldsToUpdate };

      const updatedDriver = await putData("dashboard/drivers?action=edit", dataToUpdate);

  
      // ✅ Update state with `updatedDriver`
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) =>
          driver.id === id ? { ...updatedDriver, isEditing: false } : driver
        )
      );
  
      // ✅ Fix: Use `updatedDriver`, not `updatedTrip`
      setOriginalDrivers((prevOriginalDrivers) =>
        prevOriginalDrivers.map((trip) =>
          trip.id === id
            ? { ...updatedDriver, isEditing: false }
            : trip
        )
      );
       
			// Clear edited fields for this user
      setEditedFields((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

			setMessage('تم تعديل بيانات السائق بنجاح');
			setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error updating driver:", error);
			setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };
  

  const handleDeleteDriver = async (id) => {
		const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا السائق؟");
    if (!confirmDelete) return;
    try {
      const driverToDel = drivers.find((driver) => driver.id === id);
      await deleteData("dashboard/drivers?action=del", driverToDel);
      setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver.id !== id));

      // Update originalDrivers
      setOriginalDrivers((prevOriginalDrivers) =>
        prevOriginalDrivers.filter((driver) => driver.id !== id)
      );
			window.alert('تم حذف المستخدم بنجاح');
			setTimeout(() => {
        setErrMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error deleting driver:", error);
			setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);

    }
  };


  return (
    <>
		 <h2>سجل السائقين</h2>
      <div className="driver-options">
        <button onClick={() => {setViewDrivers("add"); setErrMessage(""); setMessage("");}}>إضافة سائق</button>
        <button onClick={() => {setMessage(""); setErrMessage(""); fetchDrivers(); setViewDrivers("edit"); }}>تعديل سائق</button>
      </div>

      {viewDrivers === "edit" && (
        <DriverFilter drivers={originalDrivers} onSearch={handleSearch} />
      )}

      {viewDrivers === "add" && (
        <>
          <div className="dashboard-form-group">
            {driverFields.map(({ name, type, placeholder }) => (
							<div key={name} className="form-field">
                <label htmlFor={name}>{placeholder}</label>
								{name === "company" ? (
                <select
                  key={name}
                  value={newDriver[name]}
                  onChange={(e) => handleDriverChange(name, e.target.value)}
                >
                  <option value="">اختر الشركة</option>
                  <option value="النقل">النقل</option>
                  <option value="المحاجر">المحاجر</option>
                </select>
								):(
								<input
									key={name}
									type={type}
									placeholder={placeholder}
									value={newDriver[name]}
									onChange={(e) => handleDriverChange(name, e.target.value)}
								/>
								)}
								</div>
								
							))}
          </div>
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}
          <button onClick={handleAddDriver}>حفظ السائق</button>
        </>
      )}

      {viewDrivers === "edit" && (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {editFields.map(({ placeholder }) => (
                    <th key={placeholder}>{placeholder}</th>
                  ))}
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    {driver.isEditing ? (
                      <>
                        {editFields.map(({ name, disabled }) => (
                          <td key={name}>
														 {name === "company" ? (
                              <select
                                value={driver[name]}
                                onChange={(e) =>
                                  handleEditDriverChange(driver.id, name, e.target.value)
                                }
                              >
                                <option value="النقل">النقل</option>
                                <option value="المحاجر">المحاجر</option>
                              </select>
														 ):(
                            <input
                              type="text"
                              value={driver[name] || ""}
                              onChange={(e) => handleEditDriverChange(driver.id, name, e.target.value)}
                              disabled={disabled}
                            />
														 )}
                          </td>
                        ))}
                        <td>
												<div className="action-buttons">
                          <button onClick={() => handleSaveDriver(driver.id)}>حفظ</button>
                          <button onClick={() => handleDeleteDriver(driver.id) } className="del-button">حذف</button>
                          <button onClick={() => handleCancelEdit(driver.id)}>إلغاء</button>
													</div>
													{message && (<p className="suc-message">{message}</p>)}
													{errMessage && (<p className="err-message">{errMessage}</p>)}
                        </td>
                      </>
                    ) : (
                      <>
                        {editFields.map(({ name }) => (
                          <td key={name}>{driver[name]}</td>
                        ))}
                        <td>
												<div className="action-buttons">
                          <button onClick={() => handleEditDriver(driver.id)}>تعديل</button>
                          {/* <button onClick={() => setSelectedDriverId(driver.id)}>زيارة</button> */}
                          <button onClick={() => navigate(`/dashboard/drivers/${driver.id}`)}>زيارة</button>
													</div>
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

export default Drivers;
