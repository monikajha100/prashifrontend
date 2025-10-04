import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Login - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div 
          className="login-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="login-form-container">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
