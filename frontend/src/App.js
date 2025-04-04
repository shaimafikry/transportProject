import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import ForgetPass from './components/forget-pass';
import ProtectedRoute from './components/protectedRoutes';
import Drivers from './components/drivers';
import Users from './components/users';
import Profile from './components/profile';
import Attendance from './components/attendance';
import Comp1 from './components/comp1';
import Comp2 from './components/comp2';
import Agent from './components/agent';
import DriverProfile from './components/driverProfile';



function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Signin />} />
        <Route path="/forget-password" element={<ForgetPass />} />

        {/* Protect everything under /dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:id" element={<DriverProfile />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="construct" element={<Comp1 />} />
          <Route path="transport" element={<Comp2 />} />
          <Route path="orgs" element={<Agent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
