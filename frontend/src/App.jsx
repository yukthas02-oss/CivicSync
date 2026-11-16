import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import ExploreChallengesPage from './pages/ExploreChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import SubmitChallengePage from './pages/SubmitChallengePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UniversityDashboard from './pages/UniversityDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Exploratory Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="challenges" element={<ExploreChallengesPage />} />
            <Route path="challenges/:id" element={<ChallengeDetailPage />} />
            <Route path="submit-challenge" element={<SubmitChallengePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Role-Specific Dashboards */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="citizen" element={<CitizenDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="university" element={<UniversityDashboard />} />
            <Route path="industry" element={<IndustryDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
