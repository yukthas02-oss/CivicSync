import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, UserPlus, Lock, User, Mail, Building2, Phone } from 'lucide-react';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'CITIZEN',
    organization_name: '',
    phone_number: '',
    password: '',
    password2: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.password2) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      if (res.user?.role === 'UNIVERSITY') navigate('/dashboard/university');
      else if (res.user?.role === 'INDUSTRY') navigate('/dashboard/industry');
      else navigate('/dashboard/citizen');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="py-5 bg-warm-offwhite min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <div 
            className="p-2 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ backgroundColor: 'var(--color-primary-green)', width: '42px', height: '42px' }}
          >
            <Sprout size={24} className="text-white" />
          </div>
          <h2 className="display-font fw-bold text-forest mb-1">Create CivicSync Account</h2>
          <p className="text-muted-custom small mb-0">Join the civic problem-solving and research network</p>
        </div>

        <div className="cs-card p-4 p-md-5 mb-4">
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selector Tabs */}
            <div className="mb-4">
              <label className="form-label-civic">Select Your Platform Role</label>
              <div className="row g-2">
                <div className="col-4">
                  <button 
                    type="button" 
                    className={`btn w-100 py-2 small fw-semibold ${formData.role === 'CITIZEN' ? 'btn-civic' : 'btn-light'}`}
                    onClick={() => setFormData({...formData, role: 'CITIZEN'})}
                  >
                    Citizen
                  </button>
                </div>
                <div className="col-4">
                  <button 
                    type="button" 
                    className={`btn w-100 py-2 small fw-semibold ${formData.role === 'UNIVERSITY' ? 'btn-civic' : 'btn-light'}`}
                    onClick={() => setFormData({...formData, role: 'UNIVERSITY'})}
                  >
                    University
                  </button>
                </div>
                <div className="col-4">
                  <button 
                    type="button" 
                    className={`btn w-100 py-2 small fw-semibold ${formData.role === 'INDUSTRY' ? 'btn-civic' : 'btn-light'}`}
                    onClick={() => setFormData({...formData, role: 'INDUSTRY'})}
                  >
                    Industry
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label-civic">Username *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><User size={16} className="text-muted-custom" /></span>
                <input 
                  type="text" 
                  name="username"
                  className="form-control form-control-civic border-start-0" 
                  required
                  placeholder="Unique username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label-civic">Email Address *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Mail size={16} className="text-muted-custom" /></span>
                <input 
                  type="email" 
                  name="email"
                  className="form-control form-control-civic border-start-0" 
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.role !== 'CITIZEN' && (
              <div className="mb-3">
                <label className="form-label-civic">
                  {formData.role === 'UNIVERSITY' ? 'University / Institute Name *' : 'Company / Organization Name *'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><Building2 size={16} className="text-muted-custom" /></span>
                  <input 
                    type="text" 
                    name="organization_name"
                    className="form-control form-control-civic border-start-0" 
                    required
                    placeholder={formData.role === 'UNIVERSITY' ? 'e.g. IIT Madras' : 'e.g. CleanTech Innovations Pvt Ltd'}
                    value={formData.organization_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label-civic">Password *</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control form-control-civic" 
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-civic">Confirm Password *</label>
                <input 
                  type="password" 
                  name="password2"
                  className="form-control form-control-civic" 
                  required
                  placeholder="Repeat password"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-civic w-100 py-2" 
              disabled={loading}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>

        <div className="text-center small text-muted-custom">
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold text-primary-green">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
