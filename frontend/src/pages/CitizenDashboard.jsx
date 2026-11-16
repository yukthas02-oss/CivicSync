import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ChallengeCard from '../components/ChallengeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { PlusCircle, FileText, Clock, CheckCircle2, Heart, Activity, Camera } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboards/citizen/');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching citizen dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your citizen dashboard..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="cs-card p-4 p-md-5 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="small text-primary-green fw-semibold text-uppercase tracking-wider">
              Citizen Portal
            </span>
            <h2 className="display-font fw-bold text-forest mb-1">
              Welcome back, {user?.username}
            </h2>
            <p className="text-muted-custom small mb-0">
              Track your reported community challenges and monitor progress on real-world interventions.
            </p>
          </div>
          <Link to="/submit-challenge" className="btn-civic text-decoration-none shadow-xs">
            <Camera size={16} />
            <span>Report a Problem</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Total Submitted" 
            value={data?.submitted_count ?? 0} 
            subtitle="Ground reports" 
            icon={FileText} 
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Pending Review" 
            value={data?.pending_count ?? 0} 
            subtitle="Awaiting admin check" 
            icon={Clock} 
            colorClass="text-warning"
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Verified & Active" 
            value={(data?.verified_count || 0) + (data?.in_progress_count || 0)} 
            subtitle="Seeking / In solutions" 
            icon={Activity} 
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Resolved" 
            value={data?.resolved_count ?? 0} 
            subtitle="Completed interventions" 
            icon={CheckCircle2} 
            colorClass="text-success"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button 
          className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'my' ? 'btn-civic' : 'btn-light'}`}
          onClick={() => setActiveTab('my')}
        >
          My Submissions ({data?.my_challenges?.length || 0})
        </button>
        <button 
          className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'following' ? 'btn-civic' : 'btn-light'}`}
          onClick={() => setActiveTab('following')}
        >
          Following Challenges ({data?.following_challenges?.length || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'my' ? (
        data?.my_challenges?.length === 0 ? (
          <EmptyState 
            title="No challenges submitted yet" 
            description="Have you noticed an issue regarding water, waste, traffic, or infrastructure in your locality? Submit a challenge to get research labs and civic partners involved."
            actionLabel="Submit Your First Challenge"
            actionLink="/submit-challenge"
          />
        ) : (
          <div className="row g-4">
            {data.my_challenges.map((ch) => (
              <div key={ch.id} className="col-md-6">
                <ChallengeCard challenge={ch} />
              </div>
            ))}
          </div>
        )
      ) : (
        data?.following_challenges?.length === 0 ? (
          <EmptyState 
            title="You are not following any challenges" 
            description="Click the 'Follow' button on any challenge detail page to track its updates and proposals here."
            actionLabel="Explore Challenges"
            actionLink="/challenges"
          />
        ) : (
          <div className="row g-4">
            {data.following_challenges.map((ch) => (
              <div key={ch.id} className="col-md-6">
                <ChallengeCard challenge={ch} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default CitizenDashboard;
