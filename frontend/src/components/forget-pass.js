import React, { useState } from "react";
import { putData, fetchData } from "../api.js";

const ForgetPass = () => {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [id, setUserId] = useState("");

  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCheck = async () => {
    try {
      const checkUser = await fetchData(`/forget-password?phone=${phone}`);
      if (checkUser) {
				setUserId(checkUser);
        setChecked(true);
      } else {
        setStatus("رقم الموبايل غير مسجل");
      }
    } catch (error) {
      console.error("Error checking phone number:", error);
      setStatus("حدث خطأ أثناء التحقق من الرقم");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus("يجب أن تكون كلمة المرور أكثر من 5 أحرف أو أرقام");
      return;
    }

    try {
      const formData = { id, newPassword };
      await putData("/forget-password", formData);
      setStatus("تم تغيير كلمة السر بنجاح");
      setPhone("");
      setNewPassword("");
      setChecked(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setStatus("فشل تغيير كلمة المرور");
    }
  };

  return (
    <div>
      {!checked ? (
        <div>
          <h2>يرجى إدخال رقم الموبايل</h2>
          <input
            type="text"
            placeholder="رقم الموبايل"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-4"
          />
          <button type="button" onClick={handleCheck}>
            تحقق من رقم الموبايل
          </button>
          {status && <p className="text-red-600 mt-2">{status}</p>}
        </div>
      ) : (
        <div className="home-container">
          <h2 className="text-xl font-semibold">تغيير كلمة السر</h2>
          <form onSubmit={handleSubmit} className="signin-section">
            <input
              type="password"
              placeholder="كلمة السر الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-4"
            />
            <div className="flex flex-col gap-2 mt-3">
              <button type="submit">حفظ</button>
            </div>
            {status && (
              <p className={status === "تم تغيير كلمة السر بنجاح" ? "text-green-600" : "text-red-600"}>
                {status}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgetPass;
