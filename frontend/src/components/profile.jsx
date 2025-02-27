import React, { useState } from "react";
import {putData} from "../api.js"

const Profile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || newPassword.length < 6) {
      setStatus("يرجى ادخال كلمات السر ويجب ان تكون اكثر من 5 ارقام او حروف");
      return;
    }

    try {
      const id = sessionStorage.getItem("userId");
      const formData = { id, oldPassword, newPassword }; // Define form data
      const data = await putData("dashboard?action=profile", formData);
      setStatus("تم تغيير كلمة السر");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("error during password change", error);
      setStatus("كلمة السر القديمة غير صحيحة");
			setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="home-container">
      <h2 className="text-xl font-semibold">تغيير كلمة السر</h2>
      <form onSubmit={handleSubmit} className="signin-section">
        <input
          type="password"
          placeholder="كلمة السر القديمة"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="mb-4"
        />
        <input
          type="password"
          placeholder="كلمة السر الجديدة"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="flex flex-col gap-2 mt-3">
          <button type="submit">حفظ</button>
					</div>

          {status && (
            <span className={status === "تم تغيير كلمة السر" ? "text-green-600" : "text-red-600"}>
              {status}
            </span>
          )}
      </form>
    </div>
  );
};

export default Profile;
