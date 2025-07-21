import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "../assets/form.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      console.log(result);
      if (result && result.user) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.log(error);
      setError("Something went wrong");
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Login to EduLink</h2>
        <p className="form-subtitle">
          Welcome back! Please sign in to your account
        </p>
      </div>
      <form>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter your Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Enter your Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button" onClick={handleLogin}>
          Login
        </button>
        <p className="error-message">{error}</p>
        <p className="form-link">
          Don't have an account?
          <a className="form-link-a" href="/signup">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
