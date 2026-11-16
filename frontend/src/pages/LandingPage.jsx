import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ChallengeCard from '../components/ChallengeCard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowRight, PlusCircle, CheckCircle2, ShieldCheck, 
  GraduationCap, Building2, Users, Sparkles, Camera, 
  Search, Layers, Cpu, ArrowUpRight, CheckSquare, 
  MapPin, Activity, HelpCircle, ShieldAlert 
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState(null);
  const [featuredChallenges, setFeaturedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [statsRes, challengesRes] = await Promise.all([
          api.get('/stats/platform/'),
          api.get('/challenges/?status=VERIFIED&sort=newest')
        ]);
        setStats(statsRes.data);
        const challengesList = challengesRes.data.results || challengesRes.data;
        setFeaturedChallenges(challengesList.slice(0, 3));
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="py-5 border-bottom position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F7F7F2 0%, #FFFFFF 100%)' }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-lg-6">
              {/* AI Civic-Tech Pill */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3 glass-panel" style={{ border: '1px solid var(--color-soft-mint-border)' }}>
                <Sparkles size={14} className="text-primary-green" />
                <span className="small fw-bold text-forest">Next-Gen Collaborative Civic Intelligence</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="display-4 fw-extrabold text-forest mb-3 lh-tight display-font">
                Real People. <br />
                Real Problems. <br />
                <span className="text-primary-green">Smarter Solutions.</span>
              </h1>

              <p className="lead text-muted-custom mb-4" style={{ maxWidth: '540px', fontSize: '1.15rem', lineHeight: '1.65' }}>
                CivicSync connects citizens facing real-world neighbourhood challenges with universities, researchers, and industry partners to engineer verifiable, collaborative solutions.
              </p>

              {/* Exact Requested Primary Actions */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/submit-challenge" className="btn-civic btn-civic-lg text-decoration-none shadow-sm">
                  <Camera size={20} />
                  <span>Report a Problem</span>
                </Link>
                <Link to="/challenges" className="btn-civic-secondary btn-civic-lg text-decoration-none">
                  <Search size={18} className="text-primary-green" />
                  <span>Explore Challenges</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-2 d-flex flex-wrap align-items-center gap-4 text-muted-custom small">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-green" />
                  <span className="fw-medium">Photo Evidence Verified</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-green" />
                  <span className="fw-medium">Dense Vector Deduplication</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-green" />
                  <span className="fw-medium">University Lab Matching</span>
                </div>
              </div>
            </div>

            {/* Right Architectural & City Visual with Animated Connections */}
            <div className="col-lg-6">
              <div className="position-relative p-4 rounded-4 shadow-sm glass-panel" style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}>
                <svg viewBox="0 0 540 400" className="w-100 h-auto" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E4F1E8" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="buildingGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#287A59" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#173F35" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="buildingGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3E7B99" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#1F4C5E" stopOpacity="0.95" />
                    </linearGradient>
                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Sky & Horizon Canvas */}
                  <rect width="540" height="400" rx="16" fill="url(#skyGrad)" />

                  {/* Architectural Grid Lines (Subtle) */}
                  <line x1="40" y1="340" x2="500" y2="340" stroke="#CBD5D0" strokeWidth="2" />
                  <line x1="40" y1="280" x2="500" y2="280" stroke="#E2E8E4" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="40" y1="200" x2="500" y2="200" stroke="#EDF1EE" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Smart City Architectural Skyline */}
                  {/* Building 1: Municipal Hub */}
                  <rect x="70" y="190" width="60" height="150" rx="4" fill="url(#buildingGrad1)" opacity="0.9" />
                  <rect x="78" y="205" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="94" y="205" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="110" y="205" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="78" y="230" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="94" y="230" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="110" y="230" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="78" y="255" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="94" y="255" width="10" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="110" y="255" width="10" height="12" fill="#E4F1E8" opacity="0.8" />

                  {/* Building 2: University Research Tower */}
                  <rect x="145" y="140" width="75" height="200" rx="4" fill="#173F35" />
                  <line x1="182" y1="140" x2="182" y2="105" stroke="#287A59" strokeWidth="3" />
                  <circle cx="182" cy="100" r="5" fill="#E9B44C" className="pulse-glow" />
                  {/* Windows */}
                  <rect x="155" y="155" width="14" height="16" fill="#E4F1E8" opacity="0.9" />
                  <rect x="175" y="155" width="14" height="16" fill="#E4F1E8" opacity="0.9" />
                  <rect x="195" y="155" width="14" height="16" fill="#E4F1E8" opacity="0.9" />
                  <rect x="155" y="185" width="14" height="16" fill="#E4F1E8" opacity="0.7" />
                  <rect x="175" y="185" width="14" height="16" fill="#E4F1E8" opacity="0.7" />
                  <rect x="195" y="185" width="14" height="16" fill="#E4F1E8" opacity="0.7" />
                  <rect x="155" y="215" width="14" height="16" fill="#E4F1E8" opacity="0.8" />
                  <rect x="175" y="215" width="14" height="16" fill="#E4F1E8" opacity="0.8" />
                  <rect x="195" y="215" width="14" height="16" fill="#E4F1E8" opacity="0.8" />

                  {/* Green Roof Solar Array & Skybridge */}
                  <line x1="220" y1="210" x2="310" y2="210" stroke="#287A59" strokeWidth="5" />
                  <rect x="235" y="202" width="60" height="6" rx="2" fill="#E4F1E8" />

                  {/* Building 3: Industry Innovation Centre */}
                  <rect x="310" y="165" width="85" height="175" rx="4" fill="url(#buildingGrad2)" />
                  <polygon points="310,165 352,125 395,165" fill="#3E7B99" opacity="0.9" />
                  {/* Solar Modules on roof */}
                  <line x1="325" y1="150" x2="340" y2="135" stroke="#E9B44C" strokeWidth="2" />
                  <line x1="365" y1="135" x2="380" y2="150" stroke="#E9B44C" strokeWidth="2" />
                  {/* Windows */}
                  <rect x="325" y="180" width="18" height="12" fill="#FFFFFF" opacity="0.85" />
                  <rect x="350" y="180" width="18" height="12" fill="#FFFFFF" opacity="0.85" />
                  <rect x="375" y="180" width="18" height="12" fill="#FFFFFF" opacity="0.85" />
                  <rect x="325" y="205" width="18" height="12" fill="#FFFFFF" opacity="0.85" />
                  <rect x="350" y="205" width="18" height="12" fill="#FFFFFF" opacity="0.85" />
                  <rect x="375" y="205" width="18" height="12" fill="#FFFFFF" opacity="0.85" />

                  {/* Building 4: Community Transit & Sensor Hub */}
                  <rect x="410" y="225" width="65" height="115" rx="4" fill="#287A59" opacity="0.9" />
                  <rect x="420" y="240" width="12" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="438" y="240" width="12" height="12" fill="#E4F1E8" opacity="0.8" />
                  <rect x="456" y="240" width="12" height="12" fill="#E4F1E8" opacity="0.8" />

                  {/* Dynamic Animated Data Connection Lines */}
                  <path d="M 100 190 Q 182 100 270 70" stroke="#287A59" strokeWidth="2" fill="none" className="flow-line" />
                  <path d="M 270 70 Q 350 120 440 225" stroke="#287A59" strokeWidth="2" fill="none" className="flow-line" />
                  <path d="M 182 100 Q 270 70 350 125" stroke="#E9B44C" strokeWidth="2" fill="none" strokeDasharray="4,4" />

                  {/* Central Civic Intelligence Node */}
                  <g transform="translate(270, 70)">
                    <circle cx="0" cy="0" r="32" fill="#FFFFFF" stroke="#287A59" strokeWidth="2.5" filter="url(#softGlow)" />
                    <circle cx="0" cy="0" r="24" fill="#173F35" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">AI HUB</text>
                  </g>

                  {/* Floating Glassmorphic Tag 1: Citizen Photo */}
                  <g transform="translate(45, 115)">
                    <rect width="115" height="34" rx="8" fill="#FFFFFF" stroke="#C8E3D2" strokeWidth="1.5" filter="drop-shadow(0 2px 6px rgba(23,63,53,0.08))" />
                    <circle cx="16" cy="17" r="7" fill="#E4F1E8" />
                    <text x="16" y="21" textAnchor="middle" fill="#287A59" fontSize="10" fontWeight="bold">📸</text>
                    <text x="28" y="16" fill="#173F35" fontSize="10" fontWeight="bold">Photo Report</text>
                    <text x="28" y="26" fill="#69746E" fontSize="8">Geo-verified</text>
                  </g>

                  {/* Floating Glassmorphic Tag 2: SBERT Similarity */}
                  <g transform="translate(385, 95)">
                    <rect width="125" height="34" rx="8" fill="#FFFFFF" stroke="#C8E3D2" strokeWidth="1.5" filter="drop-shadow(0 2px 6px rgba(23,63,53,0.08))" />
                    <circle cx="16" cy="17" r="7" fill="#E4F1E8" />
                    <text x="16" y="21" textAnchor="middle" fill="#287A59" fontSize="10" fontWeight="bold">⚡</text>
                    <text x="28" y="16" fill="#173F35" fontSize="10" fontWeight="bold">Semantic Match</text>
                    <text x="28" y="26" fill="#69746E" fontSize="8">No duplicate waste</text>
                  </g>

                  {/* Floating Glassmorphic Tag 3: University Proposal */}
                  <g transform="translate(205, 345)">
                    <rect width="130" height="32" rx="8" fill="#173F35" filter="drop-shadow(0 4px 10px rgba(15,45,37,0.15))" />
                    <circle cx="16" cy="16" r="6" fill="#287A59" />
                    <text x="16" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="9">✓</text>
                    <text x="28" y="20" fill="#FFFFFF" fontSize="10" fontWeight="bold">On-Ground Pilot Active</text>
                  </g>
                </svg>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top text-muted-custom small">
                  <span className="d-flex align-items-center gap-1">
                    <MapPin size={13} className="text-primary-green" />
                    <span>Real-time smart civic infrastructure graph</span>
                  </span>
                  <span className="badge bg-soft-mint text-forest fw-semibold">
                    Live System Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <StatCard 
                title="Challenges Reported" 
                value={stats?.total_challenges ?? '10'} 
                subtitle="From registered citizen communities" 
                icon={Users}
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard 
                title="Ground Verified" 
                value={stats?.verified_challenges ?? '6'} 
                subtitle="Inspected by civic moderators" 
                icon={ShieldCheck} 
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard 
                title="Partner Universities" 
                value={stats?.universities_count ?? '3'} 
                subtitle="Engineering & R&D labs" 
                icon={GraduationCap} 
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard 
                title="Solutions In Action" 
                value={stats?.in_progress_challenges ?? '3'} 
                subtitle="Funded milestone projects" 
                icon={Building2} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Visual Workflow: Report → Analyse → Match → Solve → Track */}
      <section id="how-it-works" className="py-5 bg-warm-offwhite border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <span className="small text-primary-green fw-bold text-uppercase tracking-wider">
              Proven 5-Stage Lifecycle
            </span>
            <h2 className="display-font fw-bold text-forest mb-2 fs-2">
              How CivicSync Solves Neighbourhood Problems
            </h2>
            <p className="text-muted-custom small mb-0">
              Moving from community pain points to verified engineering deployment in five structured phases.
            </p>
          </div>

          <div className="workflow-ribbon mb-4">
            {/* Step 1 */}
            <div className="workflow-card">
              <span className="workflow-num">01</span>
              <div className="p-2 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
                <Camera size={20} />
              </div>
              <h5 className="fw-bold text-forest mb-1 fs-6">1. Report</h5>
              <p className="small text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                Citizens snap photos on mobile or desktop, tag location, and describe local severity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="workflow-card">
              <span className="workflow-num">02</span>
              <div className="p-2 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
                <Cpu size={20} />
              </div>
              <h5 className="fw-bold text-forest mb-1 fs-6">2. Analyse</h5>
              <p className="small text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                Local AI structures keywords, checks dense semantic similarity, and prevents duplication.
              </p>
            </div>

            {/* Step 3 */}
            <div className="workflow-card">
              <span className="workflow-num">03</span>
              <div className="p-2 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
                <GraduationCap size={20} />
              </div>
              <h5 className="fw-bold text-forest mb-1 fs-6">3. Match</h5>
              <p className="small text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                Recommender engine pairs the issue with specialized university departments and faculties.
              </p>
            </div>

            {/* Step 4 */}
            <div className="workflow-card">
              <span className="workflow-num">04</span>
              <div className="p-2 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
                <Building2 size={20} />
              </div>
              <h5 className="fw-bold text-forest mb-1 fs-6">4. Solve</h5>
              <p className="small text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                University labs submit vetted proposals, backed by industry CSR grants and mentorship.
              </p>
            </div>

            {/* Step 5 */}
            <div className="workflow-card">
              <span className="workflow-num">05</span>
              <div className="p-2 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
                <CheckSquare size={20} />
              </div>
              <h5 className="fw-bold text-forest mb-1 fs-6">5. Track</h5>
              <p className="small text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                Transparent milestone checklists and progress dispatches ensure real-world completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Photo-Based Reporting Feature Callout */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-3">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4 glass-panel position-relative overflow-hidden" style={{ border: '1.5px solid var(--color-soft-mint-border)' }}>
                <div className="d-flex align-items-center gap-2 text-primary-green fw-bold small text-uppercase mb-2">
                  <Camera size={18} />
                  <span>Designed For Fast Field Reporting</span>
                </div>
                <h3 className="display-font fw-bold text-forest mb-3 fs-3">
                  Snap, upload, and let AI structure the rest.
                </h3>
                <p className="text-muted-custom small mb-4" style={{ lineHeight: '1.65' }}>
                  No complicated municipal paperwork. Citizens can take a photo directly from their smartphone camera or upload ground evidence from desktop. CivicSync automatically validates file integrity, suggests relevant departments, and initiates the collaboration workflow.
                </p>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-circle bg-soft-mint text-forest flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong className="text-forest small d-block">Native Mobile Camera Capture</strong>
                      <span className="text-muted-custom small">Direct camera capture trigger on smartphones with live preview.</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-circle bg-soft-mint text-forest flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong className="text-forest small d-block">Instant Duplicate Pre-Check</strong>
                      <span className="text-muted-custom small">SBERT cosine comparison warns you if neighbours reported the exact issue.</span>
                    </div>
                  </div>
                </div>

                <Link to="/submit-challenge" className="btn-civic text-decoration-none shadow-xs">
                  <Camera size={18} />
                  <span>Start a Photo-Based Report</span>
                </Link>
              </div>
            </div>

            {/* Visual Photo Upload Mockup */}
            <div className="col-lg-6">
              <div className="cs-card p-4 rounded-4 shadow-md bg-warm-offwhite">
                <div className="photo-dropzone p-4 mb-3">
                  <div className="p-3 rounded-circle bg-white shadow-xs d-inline-flex mb-3">
                    <Camera size={28} className="text-primary-green" />
                  </div>
                  <h6 className="fw-bold text-forest mb-1">Upload Photo or Use Mobile Camera</h6>
                  <p className="small text-muted-custom mb-3">
                    Supports JPG, PNG, and WebP (up to 5 MB)
                  </p>
                  <div className="d-inline-flex gap-2">
                    <span className="btn btn-sm btn-civic px-3">
                      Choose Evidence Photo
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-soft-mint text-forest">Example</span>
                    <span className="small text-forest fw-semibold">Borewell_Water_Report_2026.jpg</span>
                  </div>
                  <span className="small text-muted-custom">1.4 MB • Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Challenges */}
      <section className="py-5 bg-warm-offwhite">
        <div className="container py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary-green small fw-bold text-uppercase tracking-wider">
                Ground Reality Feed
              </span>
              <h2 className="display-font fw-bold text-forest mb-1 fs-2">
                Featured Verified Challenges
              </h2>
              <p className="text-muted-custom small mb-0">
                Verified community concerns currently seeking university capstone research proposals and industry CSR sponsorship.
              </p>
            </div>
            <Link to="/challenges" className="btn-civic-secondary text-decoration-none mt-3 mt-md-0">
              <span>View All Challenges</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading verified challenges..." />
          ) : (
            <div className="row g-4">
              {featuredChallenges.map((challenge) => (
                <div key={challenge.id} className="col-md-6 col-lg-4">
                  <ChallengeCard challenge={challenge} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tripartite Collaboration Section */}
      <section id="collaboration" className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <span className="text-primary-green small fw-bold text-uppercase tracking-wider">
              Shared Intelligence Ecosystem
            </span>
            <h2 className="display-font fw-bold text-forest mb-2 fs-2">
              Every Stakeholder Brings Unique Power
            </h2>
            <p className="text-muted-custom small mb-0">
              Connecting citizen ground realities with academic engineering talent and corporate resource funding.
            </p>
          </div>

          <div className="row g-4">
            {/* Citizens */}
            <div className="col-md-4">
              <div className="cs-card p-4 h-100 cs-card-accent-top">
                <div className="p-3 rounded-circle d-inline-flex mb-3 bg-soft-mint">
                  <Users size={24} className="text-primary-green" />
                </div>
                <h5 className="fw-bold text-forest mb-2">Citizens & Communities</h5>
                <p className="small text-muted-custom mb-3">
                  Report acute ground problems, upload photographic evidence, review similar submissions, and follow milestone progress transparently.
                </p>
                <ul className="list-unstyled small text-muted-custom d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Photo-based problem reporting</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> AI duplicate notification</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Live milestone notifications</li>
                </ul>
              </div>
            </div>

            {/* Universities */}
            <div id="universities" className="col-md-4">
              <div className="cs-card p-4 h-100 cs-card-accent-top">
                <div className="p-3 rounded-circle d-inline-flex mb-3" style={{ backgroundColor: '#EEF6FA' }}>
                  <GraduationCap size={24} className="text-info-blue" />
                </div>
                <h5 className="fw-bold text-forest mb-2">Universities & Research Labs</h5>
                <p className="small text-muted-custom mb-3">
                  Discover societal problems matched with department capabilities. Submit student capstone or grant-funded research solutions.
                </p>
                <ul className="list-unstyled small text-muted-custom d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> AI-matched problem recommendations</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Technical proposal submission</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Verifiable milestone progress updates</li>
                </ul>
              </div>
            </div>

            {/* Industry Partners */}
            <div className="col-md-4">
              <div className="cs-card p-4 h-100 cs-card-accent-top">
                <div className="p-3 rounded-circle d-inline-flex mb-3" style={{ backgroundColor: 'var(--color-amber-bg)' }}>
                  <Building2 size={24} className="text-warning" />
                </div>
                <h5 className="fw-bold text-forest mb-2">Industry & CSR Partners</h5>
                <p className="small text-muted-custom mb-3">
                  Channel corporate social responsibility mandates, technology mentorship, and grant funding towards high-impact community solutions.
                </p>
                <ul className="list-unstyled small text-muted-custom d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Sponsor university pilot projects</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Offer engineering mentorship & equipment</li>
                  <li className="d-flex align-items-center gap-1.5"><span className="text-primary-green">✓</span> Verifiable CSR impact reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-5 bg-forest text-white">
        <div className="container py-4 text-center">
          <h2 className="display-font fw-bold text-white mb-3 fs-2">
            Have a problem in your street or neighbourhood?
          </h2>
          <p className="text-light-50 mb-4 mx-auto" style={{ maxWidth: '620px', color: 'rgba(255, 255, 255, 0.82)' }}>
            Take a photo, outline what is happening, and let CivicSync connect your report with university research departments and funding partners.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/submit-challenge" className="btn-civic btn-civic-lg text-decoration-none shadow-md">
              <Camera size={20} />
              <span>Report a Problem Now</span>
            </Link>
            <Link to="/challenges" className="btn btn-outline-light btn-civic-lg fw-semibold rounded">
              Explore Active Challenges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
