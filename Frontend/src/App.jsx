import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import { AuthProvider } from "../src/context/authContext";
import Signup from "./pages/signup";
import Login from "./pages/login";
import ProfileSetup from "./pages/profileSetup";
import Dashboard from "./pages/dashboard";
import ManageCourses from "./pages/manageCourses";
import TaRoom from "./pages/TaRoom";
import StudentRoom from "./pages/StudentRoom";
import BestScheduleModal from "./components/BestScheduleModal";
import StickyNoteRoom from "./pages/stickyNoteRoom";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomCursor from "./components/CustomCursor";
import "../src/index.css"
import "../src/assets/cursor.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <main>
          <CustomCursor />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profileSetup" element={<ProfileSetup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-courses"
              element={
                <ProtectedRoute>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/ta/:courseId"
              element={
                <ProtectedRoute>
                  <TaRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/student/:courseId"
              element={
                <ProtectedRoute>
                  <StudentRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/:studentId/best-match"
              element={
                <ProtectedRoute>
                  <BestScheduleModal />
                </ProtectedRoute>
              }
            />
            <Route path="/notes/:courseId" element={<StickyNoteRoom />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
