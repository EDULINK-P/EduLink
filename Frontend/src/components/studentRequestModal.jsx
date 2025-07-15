import React, { useState } from "react";
import "../assets/form.css";

const StudentRequestModal = ({ courseId, userCredits, onClose, onSubmit }) => {
  const [intervals, setIntervals] = useState([{ day: "", start: "", end: "" }]);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(1);
  const [weeklyBudget, setWeeklyBudget] = useState(1);
  const [error, setError] = useState(null);

  const handleIntervalChange = (index, field, value) => {
    const updated = [...intervals];
    updated[index][field] = value;
    setIntervals(updated);
  };

  const addInterval = () => {
    setIntervals([...intervals, { day: "", start: "", end: "" }]);
  };

  const handleSubmit = (e) => {
    try{
      e.preventDefault();
      const formattedIntervals = intervals.map(({ day, start, end }) => ({
        day,
        interval: `${start}:00-${end}:00`,
      }));
      const requestData = {
        courseId,
        intervals: formattedIntervals,
        sessionsPerWeek,
        maxSessionsPerDay,
        weeklyBudget: parseInt(weeklyBudget),
      };
      onSubmit(requestData);
      onClose();
    } catch (error) {
      setError(error);
    }
  };

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
                        {hour}:00 </option>
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
                        {hour}:00 </option>
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
