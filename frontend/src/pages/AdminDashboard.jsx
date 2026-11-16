import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, 
  BarChart3, Clock, Check, Eye, Lightbulb, Users 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    try {
      const [adminRes, statsRes] = await Promise.all([
        api.get('/dashboards/admin/'),
        api.get('/stats/platform/')
      ]);
      setAdminData(adminRes.data);
      setPlatformStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (challengeId, status) => {
    try {
      await api.post(`/challenges/${challengeId}/verify/`, {
        status,
        admin_notes: `Reviewed and set to ${status} via Admin Moderation Console.`
      });
      setActionMsg(`Challenge ${challengeId} marked as ${status}!`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchData();
    } catch (err) {
      console.error('Failed to verify challenge', err);
    }
  };

  const handleProposalStatus = async (proposalId, newStatus) => {
    try {
      await api.post(`/proposals/${proposalId}/status/`, {
        status: newStatus,
        admin_review_comments: `Proposal reviewed and updated to ${newStatus}.`
      });
      setActionMsg(`Proposal marked as ${newStatus}!`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchData();
    } catch (err) {
      console.error('Failed to update proposal', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading platform administration data..." />;
  }

  const COLORS = ['#E9B44C', '#287A59', '#3E7B99', '#0E6835'];

  return (
    <div>
      {/* Admin Title */}
      <div className="cs-card p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="small text-primary-green fw-semibold text-uppercase tracking-wider">
              Administration & Moderation
            </span>
            <h2 className="display-font fw-bold text-forest mb-1">
              Platform Admin Console
            </h2>
            <p className="text-muted-custom small mb-0">
              Audit reported issues, manage verification pipeline, and approve academic research proposals.
            </p>
          </div>
          <span className="badge bg-forest text-white p-2 px-3 small">
            Superuser Mode Active
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle2 size={16} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Moderation Queue" 
            value={adminData?.pending_queue_count ?? 0} 
            subtitle="Needs ground verification" 
            icon={Clock} 
            colorClass="text-warning"
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Total Verified" 
            value={platformStats?.verified_challenges ?? 0} 
            subtitle="Open for university R&D" 
            icon={ShieldCheck} 
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Proposals Submitted" 
            value={platformStats?.proposals_count ?? 0} 
            subtitle="Academic solutions" 
            icon={Lightbulb} 
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <StatCard 
            title="Active Partnerships" 
            value={(platformStats?.universities_count || 0) + (platformStats?.industry_count || 0)} 
            subtitle="Registered institutions" 
            icon={Users} 
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        {/* Status Distribution Pie Chart */}
        <div className="col-lg-5">
          <div className="cs-card p-4 h-100">
            <h6 className="fw-bold text-forest mb-3">Challenge Status Distribution</h6>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformStats?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(platformStats?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-3 small text-muted-custom mt-2">
              {(platformStats?.status_distribution || []).map((item, idx) => (
                <div key={idx} className="d-flex align-items-center gap-1">
                  <span className="d-inline-block rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: item.color }} />
                  <span>{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="col-lg-7">
          <div className="cs-card p-4 h-100">
            <h6 className="fw-bold text-forest mb-3">Challenges by Societal Category</h6>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformStats?.categories || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF1EE" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#287A59" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Queue Section */}
      <div className="cs-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-forest mb-1">
              Pending Challenge Verification Queue ({adminData?.pending_challenges?.length || 0})
            </h5>
            <p className="text-muted-custom small mb-0">
              Verify authentic community submissions so academic labs can discover and propose solutions.
            </p>
          </div>
        </div>

        {adminData?.pending_challenges?.length === 0 ? (
          <div className="p-4 text-center text-muted-custom small bg-light rounded">
            All submitted challenges have been reviewed! The moderation queue is clear.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Title & Location</th>
                  <th>Severity</th>
                  <th>Reported By</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminData.pending_challenges.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <span className="badge bg-light text-forest border fw-bold">
                        {ch.challenge_code}
                      </span>
                    </td>
                    <td>
                      <Link to={`/challenges/${ch.id}`} className="fw-bold text-dark text-decoration-none hover-green d-block">
                        {ch.title}
                      </Link>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        📍 {ch.city} • {ch.category_name}
                      </span>
                    </td>
                    <td><PriorityBadge severity={ch.estimated_severity} /></td>
                    <td>{ch.reported_by_name}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <Link to={`/challenges/${ch.id}`} className="btn btn-outline-secondary btn-sm p-1 px-2" title="View Detail">
                          <Eye size={14} />
                        </Link>
                        <button 
                          type="button" 
                          className="btn btn-success btn-sm p-1 px-2 d-flex align-items-center gap-1"
                          onClick={() => handleVerify(ch.id, 'VERIFIED')}
                          title="Verify Challenge"
                        >
                          <Check size={14} />
                          <span>Verify</span>
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          onClick={() => handleVerify(ch.id, 'REJECTED')}
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Solution Proposals Pending Review */}
      <div className="cs-card p-4">
        <h5 className="fw-bold text-forest mb-1">
          Solution Proposals Awaiting Approval ({adminData?.pending_proposals?.length || 0})
        </h5>
        <p className="text-muted-custom small mb-3">
          Approve university technical proposals to transition challenges into active implementation.
        </p>

        {adminData?.pending_proposals?.length === 0 ? (
          <div className="p-3 text-center text-muted-custom small bg-light rounded">
            No proposals currently awaiting review.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {adminData.pending_proposals.map((prop) => (
              <div key={prop.id} className="p-3 rounded border bg-light">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1 text-forest">{prop.title}</h6>
                    <span className="small text-muted-custom">
                      For: <strong>{prop.challenge_title}</strong> [{prop.challenge_code}] • By: {prop.proposer_org || prop.proposer_name}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-success btn-sm"
                      onClick={() => handleProposalStatus(prop.id, 'ACCEPTED')}
                    >
                      Accept & Fund Pilot
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleProposalStatus(prop.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <p className="small text-dark mb-0">{prop.proposed_solution}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
