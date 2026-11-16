import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ChallengeCard from '../components/ChallengeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  GraduationCap, Lightbulb, CheckCircle2, 
  ArrowRight, Award, PlusCircle, Search 
} from 'lucide-react';

const UniversityDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        const res = await api.get('/dashboards/university/');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching university dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversityData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading university research portal..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="cs-card p-4 p-md-5 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="small text-primary-green fw-semibold text-uppercase tracking-wider">
              Academic & Research Portal
            </span>
            <h2 className="display-font fw-bold text-forest mb-1">
              {user?.organization_name || user?.username}
            </h2>
            <p className="text-muted-custom small mb-0">
              Discover societal problems aligned with your department expertise and deploy real-world student capstones & research grants.
            </p>
          </div>
          <Link to="/challenges" className="btn-civic text-decoration-none">
            <Search size={16} />
            <span>Discover Verified Challenges</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4">
          <StatCard 
            title="Active Proposals" 
            value={data?.active_proposals_count ?? 0} 
            subtitle="Under review or in action" 
            icon={Lightbulb} 
          />
        </div>
        <div className="col-sm-6 col-md-4">
          <StatCard 
            title="Accepted Projects" 
            value={data?.accepted_projects_count ?? 0} 
            subtitle="Approved pilots" 
            icon={CheckCircle2} 
            colorClass="text-success"
          />
        </div>
        <div className="col-sm-6 col-md-4">
          <StatCard 
            title="Matched Challenges" 
            value={data?.recommended_challenges?.length ?? 0} 
            subtitle="Seeking research solutions" 
            icon={GraduationCap} 
            colorClass="text-info-blue"
          />
        </div>
      </div>

      {/* My Submitted Proposals Table */}
      <div className="cs-card p-4 mb-5">
        <h5 className="fw-bold text-forest mb-1">
          Our Research Solution Proposals ({data?.my_proposals?.length || 0})
        </h5>
        <p className="text-muted-custom small mb-3">
          Status of technical proposals submitted by your faculty and student teams.
        </p>

        {data?.my_proposals?.length === 0 ? (
          <div className="p-4 text-center text-muted-custom small bg-light rounded">
            No proposals submitted yet. Browse open verified challenges below to submit your first collaborative solution.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Proposal Title</th>
                  <th>Challenge Code</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Milestones</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.my_proposals.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <strong className="text-dark d-block">{prop.title}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{prop.challenge_title}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-forest border">
                        {prop.challenge_code}
                      </span>
                    </td>
                    <td>{prop.estimated_duration}</td>
                    <td>
                      <span className="badge bg-light text-forest border fw-bold">
                        {prop.status}
                      </span>
                    </td>
                    <td>
                      {prop.milestones?.filter(m => m.is_completed).length || 0} / {prop.milestones?.length || 0} done
                    </td>
                    <td className="text-end">
                      <Link to={`/challenges/${prop.challenge}`} className="btn btn-civic-secondary btn-sm py-1 px-2">
                        <span>View Project</span>
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

      {/* Recommended Open Challenges */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-forest mb-1">
              Recommended Challenges for Research Intervention
            </h5>
            <p className="text-muted-custom small mb-0">
              Verified ground challenges currently awaiting academic collaboration proposals.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {data?.recommended_challenges?.map((ch) => (
            <div key={ch.id} className="col-md-6">
              <ChallengeCard challenge={ch} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboard;
