import React, { useState } from "react";
import { putData } from "../api.js";

const Profile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
			if (!oldPassword) {
				throw new Error("يرجى إدخال كلمة السر القديمة");    }
	
			if (newPassword.length < 6) {
				throw new Error("كلمة السر الجديدة يجب أن تكون أكثر من 5 أحرف أو أرقام");
			}
	
      setLoading(true);
      const id = sessionStorage.getItem("userId");
      const formData = { id, oldPassword, newPassword };
      await putData("dashboard?action=profile", formData);
      
      setStatus("تم تغيير كلمة السر بنجاح");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
			setStatus(`${error.message}`);

			setInterval(() => {
        setStatus("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h2>تغيير كلمة السر</h2>
      <form onSubmit={handleSubmit} className="signin-section">
        <input
          id="oldPassword"
          type="password"
          placeholder="كلمة السر القديمة"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="mb-4"
          required
        />

        <input
          id="newPassword"
          type="password"
          placeholder="كلمة السر الجديدة"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <div className="flex flex-col gap-2 mt-3">
          <button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>

        {status && (
          <span className={status.includes("تم") ? "text-green-600" : "text-red-600"}>
            {status}
          </span>
        )}
      </form>
    </div>
  );
};

export default Profile;
