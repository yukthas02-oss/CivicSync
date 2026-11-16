import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, PlusCircle, LogIn, LogOut, Camera,
  Menu, X, Shield, GraduationCap, Building2, LayoutDashboard 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isUniversity, isIndustry } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isUniversity) return '/dashboard/university';
    if (isIndustry) return '/dashboard/industry';
    return '/dashboard/citizen';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin Console';
    if (isUniversity) return 'University Portal';
    if (isIndustry) return 'Industry Hub';
    return 'Citizen Portal';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-civic py-2.5">
      <div className="container">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2.5 text-decoration-none">
          <div 
            className="p-1.5 rounded-circle d-flex align-items-center justify-content-center shadow-xs"
            style={{ 
              background: 'linear-gradient(135deg, #287A59 0%, #173F35 100%)', 
              width: '36px', 
              height: '36px' 
            }}
          >
            <Sprout size={20} className="text-white" />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold tracking-tight text-forest fs-5 display-font lh-1">CivicSync</span>
            <span className="text-muted-custom" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              COLLABORATIVE CIVIC TECH
            </span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="navbar-toggler border-0 shadow-none p-1.5 rounded" 
          type="button" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} className="text-forest" /> : <Menu size={24} className="text-forest" />}
        </button>

        {/* Desktop & Collapsed Menu */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="civicNavbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link px-3 fw-medium ${isActive('/') ? 'text-primary-green fw-bold' : 'text-forest'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/challenges" 
                className={`nav-link px-3 fw-medium ${isActive('/challenges') ? 'text-primary-green fw-bold' : 'text-forest'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Challenges
              </Link>
            </li>
            <li className="nav-item">
              <a 
                href="/#how-it-works" 
                className="nav-link px-3 fw-medium text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/#universities" 
                className="nav-link px-3 fw-medium text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Universities
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/#collaboration" 
                className="nav-link px-3 fw-medium text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collaboration
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center flex-wrap gap-2.5">
            {/* Primary Action Button: Report a Problem */}
            <Link 
              to="/submit-challenge" 
              className="btn-civic text-decoration-none shadow-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Camera size={16} />
              <span>Report a Problem</span>
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link 
                  to={getDashboardPath()} 
                  className="btn-civic-secondary text-decoration-none py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={15} className="text-primary-green" />
                  <span>{getRoleLabel()}</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline-secondary btn-sm py-2 px-2.5 d-flex align-items-center gap-1 rounded"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link 
                  to="/login" 
                  className="btn-civic-secondary text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={15} />
                  <span>Log In</span>
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-outline-dark btn-sm fw-semibold px-3 py-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
