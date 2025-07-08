import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function TaRoom() {
  const { courseId } = useParams();
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/meeting/${courseId}`,
          {
            credentials: "include",
          }
        );
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
      setUpcoming((prev) => [...prev, newMeeting]);
      setTopic("");
      setStartTime("");
    } catch (err) {
      console.error("Error creating meeting:", err);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">TA Room</h2>
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
    </div>
  );
}

export default TaRoom;
