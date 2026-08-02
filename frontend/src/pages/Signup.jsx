import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-image-section">
        <div className="auth-image-overlay">
          <div className="auth-brand-info">
            <h1>GRPS Plywood & Laminates</h1>
            <p>Join the team and manage our premium inventory efficiently.</p>
          </div>
        </div>
      </div>
      <div className="auth-form-section">
        <div className="auth-card glassmorphism">
          <h2>Create Account</h2>
          <p className="subtitle">Join GRPS Plywood Tracker</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="primary-btn">Sign Up</button>
          </form>
          <p className="switch-auth">Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
