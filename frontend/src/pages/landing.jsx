import React, { useState, useEffect, useCallback } from "react";
import "./styling/landing.css";
import {
  FaShieldAlt,
  FaGraduationCap,
  FaVrCardboard,
  FaBell,
  FaChartLine,
  FaMapMarkedAlt,
  FaUsers,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// Feature & Testimonial Data
const featuresData = [
  {
    icon: <FaGraduationCap />,
    title: "Interactive Learning",
    text: "Gamified modules that make disaster education engaging.",
  },
  {
    icon: <FaVrCardboard />,
    title: "Virtual Drills",
    text: "VR/AR simulations for safe emergency practice.",
  },
  {
    icon: <FaBell />,
    title: "Real-time Alerts",
    text: "Instant notifications during critical situations.",
  },
  {
    icon: <FaChartLine />,
    title: "Progress Tracking",
    text: "Dashboards for administrators to track progress.",
  },
  {
    icon: <FaMapMarkedAlt />,
    title: "Region-Specific Content",
    text: "Custom learning for local disaster risks.",
  },
  {
    icon: <FaUsers />,
    title: "Multi-stakeholder Platform",
    text: "Connects students, teachers & emergency responders.",
  },
];

const testimonialsData = [
  {
    avatar: "RP",
    name: "Rajesh Patel",
    role: "Principal, DPS",
    text: "Saksham revolutionized our disaster training. Students are confident and engaged.",
  },
  {
    avatar: "SM",
    name: "Sunita Mehta",
    role: "Disaster Coordinator",
    text: "The VR drills are incredible. Students practice safely and are better prepared.",
  },
  {
    avatar: "AK",
    name: "Amit Kumar",
    role: "Parent",
    text: "As a parent, I feel safer knowing Saksham prepares my child for floods.",
  },
];

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => isMenuOpen && toggleMenu();

  const handleScroll = useCallback(
    () => setIsScrolled(window.scrollY > 50),
    []
  );
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* Header */}
      <header className={`landing-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="landing-container">
          <nav className="landing-nav">
            <div className="landing-logo">
              <FaShieldAlt className="landing-logo-icon" />
              <span className="landing-logo-text">Saksham</span>
            </div>
            <ul
              className={
                isMenuOpen ? "landing-nav-links active" : "landing-nav-links"
              }
            >
              <li>
                <a href="#home" onClick={closeMenu}>
                  Home
                </a>
              </li>
              <li>
                <a href="#features" onClick={closeMenu}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={closeMenu}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={closeMenu}>
                  Testimonials
                </a>
              </li>
              <li>
                <Link
                  to="/logindashboard"
                  className="landing-btn landing-btn-outline"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/alerts"
                  className="landing-btn landing-btn-outline"
                >
                  alerts
                </Link>
              </li>
            </ul>
            <button className="landing-menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-content">
            <h1>Empowering Campuses, Saving Lives</h1>
            <p>
              Saksham is a comprehensive disaster preparedness platform for
              Indian educational institutions.
            </p>
            <div className="landing-hero-buttons">
              <a href="#features" className="landing-btn landing-btn-primary">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-title">
            <h2>Key Features</h2>
            <p>
              Discover how Saksham transforms disaster preparedness education
            </p>
          </div>
          <div className="landing-features-grid">
            {featuresData.map((f, i) => (
              <div className="landing-feature-card" key={i}>
                <div className="landing-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-how">
        <div className="landing-container">
          <div className="landing-section-title">
            <h2>How Saksham Works</h2>
            <p>Transforming disaster preparedness in four simple steps</p>
          </div>
          <div className="landing-steps">
            {["Sign Up", "Customize", "Engage Students", "Track & Improve"].map(
              (step, i) => (
                <div className="landing-step" key={i}>
                  <div className="landing-step-number">{i + 1}</div>
                  <h3>{step}</h3>
                  <p>
                    {
                      [
                        "Register your institution.",
                        "Select region-relevant modules.",
                        "Interactive learning & drills.",
                        "Monitor with analytics.",
                      ][i]
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="landing-testimonials">
        <div className="landing-container">
          <div className="landing-section-title">
            <h2>What Our Users Say</h2>
            <p>Hear from institutions already using Saksham</p>
          </div>
          <div className="landing-testimonial-grid">
            {testimonialsData.map((t, i) => (
              <div className="landing-testimonial-card" key={i}>
                <p className="landing-testimonial-text">"{t.text}"</p>
                <div className="landing-testimonial-author">
                  <div className="landing-author-avatar">{t.avatar}</div>
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-container">
          <h2>Ready to Transform Your Institution's Preparedness?</h2>
          <p>Join hundreds of schools and colleges across India with Saksham</p>
          <Link to="/admin/register" className="landing-btn landing-btn-light">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-column">
              <h3>Saksham</h3>
              <p>Comprehensive disaster preparedness for education.</p>
              <div className="landing-social-links">
                <a href="https://facebook.com">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com">
                  <FaInstagram />
                </a>
                <a href="https://linkedin.com">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
            <div className="landing-footer-column">
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#testimonials">Testimonials</a>
                </li>
              </ul>
            </div>
            <div className="landing-footer-column">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="/blog">Blog</a>
                </li>
                <li>
                  <a href="/guide">Preparedness Guide</a>
                </li>
                <li>
                  <a href="/research">Research</a>
                </li>
              </ul>
            </div>
            <div className="landing-footer-column">
              <h3>Contact Us</h3>
              <ul>
                <li>
                  <FaMapMarkerAlt /> 123 Safety Avenue, Mumbai
                </li>
                <li>
                  <FaPhone /> +91 98765 43210
                </li>
                <li>
                  <FaEnvelope /> info@saksham.com
                </li>
              </ul>
            </div>
          </div>
          <div className="landing-copyright">
            <p>© {new Date().getFullYear()} Saksham - All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;
