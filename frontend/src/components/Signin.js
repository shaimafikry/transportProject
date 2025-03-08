import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postData } from '../api';
import './Signin.css';



function Signin() {
	const [form, setForm] = useState({username: '', password: ''});
	const [apiError, setApiError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');


	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			/*postData for login */
			console.log(form)
			const data = await postData('', form);
			console.log(data)
			sessionStorage.setItem('token', data.token);
			sessionStorage.setItem('role', data.role);
			sessionStorage.setItem('userId', data.id);
			sessionStorage.setItem('username', data.username);

			setSuccessMessage('تم تسجيل الدخول بنجاح');
			// console.log("Login successful:", data);
			navigate(data.redirectUrl);

		} catch (error) {
			console.error("Error caught during login:", error);
			setApiError(`${error.message}` || 'An unexpected error occurred during signin');
			setInterval(() => {
        setApiError("");
      }, 5000);
		}
	}

  return (
    <div className="home-container">
			<img className="logo" src="/logo.jpg" />
      <div className="signin-section">
        <h2>تسجيل الدخول</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="اسم المستخدم" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="form-group mt-3">
            <input type="password" className="form-control"  placeholder="كلمة السر" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary mt-3">تسجيل دخول</button>
        </form>
				{/* Error Message */}
        {apiError && (
          <p className="text-red-600 mt-2">{apiError}</p>
        )}

        {/* Success Message */}
        {successMessage && (
          <p className="text-green-600 mt-2">{successMessage}</p>
        )}

        <p className="mt-3">هل نسيت كلمة السر؟ <Link to="/forget-password">اضغط هنا</Link></p>
      </div>
    </div>
  );
}

export default Signin;
