import React, { useState } from "react";
import { putData, fetchData } from "../api.js";
import { Link, useNavigate } from 'react-router-dom';

const ForgetPass = () => {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [id, setUserId] = useState("");
  const [success, setSuccess] = useState(false);
  const [checked, setChecked] = useState(false);
const [message, setMessage] = useState("");
const [errMessage, setErrMessage] = useState("");

  const handleCheck = async () => {
		try {
			if (!phone) {
				throw new Error("رقم الموبايل لا يجب ان يكون فارغا");
			}

      const checkUser = await fetchData(`forget-password?phone=${phone}`);
      if (checkUser) {
        setUserId(checkUser);
        setChecked(true);
      } else {
        throw new Error("رقم الموبايل غير مسجل");
      }
    } catch (error) {
      console.error("Error checking phone number:", error);
      setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
			if (newPassword.length < 6) {
				throw new Error("يجب أن تكون كلمة السر أكثر من 5 أحرف أو أرقام");
			}

      const formData = { id, newPassword };
      const response = await putData("forget-password", formData);
      setMessage(response);	
      setSuccess(true);
			setTimeout(() => {
        setMessage("");
      }, 3000);
      setPhone("");
      setNewPassword("");
      setChecked(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrMessage(`${error.message}`);
			setTimeout(() => {
        setErrMessage("");
      }, 5000);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full viewport height
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px", // Limit width for better readability
          padding: "20px",
          borderRadius: "10px", // Rounded corners for the container
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          textAlign: "right", // Align text to the right
        }}
      >
      {success ? (
        <div>
          <p style={{ color: "white", marginBottom: "20px" }}>{message}</p>
          <p className="mt-3" style={{
                    padding: "10px",
                    fontSize: "16px",
                    color: "white",
                  }}>العودة الي صفحة تسجيل الدخول <Link to="/">اضغط هنا</Link></p>
        </div>
      ) :(
        <>
        {!checked ? (
          <div>
            <h2 style={{ marginBottom: "20px" }}>يرجى إدخال رقم الموبايل</h2>
            <input
              type="text"
              placeholder="رقم الموبايل"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px", // Rounded corners for input
                border: "1px solid #ccc", // Light border
                textAlign: "right", // Align text to the right
                direction: "rtl", // Right-to-left for placeholder
                marginBottom: "20px",
              }}
            />
            <div>
              <button
                type="button" // Changed to type="button"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "5px", // Rounded corners for button
                  backgroundColor: "#907e7e", // Button color
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.3s", // Smooth transition for hover
                }}
                onClick={handleCheck}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#71483c")} // Hover effect
                onMouseOut={(e) => (e.target.style.backgroundColor = "#907e7e")} // Reset on mouse out
              >
                تحقق من رقم الموبايل
              </button>
            </div>
            
            {message && <p className="suc-message">{message}</p>}
            {errMessage && <p className="err-message">{errMessage}</p>}
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: "20px" }}>تغيير كلمة السر</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="كلمة السر الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "5px", // Rounded corners for input
                  border: "1px solid #ccc", // Light border
                  textAlign: "right", // Align text to the right
                  direction: "rtl", // Right-to-left for placeholder
                  marginBottom: "20px",
                }}
              />
              <div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px", // Rounded corners for button
                    backgroundColor: "#907e7e", // Button color
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s", // Smooth transition for hover
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#71483c")} // Hover effect
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#907e7e")} // Reset on mouse out
                >
                  حفظ
                </button>
              </div>
              {message && <p className="suc-message">{message}</p>}
              {errMessage && <p className="err-message">{errMessage}</p>}
            </form>
          </div>
        )}
			  <p className="mt-3" style={{
                    padding: "10px",
                    fontSize: "16px",
                    color: "white",
                  }}>العودة الي صفحة تسجيل الدخول <Link to="/">اضغط هنا</Link></p>
        </>
        )}
      </div>
    </div>
  );
};

export default ForgetPass;
