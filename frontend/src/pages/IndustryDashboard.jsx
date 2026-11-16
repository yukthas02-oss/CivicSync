import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ChallengeCard from '../components/ChallengeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

const IndustryDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndustryData = async () => {
      try {
        const res = await api.get('/dashboards/industry/');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching industry dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIndustryData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading industry CSR hub..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="cs-card p-4 p-md-5 mb-4 bg-white">
        <div>
          <span className="small text-primary-green fw-semibold text-uppercase tracking-wider">
            Corporate Social Responsibility & Mentorship Hub
          </span>
          <h2 className="display-font fw-bold text-forest mb-1">
            {user?.organization_name || user?.username}
          </h2>
          <p className="text-muted-custom small mb-0">
            Channel industry technology, mentorship, and grant funding towards high-impact community solutions.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6">
          <StatCard 
            title="Interests Expressed" 
            value={data?.interests_expressed_count ?? 0} 
            subtitle="Challenges backed" 
            icon={HeartHandshake} 
          />
        </div>
        <div className="col-sm-6">
          <StatCard 
            title="Active Collaborations" 
            value={data?.collaborations_count ?? 0} 
            subtitle="Projects in implementation" 
            icon={Building2} 
            colorClass="text-warning"
          />
        </div>
      </div>

      {/* Registered Interests Table */}
      <div className="cs-card p-4 mb-4">
        <h5 className="fw-bold text-forest mb-1">
          Our Expressed Interests & Sponsorships ({data?.my_interests?.length || 0})
        </h5>
        <p className="text-muted-custom small mb-3">
          Challenges where your organisation has offered research mentorship, equipment, or CSR grant support.
        </p>

        {data?.my_interests?.length === 0 ? (
          <div className="p-4 text-center text-muted-custom small bg-light rounded">
            You haven't expressed interest in any challenges yet. Browse active challenges to sponsor impactful solutions.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Challenge ID</th>
                  <th>Collaboration Type</th>
                  <th>Note</th>
                  <th>Registered On</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.my_interests.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge bg-light text-forest border fw-bold">
                        Challenge #{item.challenge}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-white border text-primary-green">
                        {item.interest_type}
                      </span>
                    </td>
                    <td>{item.note || 'General CSR alignment & interest.'}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      <Link to={`/challenges/${item.challenge}`} className="btn btn-civic-secondary btn-sm py-1 px-2">
                        <span>View Challenge</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-Progress Societal Collaborations */}
      <div>
        <h5 className="fw-bold text-forest mb-1">
          Active On-Ground Interventions Seeking Industry Support
        </h5>
        <p className="text-muted-custom small mb-3">
          Verified challenges currently in progress with active university teams.
        </p>

        <div className="row g-4">
          {data?.active_collaborations?.map((ch) => (
            <div key={ch.id} className="col-md-6">
              <ChallengeCard challenge={ch} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndustryDashboard;
