import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaTwitter } from 'react-icons/fa';
import './Footer.css';
import { visitorAPI } from '../services/api';

const Footer = () => {
  useEffect(() => {
    const sessionKey = 'praashiVisitorTracked';
    const supportsSessionStorage =
      typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

    const hasTracked = supportsSessionStorage
      ? window.sessionStorage.getItem(sessionKey)
      : false;
    if (hasTracked) {
      return;
    }

    const registerVisit = async () => {
      try {
        await visitorAPI.trackVisit();
        if (supportsSessionStorage) {
          window.sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Visitor tracking failed', error);
        }
      }
    };

    registerVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Information */}
          <div className="footer-section brand-section">
            <div className="footer-logo-container">
              <img src="/logo.png" alt="Praashi by Supal" className="footer-logo" />
            </div>
            <p className="brand-description">
              Praashi By Supal – Your go-to destination for trendy imitation jewellery. 
              From minimalist everyday pieces to festive statement collections, we design 
              jewellery that complements every outfit, mood and occasion.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/share/1CAiyYCvFF/" className="social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/praashi_by_supal?igsh=MW4xanczNnBub3pjNg==" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/company/praashi-by-supal/" className="social-link" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="https://youtube.com/@praashibysupal?si=VH3HaUPPYFAvaGJn" className="social-link" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="https://x.com/praashibysupal?t=qX0v9KtHevlyG5GkdFoMQw&s=08" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://www.threads.com/@praashi_by_supal" className="social-link" aria-label="Threads">
                <span className="threads-icon">T</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-section">
            <h3 className="footer-title">Shop</h3>
            <div className="footer-links">
              <Link to="/products?category=necklaces" className="footer-link">Necklace Sets</Link>
              <Link to="/products?category=earrings" className="footer-link">Earrings</Link>
              <Link to="/products?category=watches" className="footer-link">Watches</Link>
              <Link to="/products?category=rings" className="footer-link">Rings</Link>
              <Link to="/products?category=bracelets" className="footer-link">Bracelets</Link>
              <Link to="/products?category=fragrance" className="footer-link">Fragrance</Link>
            </div>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3 className="footer-title">Company</h3>
            <div className="footer-links">
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <Link to="/careers" className="footer-link">Careers</Link>
              <Link to="/partner" className="footer-link">Partnerships</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-details">
                  <strong>Store Address</strong>
                  <div className="address-lines">
                    <span>203 SF Anikedhya Capital -2</span>
                    <span>Nr Mahalaxmi Cross Road,</span>
                    <span>Paldi, Ahmedabad</span>
                    <span>Gujarat, India - 380006</span>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <a href="tel:+918780606280" className="contact-text contact-link">
                  +91 87806 06280
                </a>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <a href="mailto:hello@praashibysupal.com" className="contact-text contact-link">
                  hello@praashibysupal.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-separator"></div>
          <div className="footer-bottom-content">
            <div className="footer-bottom-links">
              <Link to="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
              <Link to="/terms-of-service" className="footer-bottom-link">Terms of Service</Link>
              <Link to="/shipping-info" className="footer-bottom-link">Shipping Info</Link>
              <Link to="/returns-exchanges" className="footer-bottom-link">Returns & Exchanges</Link>
            </div>

            <div className="footer-bottom-copy-wrapper">
              <div className="footer-bottom-sparkle" aria-hidden="true"></div>
              <p className="copyright">© 2025 All rights reserved by Praashi By Supal</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
