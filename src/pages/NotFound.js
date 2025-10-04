import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <Helmet>
        <title>Page Not Found - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div 
          className="not-found-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="not-found-content">
            <motion.div 
              className="error-code"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              404
            </motion.div>
            
            <motion.h1 
              className="error-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Oops! Page Not Found
            </motion.h1>
            
            <motion.p 
              className="error-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              The page you're looking for doesn't exist or has been moved.
            </motion.p>
            
            <motion.div 
              className="error-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link to="/" className="btn btn-primary">
                Go Home
              </Link>
              <Link to="/products" className="btn btn-secondary">
                Browse Products
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
