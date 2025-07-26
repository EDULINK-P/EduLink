import React, { useState, useEffect, use } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentRequestModal from "../components/studentRequestModal";
import BestScheduleModal from "../components/BestScheduleModal";
import Loading from "../components/loading";
import "../assets/app.css";
import "../assets/room.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function StudentRoom() {
  const { courseId } = useParams();
  const [upcoming, setUpcoming] = useState([]);
  const [availableTAs, setAvailableTAs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(false);
      try {
        const res = await fetch(`${BACKEND_URL}/api/meeting/${courseId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUpcoming(data);
      } catch (error) {
        setError(error);
        console.error("Error Fetching Meeting", error);
      }
    };
    fetchMeeting();
  }, [courseId, upcoming.length]);

  useEffect(() => {
    const fetchTAsAndCredits = async () => {
      try {
        const [taRes, creditRes] = await Promise.all([
          fetch(`${BACKEND_URL}/student-requests/tas/${courseId}`, {
            credentials: "include",
          }),
          fetch(`${BACKEND_URL}/student-requests/credits`, {
            credentials: "include",
          }),
        ]);
        const taData = await taRes.json();
        const creditData = await creditRes.json();
        setAvailableTAs(taData.tas || []);
        setUserCredits(creditData.credits || 0);
      } catch (error) {
        setError(error);
        console.error("Error Fetching TAs and Credits", error);
      }
    };
    fetchTAsAndCredits();
  }, [courseId]);

  const handleJoinMeeting = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/meeting/${courseId}/join`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.joinUrl) {
        window.open(data.joinUrl, "_blank");
      }
    } catch (error) {
      setError(error);
      console.error("Error Joining Meeting", error);
    }
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/student-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Request failed");
    } catch (error) {
      setError(error);
      console.error("Error Submitting Request", error);
    }
  };

  if (loading)  return <Loading message = "Welcome to your Room, Loading ...."/>;

  return (
    <div className="container">
      <div className="room-selection">
        <h2 className="room-title">Study Room</h2>
        <p className="room-subtitle">
          Manage Your Sessions and view Recommendations{" "}
        </p>
        <h2 className="form-subtitle">Upcoming Sessions</h2>
        {upcoming.length > 0 ? (
          upcoming.map((meeting, idx) => (
            <div key={idx} className="session-card">
              <div className="session-title">{meeting.topic}</div>
              <div className="session-time">
                Start at: {new Date(meeting.startTime).toLocaleString()}
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
      <button
        className="form-button"
        onClick={() => setShowScheduleModal(true)}
      >
        {" "}
        Best Match{" "}
      </button>
      {showScheduleModal && (
        <BestScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}
      <button className="form-button" onClick={() => setShowModal(true)}>
        Request TA Support
      </button>
      {error && <div className="error-message">{error}</div>}
      {showModal && (
        <StudentRequestModal
          courseId={courseId}
          userCredits={userCredits}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitRequest}
        />
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

export default StudentRoom;
