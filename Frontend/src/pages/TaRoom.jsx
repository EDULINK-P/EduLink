import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/room.css";
function TaRoom() {
  const { courseId } = useParams();
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [intervals, setIntervals] = useState([{day: "", start: "", end: ""}]);
  const [rate, setRate] = useState(10);

  useEffect(() => {
    // Fetch the upcoming meeting
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/meeting/${courseId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUpcoming(data);
      } catch (err) {
        console.error("Error fetching meeting:", err);
      }
    };
    fetchMeetings();
  }, [courseId, upcoming.length]);

  const handleCreateMeeting = async () => {
    if (!topic || !startTime) {
      alert("Please enter a topic and start time");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/zoom-meetings", {
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
      setUpcoming(prev => [...prev, newMeeting]);
      setTopic("");
      setStartTime("");
    } catch (err) {
      console.error("Error creating meeting:", err);
    }
    setLoading(false);
  };

  const handleIntervalChange = (index, field, value) => {
    const updated = [...intervals];
    updated[index][field] = value;
    setIntervals(updated);
  };

  const handleSubmitAvailability = async () => {
    e.preventDefault();

    const formattedIntervals = intervals.map(({day, start, end}) => ({
      day,
      interval: `${start}-${end}`,
    }));
    try {
      const res = await fetch("/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          course_id: courseId,
          rate,
          intervals: formattedIntervals,
        }),
      });
      const data = await res.json();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving availability:", err);
    }
    setLoading(false);
  };


  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">TA Room</h2>
        <button className="availablity-btn" onClick={() => setShowModal(true)}>Set Availability & Rates</button>
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
            <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            <div className="form-section">
              <h2 > Set Availability & Rates </h2>
              <form onSubmit={handleSubmitAvailability}>
                {intervals.map((entry,idx) => (
                  <>
                  <select className="form-select" value={entry.day} onChange={(e) => handleIntervalChange(idx , 'day', e.target.value)}>
                    <option value="">Select a day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'].map(day => (
                       <option value={day}>{day}</option>
                    ))}
                  </select>
                  <input type="time" className="form-input" value={entry.start} onChange={(e) => handleIntervalChange(idx, 'start', e.target.value)} />
                  <input type="time" className="form-input" value={entry.end} onChange={(e) => handleIntervalChange(idx, 'end', e.target.value)} />
                  </>
                ))}
                <button className="form-button" type="button" onClick={handleIntervalChange}> + Add Interval</button>
                <label className="form-label">Rate per Session (max 30)</label>
                <input type="number" className="form-input" value={rate} onChange={(e) => setRate(parseInt(e.target.value))} />
                <button type="submit" className="form-button">Save Availability</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaRoom;
