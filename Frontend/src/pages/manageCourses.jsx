import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";

const ManageCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [selected, setSelected] = useState({ courseId: "", role: "Student" });
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await fetch(`${BACKEND_URL}/courses`, {
          credentials: "include",
        });
        const courseData = await courseRes.json();
        setCourses(courseData.courses || []);

        const dashboardResponse = await fetch(
          `${BACKEND_URL}/profile/dashboard`,
          {
            credentials: "include",
          }
        );
        const dashboardData = await dashboardResponse.json();
        setUserCourses(dashboardData.courses || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load your courses, try again later");
      }
    };
    fetchData();
  }, []);

  const handleAdd = async () => {
    setError("");

    if (userCourses.length >= 5) {
      setError("You can reach the maximum number of courses");
      return;
    }
    const alreadyExists = userCourses.some(
      (c) =>
        c.courseId === parseInt(selected.courseId) && c.role === selected.role
    );
    if (alreadyExists) {
      setError("This course already exists in your dashboard");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/profile/add-course`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: parseInt(selected.courseId),
          role: selected.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add course");
      setUserCourses((prev) => [...prev, data.newCourse]);
    } catch (error) {
      console.error("Error adding course:", error);
      setError(error.message);
    }
  };
  return (
    <main className="main">
      <div className="page-header">
        <h2 className="page-title">Manage Course </h2>
        <button className="btn-secondary" onClick={() => window.history.back()}>
          Back to Dashboard
        </button>
      </div>
      {userCourses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses added yet</h3>
          <p>Add your first course to get started with EduLink</p>
        </div>
      ) : (
        userCourses.map((c, i) => (
          <div key={i} className="empty-state">
            <h3>{c.courseName}</h3>
            <p>{c.role}</p>
          </div>
        ))
      )}
      <div className="form-selection">
        <select
          className="form-select"
          value={selected.courseId}
          onChange={(e) =>
            setSelected({ ...selected, courseId: e.target.value })
          }
        >
          <option value="">Select a Course</option>
          {courses &&
            courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
        </select>
        <select
          className="form-select"
          value={selected.role}
          onChange={(e) => setSelected({ ...selected, role: e.target.value })}
        >
          <option value="Student">Student</option>
          <option value="TA">TA</option>
        </select>
        <button className="btn-primary" onClick={handleAdd}>
          Add Course
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </main>
  );
};

export default ManageCourses;
