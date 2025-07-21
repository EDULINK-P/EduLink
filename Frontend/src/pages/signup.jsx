import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { validateAcademicEmail } from "../utils/validateAcademicEmail";
import "../assets/form.css";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const isAcademic = await validateAcademicEmail(email);
    if (!isAcademic) {
      setError("Please enter a valid academic email address");
      return;
    }
    const res = await signup(name, email, password);
    console.log(res);
    if (res.user) navigate('/profileSetup');
    else {
      setError(res.error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Join Edulink</h2>
        <p className="form-subtitle">Create an Account to get started</p>
      </div>
      <form>
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
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
            placeholder="Create your Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <p className="error-message">{error}</p>
        <button type="submit" className="form-button" onClick={handleSignUp}>
          Create Account
        </button>
        <p className="form-link">
          Already have an account?
          <a className="form-link-a" href="/login">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
