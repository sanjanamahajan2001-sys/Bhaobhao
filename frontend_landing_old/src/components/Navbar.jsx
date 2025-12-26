import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 100;
  
    const handleScroll = () => {
      let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
      if (currentScroll <= scrollThreshold) {
        // Show navbar at top of page
        navbar.style.transform = 'translateX(-50%) translateY(0)';
        navbar.style.opacity = '1';
      } else {
        // User has scrolled down past threshold → permanently hide
        navbar.style.transform = 'translateX(-50%) translateY(-120px)';
        navbar.style.opacity = '0';
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  const handleToggle = () => {
    setIsOpen(!isOpen);
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    navToggle.classList.toggle('active');
    navMobile.classList.toggle('active');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    navToggle.classList.remove('active');
    navMobile.classList.remove('active');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo - LEFT */}
        <a href="#" className="nav-logo">
          <img src="./logo.png" alt="Bhao Bhao" />
        </a>

        {/* Right Side - Menu + Contact together */}
        <div className="nav-right">
          <ul className="nav-menu">
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#testimonials" className="nav-link">Happy Parents</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
          </ul>

          <a href="#contact" className="nav-contact">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
              </path>
            </svg>
            Contact
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button className="nav-toggle" id="navToggle" onClick={handleToggle}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="nav-mobile" id="navMobile">
        <ul className="nav-mobile-menu">
          <li><a href="#services" className="nav-mobile-link" onClick={handleLinkClick}>Services</a></li>
          <li><a href="#testimonials" className="nav-mobile-link" onClick={handleLinkClick}>Happy Parents</a></li>
          <li><a href="#about" className="nav-mobile-link" onClick={handleLinkClick}>About</a></li>
          <li>
            <a href="#contact" className="nav-mobile-contact" onClick={handleLinkClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                </path>
              </svg>
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
