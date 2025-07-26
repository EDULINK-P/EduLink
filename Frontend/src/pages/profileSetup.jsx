import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "../assets/form.css";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [selectedCourses, setSelectedCourses] = useState([
    { courseId: "", role: "" },
    { courseId: "", role: "" },
  ]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/courses`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Could not get courses");
        }
        const data = await res.json();
        if (data.courses) setCourseOptions(data.courses);
        return data;
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...selectedCourses];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCourses(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const courseIds = selectedCourses.map((c) => c.courseId);
    const hasDuplicates = new Set(courseIds).size !== courseIds.length;
    if (hasDuplicates) {
      setError("You cannot select the same course twice");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/profile/setup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: selectedCourses.map((c) => c.courseId),
          roles: selectedCourses.map((c) => c.role),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile setup complete");
        navigate("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error setting up profile:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="form-container">
      <h2 className="hero-title">Complete your Profile</h2>
      <form onSubmit={handleSubmit}>
        {selectedCourses.map((item, index) => (
          <div key={index} className="form-group">
            <select
              className="form-input"
              value={item.courseId}
              onChange={(e) => handleChange(index, "courseId", e.target.value)}
            >
              <option value="">Select a Course</option>
              {Array.isArray(courseOptions) &&
                courseOptions.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                    disabled={selectedCourses.some(
                      (c, i2) => c.courseId === course.id && i2 !== index
                    )}
                  >
                    {course.name}
                  </option>
                ))}
            </select>
            <select
              className="form-input"
              value={item.role}
              onChange={(e) => handleChange(index, "role", e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="TA">TA</option>
              <option value="Student">Student</option>
            </select>
          </div>
        ))}
        {error && <p className="error-message">{error}</p>}
        <button
          className="form-button"
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit {loading ? "Submitting..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
