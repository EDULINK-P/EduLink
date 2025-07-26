import React, { useEffect, useState } from "react";
import "../assets/form.css";
import ModalFormSkeleton from "./ModalFormSkeleton.jsx";

const StudentRequestModal = ({
  courseId,
  userId,
  userCredits,
  onClose,
  onSubmit,
}) => {
  const [intervals, setIntervals] = useState([{ day: "", start: "", end: "" }]);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(1);
  const [weeklyBudget, setWeeklyBudget] = useState(1);
  const [error, setError] = useState(null);
  const [otherStudents, setOtherStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [studentForms, setStudentForms] = useState({});
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/student-list/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        console.log(response);
        const data = await response.json();
        console.log(data);
        setOtherStudents(data.dropdownOptions);
      } catch (error) {
        setError(error);
        console.error("Error fetching students:", error);
        setOtherStudents([]);
      }
    };
    fetchStudents();
  }, [courseId]);

  const handleIntervalChange = (index, field, value) => {
    const updated = [...intervals];
    updated[index][field] = value;
    setIntervals(updated);
  };

  const addInterval = () => {
    setIntervals([...intervals, { day: "", start: "", end: "" }]);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const formattedIntervals = (intervals) =>
        intervals.map(({ day, start, end }) => ({
          day,
          interval: `${start}:00-${end}:00`,
        }));
      const selfData = {
        userId,
        sessionsPerWeek: parseInt(sessionsPerWeek),
        maxSessionsPerDay: parseInt(maxSessionsPerDay),
        weeklyBudget: parseInt(weeklyBudget),
        intervals: formattedIntervals,
      };
      const friendData = selectedStudent.map((id) => {
        const form = studentForms[id];
        return {
          userId: id,
          sessionsPerWeek: parseInt(form.sessionsPerWeek),
          maxSessionsPerDay: parseInt(form.maxSessionsPerDay),
          weeklyBudget: parseInt(form.weeklyBudget),
          intervals: formattedIntervals(form.intervals),
        };
      });
      const payload = {
        courseId,
        students: [selfData, ...friendData],
      };
      await onSubmit(payload);
      onClose();
    } catch (error) {
      setError(error);
      console.error("Error submitting request:", error);
    }
  };

  if (loading) return <ModalFormSkeleton />;
  return (
    <div className="modal-backdrop">
      <div className="form-container">
        <div className="form-header">
          <span className="form-title">Request a TA Recommendation</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sessions per week</label>
            <input
              type="number"
              className="form-input"
              min={1}
              max={7}
              value={sessionsPerWeek}
              onChange={(e) => setSessionsPerWeek(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Weekly Credit budget({userCredits})
            </label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={weeklyBudget}
              onChange={(e) => setWeeklyBudget(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label"> Your Availability</label>
            {intervals.map((entry, idx) => (
              <div key={idx} className="interval-input">
                <select
                  className="form-select"
                  value={entry.day}
                  onChange={(e) =>
                    handleIntervalChange(idx, "day", e.target.value)
                  }
                >
                  <option value="">Select Day</option>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  type="time"
                  className="form-select"
                  value={entry.start}
                  onChange={(e) =>
                    handleIntervalChange(idx, "start", e.target.value)
                  }
                >
                  <option value="">Select Start Time</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = String(i).padStart(2, "0");
                    return (
                      <option key={hour} value={hour}>
                        {hour}:00{" "}
                      </option>
                    );
                  })}
                </select>
                <select
                  type="time"
                  className="form-select"
                  value={entry.end}
                  onChange={(e) =>
                    handleIntervalChange(idx, "end", e.target.value)
                  }
                >
                  <option value="">Select End Time</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = String(i).padStart(2, "0");
                    return (
                      <option key={hour} value={hour}>
                        {hour}:00{" "}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
            <button type="button" className="form-button" onClick={addInterval}>
              Add Interval
            </button>
          </div>
          <label className="form-label">Max Sessions Per Day</label>
          <input
            type="number"
            className="form-input"
            value={maxSessionsPerDay}
            onChange={(e) => setMaxSessionsPerDay(parseInt(e.target.value))}
          />
          <div className="form-group">
            <label className="form-label">Add Another students</label>
            <select
              className="form-select"
              onChange={(e) => {
                const selected = parseInt(e.target.value);
                if (selected && !selectedStudent.includes(selected)) {
                  setSelectedStudent((prev) => [...prev, selected]);
                  setStudentForms((prev) => ({
                    ...prev,
                    [selected]: {
                      sessionsPerWeek: "",
                      maxSessionsPerDay: "",
                      weeklyBudget: "",
                      intervals: [{ day: "", start: "", end: "" }],
                    },
                  }));
                }
              }}
            >
              <option value="">Select student</option>
              {Array.isArray(otherStudents) &&
                otherStudents.length > 0 &&
                otherStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          {selectedStudent.map((id) => {
            const student = studentForms[id];
            return (
              <div key={id} className="form-group">
                <h2 className="form-subsection">
                  {(otherStudents.find((s) => s.id === id) || {}).name}'s
                  Request
                </h2>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Sessions per week"
                  value={student.sessionsPerWeek}
                  onChange={(e) =>
                    setStudentForms((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        sessionsPerWeek: e.target.value,
                      },
                    }))
                  }
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max sessions per day"
                  value={student.maxSessionsPerDay}
                  onChange={(e) =>
                    setStudentForms((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        maxSessionsPerDay: e.target.value,
                      },
                    }))
                  }
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Weekly budget"
                  value={student.weeklyBudget}
                  onChange={(e) =>
                    setStudentForms((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        weeklyBudget: e.target.value,
                      },
                    }))
                  }
                />
                <div className="form-group">
                  <label className="form-label"> Your Availability</label>
                  {intervals.map((entry, idx) => (
                    <div key={idx} className="interval-input">
                      <select
                        className="form-select"
                        value={entry.day}
                        onChange={(e) =>
                          handleIntervalChange(idx, "day", e.target.value)
                        }
                      >
                        <option value="">Select Day</option>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <select
                        type="time"
                        className="form-select"
                        value={entry.start}
                        onChange={(e) =>
                          handleIntervalChange(idx, "start", e.target.value)
                        }
                      >
                        <option value="">Select Start Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = String(i).padStart(2, "0");
                          return (
                            <option key={hour} value={hour}>
                              {hour}:00{" "}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        type="time"
                        className="form-select"
                        value={entry.end}
                        onChange={(e) =>
                          handleIntervalChange(idx, "end", e.target.value)
                        }
                      >
                        <option value="">Select End Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = String(i).padStart(2, "0");
                          return (
                            <option key={hour} value={hour}>
                              {hour}:00{" "}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="form-button"
                    onClick={addInterval}
                  >
                    Add Interval
                  </button>
                </div>
              </div>
            );
          })}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="form-button">
            Submit
          </button>
          <button type="button" className="form-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRequestModal;
