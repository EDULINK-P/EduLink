import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import { AuthProvider } from "../src/context/authContext";
import Signup from "./pages/signup";
import Login from "./pages/login";
import ProfileSetup from "./pages/profileSetup";
import Dashboard from "./pages/dashboard";
import ManageCourses from "./pages/manageCourses";
import TaRoom from "./pages/taRoom";
import StudentRoom from "./pages/StudentRoom";
import BestScheduleModal from "./components/BestScheduleModal";
import "../src/assets/app.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profileSetup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/room/ta/:courseId" element={<TaRoom />} />
            <Route path="/room/student/:courseId" element={<StudentRoom />} />
            <Route path="/student/:studentId/best-match" element={<BestScheduleModal />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
