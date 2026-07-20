import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiSend, FiTwitter, FiFacebook, FiInstagram, FiGithub } from './Icons';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <FiCalendar /> Event<span>Hub</span>
            </Link>
            <p className="footer-description">
              Pioneering modern events, technology summits, and professional networking spaces.
              We bring the community together to share insights, build networks, and empower growth.
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/events" className="footer-link">Events</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link">Terms of Service</a></li>
              <li><a href="#security" className="footer-link">Security Policies</a></li>
              <li><a href="#refund" className="footer-link">Refund Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="footer-heading">Newsletter</h4>
            <p style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
              Subscribe to stay updated with future summits, early-bird ticket releases, and special discounts.
            </p>
            {subscribed ? (
              <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '14px' }}>
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <FiSend />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} EventHub Inc. All rights reserved.
          </div>
          <div className="footer-social-icons">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Github">
              <FiGithub />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
