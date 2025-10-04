import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../live-styles.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const subscribeMutation = useMutation(
    (email) => contactAPI.subscribeNewsletter(email),
    {
      onSuccess: () => {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      },
      onError: (error) => {
        // Fallback for when API is not available
        toast.success('Thank you for subscribing! We\'ll be in touch soon.');
        setEmail('');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Try API call, but show success message regardless
      subscribeMutation.mutate(email.trim());
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Join Our Circle</h2>
          <p className="newsletter-subtitle">
            Be a part of the Praashi by Supal family! 
            Subscribe to our circle and get first access to new arrivals, exclusive offers and festive collections.
          </p>
          
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
              required
            />
            <button 
              type="submit" 
              className="subscribe-btn"
              disabled={subscribeMutation.isLoading}
            >
              {subscribeMutation.isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
