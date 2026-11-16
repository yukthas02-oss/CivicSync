import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  LayoutDashboard, PlusCircle, Search, FileText, 
  Settings, UserCheck, Award, Briefcase, BarChart3, Shield, GraduationCap, Building2, Camera 
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, isCitizen, isAdmin, isUniversity, isIndustry } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100 bg-warm-offwhite">
      <Navbar />
      <div className="container py-4 flex-grow-1">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="cs-card p-4 sticky-top" style={{ top: '100px' }}>
              {/* User Profile Card */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-5"
                  style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-primary-green)' }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h6 className="fw-bold mb-0 text-truncate">{user?.username}</h6>
                  <span className="badge bg-light text-forest border small">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="d-flex flex-column gap-1">
                {isCitizen && (
                  <>
                    <Link 
                      to="/dashboard/citizen" 
                      className={`btn w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${isActive('/dashboard/citizen') ? 'btn-civic' : 'btn-light'}`}
                    >
                      <LayoutDashboard size={16} />
                      <span>My Citizen Dashboard</span>
                    </Link>
                    <Link 
                      to="/submit-challenge" 
                      className="btn btn-light w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded"
                    >
                      <Camera size={16} className="text-primary-green" />
                      <span>Report a Problem</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link 
                      to="/dashboard/admin" 
                      className={`btn w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${isActive('/dashboard/admin') ? 'btn-civic' : 'btn-light'}`}
                    >
                      <Shield size={16} />
                      <span>Admin Moderation Queue</span>
                    </Link>
                  </>
                )}

                {isUniversity && (
                  <>
                    <Link 
                      to="/dashboard/university" 
                      className={`btn w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${isActive('/dashboard/university') ? 'btn-civic' : 'btn-light'}`}
                    >
                      <GraduationCap size={16} />
                      <span>University Portal</span>
                    </Link>
                  </>
                )}

                {isIndustry && (
                  <>
                    <Link 
                      to="/dashboard/industry" 
                      className={`btn w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${isActive('/dashboard/industry') ? 'btn-civic' : 'btn-light'}`}
                    >
                      <Building2 size={16} />
                      <span>Industry CSR Hub</span>
                    </Link>
                  </>
                )}

                <Link 
                  to="/challenges" 
                  className="btn btn-light w-100 text-start d-flex align-items-center gap-2 py-2 px-3 rounded mt-2"
                >
                  <Search size={16} />
                  <span>Browse All Challenges</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="col-lg-9">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
