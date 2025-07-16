import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../assets/room.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function TaRoom() {
  const { courseId } = useParams();
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [intervals, setIntervals] = useState([{ day: "", start: "", end: "" }]);
  const [rate, setRate] = useState(10);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the upcoming meeting
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/meeting/${courseId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUpcoming(data);
      } catch (err) {
        setError(error);
        console.error("Error fetching meeting:", err);
      }
    };
    fetchMeetings();
  }, [courseId, upcoming.length]);

  const handleCreateMeeting = async () => {
    if (!topic || !startTime) {
      setError("Please enter a topic and start time");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/zoom-meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          topic,
          startTime,
        }),
      });
      const newMeeting = await res.json();
      setUpcoming((prev) => [...prev, newMeeting]);
      setTopic("");
      setStartTime("");
    } catch (error) {
      setError(error);
      console.error("Error creating meeting:", error);
    }
    setLoading(false);
  };

  const handleIntervalChange = (index, field, value) => {
    const updated = [...intervals];
    updated[index] = { ...updated[index], [field]: value };
    setIntervals(updated);
  };

  const addInterval = () => {
    setIntervals([...intervals, { day: "", start: "", end: "" }]);
  };

  const handleSubmitAvailability = async (e) => {
    e.preventDefault();
    const formattedIntervals = intervals.map(({ day, start, end }) => ({
      day,
      interval: `${start}:00-${end}:00`,
    }));
    try {
      const res = await fetch(`${BACKEND_URL}/availability/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          rate: parseInt(rate),
          intervals: formattedIntervals,
        }),
      });
      const data = await res.json();
    } catch (error) {
      setError(error);
      console.error("Error saving availability:", error);
    }
  };

  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">TA Room</h2>
        <button className="availablity-btn" onClick={() => setShowModal(true)}>
          Set Availability & Rates
        </button>
      </div>
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Topic</label>
          <input
            type="text"
            className="form-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="eg.,Linear Algebra Review session"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input
            type="datetime-local"
            className="form-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <button
          className="submit-btn"
          onClick={handleCreateMeeting}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Session (+15 credits)"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="room-section">
        <div className="room-title">Your Upcoming Session</div>
        {upcoming.length > 0 ? (
          upcoming.map((session, idx) => (
            <div className="session-card" key={idx}>
              <div className="session-title">{session.topic}</div>
              <div className="session-time">
                Start at: {new Date(session.startTime).toLocaleString()}
              </div>
              <a
                href={session.joinUrl}
                className="start-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Session
              </a>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📆</div>
            <p>No session created yet</p>
            <p>Use the form above to create one</p>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              X
            </button>
            <div className="form-section">
              <h2> Set Availability & Rates </h2>
              <form onSubmit={handleSubmitAvailability}>
                {intervals.map((entry, idx) => (
                  <div key={idx}>
                    <select
                      className="form-select"
                      value={entry.day}
                      onChange={(e) =>
                        handleIntervalChange(idx, "day", e.target.value)
                      }
                    >
                      <option value="">Select a day</option>
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day, idx) => (
                        <option key={idx} value={day}>
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
                  className="form-button"
                  type="button"
                  onClick={addInterval}
                >
                  + Add Interval
                </button>
                <label className="form-label">Rate per Session (max 30)</label>
                <input
                  type="number"
                  className="form-input"
                  value={rate}
                  onChange={(e) => setRate(parseInt(e.target.value))}
                />
                <button type="submit" className="form-button">
                  Save Availability
                </button>
                {error && <div className="error-message">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
      <button
        className="form-button"
        onClick={() => navigate(`/notes/${courseId}`)}
      >
        View Notes
      </button>
    </div>
  );
}

export default TaRoom;
