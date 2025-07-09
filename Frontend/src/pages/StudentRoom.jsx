import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../assets/room.css";

function StudentRoom() {
  const { courseId } = useParams();
  const [upcoming, setUpcoming] = useState([]);
  const [availableTAs, setAvailableTAs] = useState([]);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/meeting/${courseId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUpcoming(data);
      } catch (err) {
        console.error("Error Fetching Meeting", err);
      }
    };
    fetchMeeting();
  }, [courseId, upcoming.length]);

  useEffect(() => {
    const fetchTAsAndCredits = async () => {
      try {
        const [taRes, creditRes] = await Promise.all([
          fetch(`http://localhost:3000/student-requests/tas/${courseId}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:3000/student-requests/credits`, { credentials: "include" }),
        ]);
        const taData = await taRes.json();
        const creditData = await creditRes.json();
        setAvailableTAs(taData.tas|| []);
        setUserCredits(creditData.credits || 0);
      } catch (err) {
        console.error("Error Fetching TAs and Credits", err);
      }
    };
    fetchTAsAndCredits();
  }, [courseId]);

  const handleJoinMeeting = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/meeting/${courseId}/join`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.joinUrl) {
        window.open(data.joinUrl, "_blank");
      } else {
        console.error("Error Joining Meeting", data);
      }
    } catch (err) {
      console.error("Error Joining Meeting", err);
    }
  };

  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">Study Room</h2>
        <p className="room-subtitle">Course ID: {courseId}</p>
        <h2 className="form-subtitle">Upcoming Sessions</h2>
        {upcoming.length > 0 ? (
          upcoming.map((meeting, idx) => (
            <div key={idx} className="session-card">
              <div className="session-title">{meeting.topic}</div>
              <div className="session-time">
                Start at: {new Date(meeting.starTime).toLocaleString()}
              </div>
              <button
                className="form-button"
                onClick={() => handleJoinMeeting(meeting.joinUrl)}
              >
                Join Session (+10 credits){" "}
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">No upcoming sessions</p>
        )}
      </div>
      <div className="room-selection">
        <h2 className="form-subtitle">Available TAs</h2>
        {availableTAs.length > 0 ? (
          availableTAs.map((ta, idx) => (
            <div key={idx} className="session-card">
              <div className="session-title">{ta.name}</div>
              <div className="session-time">{ta.email}</div>
            </div>
          ))
        ) : (
          <p className="empty-state">No TAs found for this course</p>
        )}
      </div>
      <button className="form-button" onClick={() => setShowModal(true)}>
        Request TA Support
      </button>
    </div>
  );
}

export default StudentRoom;
