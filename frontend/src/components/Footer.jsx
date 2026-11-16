import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, ShieldAlert, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-forest text-light pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand & Mission */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="p-1 rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--color-primary-green)', width: '32px', height: '32px' }}
              >
                <Sprout size={18} className="text-white" />
              </div>
              <span className="fw-bold fs-4 text-white display-font">CivicSync</span>
            </div>
            <p className="text-light-50 small mb-3 text-secondary" style={{ maxWidth: '340px' }}>
              From community challenges to collaborative solutions. Connecting citizen ground realities with university research and industry capabilities.
            </p>
            <div className="p-3 rounded small border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div className="d-flex align-items-center gap-2 text-warning mb-1 fw-semibold">
                <ShieldAlert size={14} />
                <span>SIH26043 College Mini-Project</span>
              </div>
              <p className="mb-0 text-secondary" style={{ fontSize: '0.785rem' }}>
                Demonstration platform featuring local AI analysis and semantic similarity duplicate detection. All institutional profiles and data are for educational demonstration.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-sm-6 col-lg-2 offset-lg-1">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider small">Platform</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/challenges" className="text-secondary text-decoration-none hover-white">Explore Challenges</Link></li>
              <li><Link to="/submit-challenge" className="text-secondary text-decoration-none hover-white">Report a Problem</Link></li>
              <li><a href="/#how-it-works" className="text-secondary text-decoration-none hover-white">How It Works</a></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-white">Role Portal Login</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-sm-6 col-lg-2">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider small">Key Focus Areas</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>Water & Groundwater</li>
              <li>Waste & Plastic Mitigation</li>
              <li>Urban Traffic & Mobility</li>
              <li>Air Quality Monitoring</li>
              <li>Universal Accessibility</li>
              <li>Community Healthcare</li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div className="col-sm-6 col-lg-3">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider small">Collaborative Ecosystem</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li><strong>Citizens:</strong> Report ground issues & monitor milestones</li>
              <li><strong>Universities:</strong> Submit technical proposals & research solutions</li>
              <li><strong>Industry:</strong> Provide CSR funding, mentorship & technology</li>
              <li><strong>Administrators:</strong> Ground verification & project approval</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-top border-secondary d-flex flex-wrap justify-content-between align-items-center gap-3 small text-secondary">
          <p className="mb-0">
            © {new Date().getFullYear()} CivicSync. Built for SIH26043 with React, Django REST Framework & Semantic AI.
          </p>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Public Participation</span>
            <span>•</span>
            <span>Accessibility Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
