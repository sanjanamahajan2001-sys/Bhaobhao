import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Top Section: Grid Layout */}
        <div className="footer-grid">

          {/* Column 1: Brand & Description */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <img src="./logo.png" alt="" />
              </div>
            </Link>
            <p className="footer-description">
              Step into a world where every grooming experience makes pets look and feel their absolute best
            </p>
          </div>

          {/* Column 2: Services */}
          <div className="footer-column">
            <h3>Services</h3>
            <ul>
              {/* <li><a href="#">Dog Walking</a></li> */}
              <li><a href="https://app.bhaobhao.in/auth/login">Pet Grooming</a></li>
              {/* <li><a href="#">Pet Boarding</a></li>
              <li><a href="#">Veterinary Care</a></li> */}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Safety</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-column">
            <h3>Support</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section: Copyright */}
        <div className="footer-copyright">
          <p>© 2025 Bhao Bhao. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
