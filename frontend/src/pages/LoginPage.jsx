import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogIn, Lock, User, ArrowRight, Shield, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(username, password);
    if (res.success) {
      if (res.user.role === 'ADMIN') navigate('/dashboard/admin');
      else if (res.user.role === 'UNIVERSITY') navigate('/dashboard/university');
      else if (res.user.role === 'INDUSTRY') navigate('/dashboard/industry');
      else navigate('/dashboard/citizen');
    } else {
      setErrorMsg(res.message);
    }
  };

  const setDemoUser = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="py-5 bg-warm-offwhite min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div 
            className="p-2 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ backgroundColor: 'var(--color-primary-green)', width: '42px', height: '42px' }}
          >
            <Sprout size={24} className="text-white" />
          </div>
          <h2 className="display-font fw-bold text-forest mb-1">Welcome to CivicSync</h2>
          <p className="text-muted-custom small mb-0">Sign in to your role-based platform portal</p>
        </div>

        <div className="cs-card p-4 p-md-5 mb-4">
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-civic">Username</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <User size={16} className="text-muted-custom" />
                </span>
                <input 
                  type="text" 
                  className="form-control form-control-civic border-start-0" 
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label-civic">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted-custom" />
                </span>
                <input 
                  type="password" 
                  className="form-control form-control-civic border-start-0" 
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-civic w-100 py-2 mb-3" 
              disabled={loading}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-3 border-top mt-3">
            <span className="small text-muted-custom fw-semibold d-block mb-2">
              ⚡ Quick Demo Logins (Click to autofill):
            </span>
            <div className="d-grid gap-1">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2"
                onClick={() => setDemoUser('arun_kumar', 'citizen123')}
              >
                👤 <strong>Citizen:</strong> arun_kumar
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2"
                onClick={() => setDemoUser('admin', 'admin123')}
              >
                🛡️ <strong>Administrator:</strong> admin
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2"
                onClick={() => setDemoUser('iit_madras', 'uni123')}
              >
                🎓 <strong>University:</strong> iit_madras
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2"
                onClick={() => setDemoUser('cleantech_labs', 'ind123')}
              >
                🏢 <strong>Industry Partner:</strong> cleantech_labs
              </button>
            </div>
          </div>
        </div>

        <div className="text-center small text-muted-custom">
          Do not have an account?{' '}
          <Link to="/register" className="fw-semibold text-primary-green">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
