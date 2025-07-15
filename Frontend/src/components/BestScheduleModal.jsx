import React, { useEffect, useState } from "react";
import "../assets/room.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BestScheduleModal = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/schedule`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Failed to fetch schedule`);

        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        setError(error);
        console.error("Schedule fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">Recommended Schedule</h2>
        <div className="room-description">
          Here is the recommended schedule for you
        </div>
        {loading ? (
          <div className="empty-state"> Loading schedule...</div>
        ) : error || !schedule ? (
          <div className="empty-state">
            No Recommended Schedule Available. Please try again later.</div>
        ) : (
          schedule.sessions.map((session, idx) => (
            <div key={idx} className="session-card">
              <div className="session-title">
                Lesson {idx + 1}: {session.day} | {session.start} - {session.end}
                TA #{session.taId}, {session.rate} credits, {session.rating ? `${session.rating} stars` : "No rating yet"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};



export default BestScheduleModal;
