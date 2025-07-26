import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/loading";
import "../assets/app.css";

const Dashboard = () => {
  const [localCourses, setLocalCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/profile/dashboard`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.courses) {
          console.log("Dashboard data loaded successfully", data.courses);
          setLocalCourses(data.courses);
          setLoading(false);
        } else {
          setLocalCourses([]);
          console.log("No courses found for user");
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadData();
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSignOut = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log("Sign out response", data);
      if (data.success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const handleEnterRoom = (course) => {
    const courseId = course.courseId;
    console.log("the course", course);
    const role = course.role;
    if (role === "TA") {
      navigate(`/room/ta/${courseId}`);
    } else if (role === "Student") {
      navigate(`/room/student/${courseId}`);
    } else {
      console.error("Invalid role");
    }
  };

  if (loading)  return <Loading message = "Welcome to your Edulink Dashboard, Loading ...."/>;
  return  (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate("/dashboard")}>
            EduLink
          </div>
          <div className="user-nav">
            <div className="credit-barge"> 50 credits</div>
            <div className="user-avatar" onClick={toggleDropdown}></div>
            <div className={`dropdown ${dropdownOpen ? "active" : ""}`}>
              <div
                className="dropdown-item"
                onClick={() => navigate("/manage-courses")}
              >
                📚 Manage Courses
              </div>
              <div className="dropdown-item" onClick={handleSignOut}>
                🚪 Sign Out
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <h2 className="page-title"> Welcome</h2>
        <div>
          <h3> Your Study Rooms</h3>
          {localCourses?.length > 0 ? (
            localCourses.map((course, idx) => (
              <div key={idx} className="empty-state">
                <h3>{course.courseName}</h3>
                <p>{course.role === "TA" ? "TA" : "Student"}</p>
                <button
                  className="btn btn-primary"
                  data-cursor="Enter Room"
                  onClick={() => handleEnterRoom(course)}
                >
                  Enter Room
                </button>
              </div>
            ))
          ) : (
            <p>You have no courses added yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
