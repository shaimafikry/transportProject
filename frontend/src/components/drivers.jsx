import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../api";
import DriverFilter from "./driverFilter";

const Drivers = () => {
  const [viewDrivers, setViewDrivers] = useState("");
  const [drivers, setDrivers] = useState([]);
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
    { name: "trip_num", type: "number", placeholder: "عدد الرحلات", disabled: true },
    { name: "price", type: "number", placeholder: "الحساب الكلي", disabled: true },
    { name: "remaining_money_fees", type: "number", placeholder: "الحساب المتبقي", disabled: true },
  ];

  // Fetch drivers data from API
  const fetchDrivers = async () => {
    try {
      const data = await fetchData("dashboard?action=drivers");
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

  const handleDriverChange = (field, value) => {
    setNewDriver((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditDriverChange = (driverId, field, value) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
      )
    );

    // Update originalDrivers
    setOriginalDrivers((prevOriginalDrivers) =>
      prevOriginalDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
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

		if (newDriver.phone_number === "" || newDriver.driver_name === "" || newDriver.national_id === ""){
			setErrMessage('رقم التليفون، اسم السائق، الرقم القومي : هذه الحقول لا يجب ان تكون فارغة')
			return
		}
    try {

      const data = await postData("dashboard?action=drivers-add", newDriver);
      setDrivers([...drivers, { ...data, isEditing: false }]);
      setNewDriver({
        leader_name: "",
        driver_name: "",
        phone_number: "",
        national_id: "",
        passport_number: "",
        company: "",
      });
			setMessage('تم اضافة السائق  بنجاح')

    } catch (error) {
      console.error("Error adding driver:", error);
			setErrMessage(`${error.message}`)

    }
  };

  const handleSaveDriver = async (id) => {
    try {
      const driverToUpdate = drivers.find((driver) => driver.id === id) || {};
      if (Object.keys(driverToUpdate).length === 0) {
        console.log("No changes to save");
        return;
      }
      const updatedDriver = await putData("dashboard?action=drivers-edit", driverToUpdate);

  
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
			setMessage('تم تعديل بيانات السائق بنجاح')

    } catch (error) {
      console.error("Error updating driver:", error);
			setErrMessage(`${error.message}`)

    }
  };
  

  const handleDeleteDriver = async (id) => {
		const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا السائق؟");
    if (!confirmDelete) return;
    try {
      const driverToDel = drivers.find((driver) => driver.id === id);
      await deleteData("dashboard?action=drivers-del", driverToDel);
      setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver.id !== id));

      // Update originalDrivers
      setOriginalDrivers((prevOriginalDrivers) =>
        prevOriginalDrivers.filter((driver) => driver.id !== id)
      );
			setMessage('تم حذف السائق بنجاح')

    } catch (error) {
      console.error("Error deleting driver:", error);
			setErrMessage(`${error.message}`)

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
          <button onClick={handleAddDriver}>حفظ السائق</button>
					{message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{errMessage}</p>)}

        </>
      )}

      {viewDrivers === "edit" && (
        <>
				  {message && (<p className="suc-message">{message}</p>)}
					{errMessage && (<p className="err-message">{message}</p>)}
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
                          <button onClick={() => handleDeleteDriver(driver.id)}>حذف</button>
                          <button onClick={() => handleEditDriver(driver.id)}>إلغاء</button>
													</div>
                        </td>
                      </>
                    ) : (
                      <>
                        {editFields.map(({ name }) => (
                          <td key={name}>{driver[name]}</td>
                        ))}
                        <td>
                          <button onClick={() => handleEditDriver(driver.id)}>تعديل</button>
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
