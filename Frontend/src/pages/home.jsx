import React, { useEffect } from "react";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import "../assets/blob.css"
import "../assets/home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bubble-container">
      <div className="bubble bubble-1" ></div>
      <div className="bubble bubble-2" ></div>
      <div className="bubble bubble-3" ></div>
      <div className="bubble bubble-4" ></div>
      <div className="bubble bubble-5" ></div>
      <div className="bubble bubble-6" ></div>
      <div className="bubble bubble-7" ></div>
      <div className="bubble bubble-8" ></div>

      <div className="micro-bubble micro-1" ></div>
      <div className="micro-bubble micro-2" ></div>
      <div className="micro-bubble micro-3" ></div>
      <div className="micro-bubble micro-4" ></div>
      <div className="micro-bubble micro-5" ></div>

      <div className="particle particle-1" ></div>
      <div className="particle particle-2" ></div>
      <div className="particle particle-3" ></div>
      <div className="particle particle-4" ></div>
      <div className="particle particle-5" ></div>
      <div className="particle particle-6" ></div>
      <div className="particle particle-7" ></div>
      <div className="particle particle-8" ></div>
      <div className="particle particle-9" ></div>
    <>
      <Header />
      <main className="main">
        <div className="container">
          <h1 className="hero-title">
            Connect.Learn.<span className="gradient-text">Grow.</span>
          </h1>
          <p className="hero-subtitle">
            Join study sessions with TAs, access resources, and build your
            academic network with EduLink's credit-based learning platform.
          </p>
          <div className="cta-button">
            <button
              className="btn-cta-primary"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
            <button
              className="btn-cta-secondary"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </div>
          <section className="features">
            <div className="feature-card">
              <div className="feature-icon-pink">📚</div>
              <h3 className="feature-title">Study Rooms</h3>
              <p className="feature-description">
                Join live Zoom sessions with TAs and earn credits while
                learning.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-purple">🧠</div>
              <h3 className="feature-title">Smart Recommendation</h3>
              <p className="feature-description">
                Get Recommendations on TA based on Course, Credits and
                Availability
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-Indigo">💳</div>
              <h3 className="feature-title">Credit System</h3>
              <p className="feature-description">
                Earn credits by participating and use them to request 1:1
                sessions.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
    </div>
  );
};

export default Home;
