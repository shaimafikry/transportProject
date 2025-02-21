import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postData } from '../api';
import './Signin.css';



function Signin() {
	const [form, setForm] = useState({email: '', password: ''});
	const [apiError, setApiError] = useState({email: '', password: ''});
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

			setSuccessMessage('Login successful!');
			console.log("Login successful:", data);
			navigate(data.redirectUrl);

		} catch (error) {
			console.error("Error caught during login:", error);
				// Server responded with a status other than 200 range
			setApiError(error.message || 'An unexpected error occurred during signin');
			console.log("API Error:", error.message);
		}
	}

  return (
    <div className="home-container">
      <div className="signin-section">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Username" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group mt-3">
            <input type="password" className="form-control"  placeholder="Password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary mt-3">Sign In</button>
        </form>
        <p className="mt-3">Forget Password? <Link to="/forget-password">Connect Us </Link></p>
      </div>
    </div>
  );
}

export default Signin;
