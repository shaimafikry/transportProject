import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import ForgetPass from './components/forget-pass';
import ProtectedRoute from './components/protectedRoutes';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/dashboard"
				element={
					<ProtectedRoute>
              <Dashboard />
          </ProtectedRoute>
				} />
        <Route path="/forget-password" element={<ForgetPass />} />
      </Routes>
    </Router>
  );
}

export default App;
