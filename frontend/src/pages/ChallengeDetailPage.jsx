import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import AiAnalysisCard from '../components/AiAnalysisCard';
import SimilarChallengesList from '../components/SimilarChallengesList';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPin, Users, Calendar, ArrowLeft, Heart, 
  Share2, ShieldCheck, CheckCircle2, MessageSquare, 
  Lightbulb, Send, PlusCircle, AlertCircle, Building2, 
  GraduationCap, Camera 
} from 'lucide-react';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin, isUniversity, isIndustry } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [similarData, setSimilarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Proposal submission modal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    problem_understanding: '',
    proposed_solution: '',
    technical_approach: '',
    expected_impact: '',
    estimated_duration: '3 to 6 months',
    required_resources: '',
    success_indicators: ''
  });
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Admin verification state
  const [adminNotes, setAdminNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Express interest state
  const [interestType, setInterestType] = useState('RESEARCH');
  const [interestNote, setInterestNote] = useState('');
  const [expressingInterest, setExpressingInterest] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Status message
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchChallengeData = async () => {
    try {
      const res = await api.get(`/challenges/${id}/`);
      setChallenge(res.data);
      setFollowing(res.data.is_following);
      setFollowersCount(res.data.followers_count);

      // Fetch AI recommendations
      try {
        const recRes = await api.get(`/challenges/${id}/recommendations/`);
        setRecommendations(recRes.data.recommendations || []);
      } catch (e) {
        console.error('Failed to load recommendations', e);
      }

      // Fetch similar challenges
      try {
        const simRes = await api.post('/challenges/check-similarity/', {
          title: res.data.title,
          description: res.data.description,
          exclude_id: res.data.id
        });
        setSimilarData(simRes.data);
      } catch (e) {
        console.error('Failed to check similarity', e);
      }
    } catch (err) {
      console.error('Error fetching challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeData();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.post(`/challenges/${id}/follow/`);
      setFollowing(res.data.following);
      setFollowersCount(res.data.followers_count);
    } catch (err) {
      console.error('Error following:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/challenges/${id}/comments/`, { content: commentText });
      setChallenge(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAdminVerify = async (newStatus) => {
    setVerifying(true);
    try {
      const res = await api.post(`/challenges/${id}/verify/`, {
        status: newStatus,
        admin_notes: adminNotes
      });
      setChallenge(res.data);
      setFeedbackMsg(`Challenge marked as ${newStatus}!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Error verifying challenge:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleExpressInterest = async (e) => {
    e.preventDefault();
    setExpressingInterest(true);
    try {
      await api.post(`/challenges/${id}/express-interest/`, {
        interest_type: interestType,
        note: interestNote
      });
      setShowInterestModal(false);
      setFeedbackMsg('Your institutional interest has been registered!');
      setTimeout(() => setFeedbackMsg(''), 4000);
      fetchChallengeData();
    } catch (err) {
      console.error('Error expressing interest:', err);
    } finally {
      setExpressingInterest(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      await api.post('/proposals/', {
        ...proposalForm,
        challenge: id
      });
      setShowProposalModal(false);
      setFeedbackMsg('Solution proposal submitted successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
      fetchChallengeData();
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleToggleMilestone = async (milestoneId, currentStatus) => {
    try {
      await api.patch(`/milestones/${milestoneId}/`, {
        is_completed: !currentStatus
      });
      fetchChallengeData();
    } catch (err) {
      console.error('Error updating milestone:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-5 bg-warm-offwhite min-vh-100">
        <div className="container">
          <LoadingSpinner message="Loading societal challenge details..." />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container py-5 text-center">
        <h4>Challenge not found</h4>
        <Link to="/challenges" className="btn-civic mt-3">Back to Challenges</Link>
      </div>
    );
  }

  return (
    <div className="py-5 bg-warm-offwhite min-vh-100">
      <div className="container">
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/challenges" className="text-decoration-none text-muted-custom small fw-semibold d-inline-flex align-items-center gap-1 hover-green">
            <ArrowLeft size={16} />
            <span>Back to All Challenges</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
            <CheckCircle2 size={18} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Challenge Header Card */}
        <div className="cs-card p-4 p-md-5 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge bg-light text-forest border px-3 py-1 fw-bold fs-6">
                {challenge.challenge_code}
              </span>
              <PriorityBadge severity={challenge.estimated_severity} />
              <StatusBadge status={challenge.status} />
              {challenge.category && (
                <span className="badge bg-white text-primary-green border px-3 py-1 fw-semibold">
                  {challenge.category.name}
                </span>
              )}
            </div>

            {/* Follow & Action CTA */}
            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className={`btn btn-sm d-flex align-items-center gap-1 px-3 ${following ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={handleToggleFollow}
                disabled={!isAuthenticated}
                title={isAuthenticated ? 'Follow this challenge for updates' : 'Login to follow'}
              >
                <Heart size={15} fill={following ? 'currentColor' : 'none'} />
                <span>{following ? 'Following' : 'Follow'} ({followersCount})</span>
              </button>

              {isUniversity && (
                <button 
                  type="button" 
                  className="btn-civic btn-sm"
                  onClick={() => setShowProposalModal(true)}
                >
                  <Lightbulb size={15} />
                  <span>Submit Solution Proposal</span>
                </button>
              )}

              {(isUniversity || isIndustry) && (
                <button 
                  type="button" 
                  className="btn-civic-secondary btn-sm"
                  onClick={() => setShowInterestModal(true)}
                >
                  <Building2 size={15} />
                  <span>Express Interest</span>
                </button>
              )}
            </div>
          </div>

          <h1 className="display-font fw-bold text-forest mb-3 fs-2">
            {challenge.title}
          </h1>

          {/* Metadata Row */}
          <div className="d-flex flex-wrap gap-4 text-muted-custom small mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-1">
              <MapPin size={16} className="text-primary-green" />
              <span>{challenge.city}{challenge.location_description ? ` (${challenge.location_description})` : ''}</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <Users size={16} className="text-muted" />
              <span>Reported by: <strong>{challenge.reported_by_name}</strong></span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <Calendar size={16} className="text-muted" />
              <span>Submitted {new Date(challenge.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Photographic Evidence if attached */}
          {challenge.image && (
            <div className="mb-4 rounded-4 overflow-hidden position-relative shadow-sm" style={{ maxHeight: '420px', backgroundColor: '#0F2D25' }}>
              <img 
                src={challenge.image.startsWith('http') ? challenge.image : challenge.image} 
                alt={challenge.title}
                className="w-100 object-fit-cover"
                style={{ maxHeight: '420px', display: 'block' }}
              />
              <div 
                className="position-absolute bottom-0 start-0 end-0 p-3"
                style={{ background: 'linear-gradient(to top, rgba(15, 45, 37, 0.88), transparent)' }}
              >
                <span className="badge bg-white text-forest small fw-semibold px-2.5 py-1.5 shadow-xs d-inline-flex align-items-center gap-1.5">
                  <Camera size={14} className="text-primary-green" />
                  <span>Verified Photographic Ground Evidence</span>
                </span>
              </div>
            </div>
          )}

          {/* Problem Narrative */}
          <div className="row g-4">
            <div className="col-lg-8">
              <h5 className="fw-bold mb-2">Detailed Community Problem Statement</h5>
              <p className="text-dark mb-4 lh-base" style={{ whiteSpace: 'pre-line' }}>
                {challenge.description}
              </p>

              {challenge.affected_community && (
                <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-warm-offwhite)', border: '1px solid var(--color-border-subtle)' }}>
                  <span className="small fw-bold text-muted-custom text-uppercase">Affected Community Demographic</span>
                  <p className="small text-dark mb-0 mt-1">{challenge.affected_community}</p>
                </div>
              )}

              {challenge.desired_outcome && (
                <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-soft-mint)', border: '1px solid var(--color-soft-mint-border)' }}>
                  <span className="small fw-bold text-forest text-uppercase">Desired Outcome</span>
                  <p className="small text-forest mb-0 mt-1">{challenge.desired_outcome}</p>
                </div>
              )}
            </div>

            {/* Right Column: Admin Notes & Quick Info */}
            <div className="col-lg-4">
              {isAdmin && (
                <div className="p-4 rounded border mb-4 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2 text-forest fw-bold">
                    <ShieldCheck size={18} className="text-primary-green" />
                    <span>Administrator Review Panel</span>
                  </div>
                  <p className="small text-muted-custom mb-3">
                    Verify ground authenticity or update challenge moderation status.
                  </p>
                  <textarea 
                    className="form-control form-control-civic mb-3 small"
                    rows="2"
                    placeholder="Review notes or feedback for reporter..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-success btn-sm flex-grow-1"
                      disabled={verifying}
                      onClick={() => handleAdminVerify('VERIFIED')}
                    >
                      Verify Problem
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      disabled={verifying}
                      onClick={() => handleAdminVerify('REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Follower & Proposal Counter Box */}
              <div className="p-3 rounded border bg-white mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted-custom">Interested Institutions</span>
                  <span className="small fw-bold text-dark">{challenge.interested_parties?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted-custom">Proposed Solutions</span>
                  <span className="small fw-bold text-dark">{challenge.proposals?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted-custom">Total Views</span>
                  <span className="small fw-bold text-dark">{challenge.views_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="mb-5">
          <div className="mb-3">
            <h3 className="display-font fw-bold text-forest mb-1 fs-4">
              AI Challenge Intelligence & Structuring
            </h3>
            <p className="text-muted-custom small mb-0">
              Automated synthesis and thematic categorization generated by CivicSync's local AI service.
            </p>
          </div>
          <AiAnalysisCard analysis={challenge.ai_analysis} />
        </div>

        {/* University Recommendations */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="display-font fw-bold text-forest mb-1 fs-4">
                Recommended Academic Institutions & Labs
              </h3>
              <p className="text-muted-custom small mb-0">
                Matched based on department research specializations and challenge theme alignment.
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-4 cs-card text-center text-muted-custom small">
              No matching academic institution profiles currently registered for this specific theme.
            </div>
          ) : (
            <div className="row g-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="col-md-6">
                  <RecommendationCard recommendation={rec} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar Challenges / Semantic Duplicates */}
        {similarData && similarData.matches?.length > 0 && (
          <div className="mb-5">
            <div className="mb-3">
              <h3 className="display-font fw-bold text-forest mb-1 fs-4">
                Similar Community Challenges (Duplicate Detection)
              </h3>
              <p className="text-muted-custom small mb-0">
                Identified using dense embeddings & cosine similarity. High similarity indicates potential co-occurring or duplicate issues.
              </p>
            </div>
            <SimilarChallengesList 
              matches={similarData.matches} 
              engine={similarData.engine} 
            />
          </div>
        )}

        {/* Solution Proposals & Milestone Collaboration */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="display-font fw-bold text-forest mb-1 fs-4">
                Active Solution Proposals & Milestones
              </h3>
              <p className="text-muted-custom small mb-0">
                Formal technical approaches submitted by universities and research partners.
              </p>
            </div>
          </div>

          {challenge.proposals?.length === 0 ? (
            <div className="p-4 cs-card text-center text-muted-custom small">
              No formal solution proposals submitted yet. Universities can submit a proposal using the button above.
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {challenge.proposals.map((prop) => (
                <div key={prop.id} className="cs-card p-4 p-md-5">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <span className="badge bg-light text-forest border me-2 small">
                        {prop.status}
                      </span>
                      <h4 className="fw-bold mb-1 mt-2 text-forest">{prop.title}</h4>
                      <span className="text-muted-custom small">
                        Proposed by: <strong>{prop.proposer_org || prop.proposer_name}</strong> • Duration: {prop.estimated_duration}
                      </span>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <h6 className="small fw-bold text-muted-custom text-uppercase">Proposed Solution</h6>
                      <p className="small text-dark">{prop.proposed_solution}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="small fw-bold text-muted-custom text-uppercase">Technical Approach</h6>
                      <p className="small text-dark">{prop.technical_approach}</p>
                    </div>
                  </div>

                  {/* Milestones Tracker */}
                  <div className="p-4 rounded border bg-light mb-4">
                    <h6 className="fw-bold text-forest mb-3 d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary-green" />
                      <span>Project Milestones & Verification</span>
                    </h6>

                    <div className="d-flex flex-column gap-2">
                      {prop.milestones?.map((m) => (
                        <div key={m.id} className="d-flex align-items-start gap-3 p-3 bg-white rounded border">
                          <input 
                            type="checkbox" 
                            className="form-check-input mt-1 flex-shrink-0"
                            checked={m.is_completed}
                            disabled={!isAdmin && prop.proposed_by !== user?.id}
                            onChange={() => handleToggleMilestone(m.id, m.is_completed)}
                          />
                          <div className="flex-grow-1">
                            <span className={`fw-semibold small ${m.is_completed ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                              {m.title}
                            </span>
                            {m.description && (
                              <p className="small text-muted mb-0">{m.description}</p>
                            )}
                          </div>
                          {m.is_completed && (
                            <span className="badge bg-success small">Completed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Updates */}
                  {prop.progress_updates?.length > 0 && (
                    <div>
                      <h6 className="small fw-bold text-muted-custom text-uppercase mb-2">Progress Dispatches</h6>
                      <div className="d-flex flex-column gap-2">
                        {prop.progress_updates.map((up) => (
                          <div key={up.id} className="p-3 rounded border-start border-3 border-success bg-white shadow-xs">
                            <div className="d-flex justify-content-between small text-muted-custom mb-1">
                              <strong>{up.title}</strong>
                              <span>{new Date(up.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="small text-dark mb-0">{up.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments & Discussion */}
        <div className="cs-card p-4 p-md-5">
          <h3 className="display-font fw-bold text-forest mb-4 fs-4 d-flex align-items-center gap-2">
            <MessageSquare size={20} className="text-primary-green" />
            <span>Community Feedback & Discussion ({challenge.comments?.length || 0})</span>
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="mb-2">
                <textarea 
                  className="form-control form-control-civic" 
                  rows="3"
                  placeholder="Share ground updates, local context, or collaborative ideas..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn-civic btn-sm"
                disabled={submittingComment || !commentText.trim()}
              >
                <Send size={14} />
                <span>Post Comment</span>
              </button>
            </form>
          ) : (
            <div className="p-3 rounded bg-light border text-center small text-muted-custom mb-4">
              <Link to="/login" className="fw-semibold text-primary-green">Log in</Link> to join the community discussion.
            </div>
          )}

          {/* Comments List */}
          <div className="d-flex flex-column gap-3">
            {challenge.comments?.map((c) => (
              <div key={c.id} className="p-3 rounded bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <strong className="small text-forest">{c.author_org || c.author_name}</strong>
                    <span className="badge bg-white border text-muted small">{c.author_role}</span>
                  </div>
                  <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="small text-dark mb-0">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Express Interest Modal */}
      {showInterestModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 cs-card">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-forest">Express Institutional Interest</h5>
                <button type="button" className="btn-close" onClick={() => setShowInterestModal(false)} />
              </div>
              <form onSubmit={handleExpressInterest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label-civic">Collaboration Type</label>
                    <select 
                      className="form-select form-select-civic"
                      value={interestType}
                      onChange={(e) => setInterestType(e.target.value)}
                    >
                      <option value="RESEARCH">Academic / Research Solution</option>
                      <option value="FUNDING">CSR / Grant Funding</option>
                      <option value="MENTORSHIP">Technical Mentorship</option>
                      <option value="IMPLEMENTATION">Pilot Implementation</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label-civic">Brief Note / Scope</label>
                    <textarea 
                      className="form-control form-control-civic" 
                      rows="3"
                      placeholder="Outline how your institution can assist..."
                      value={interestNote}
                      onChange={(e) => setInterestNote(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInterestModal(false)}>Cancel</button>
                  <button type="submit" className="btn-civic btn-sm" disabled={expressingInterest}>
                    {expressingInterest ? 'Submitting...' : 'Register Interest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Submission Modal */}
      {showProposalModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 cs-card">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-forest">Submit Technical Solution Proposal</h5>
                <button type="button" className="btn-close" onClick={() => setShowProposalModal(false)} />
              </div>
              <form onSubmit={handleProposalSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label-civic">Proposal Title *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-civic" 
                      required 
                      placeholder="e.g. Modular Rainwater Percolation System..."
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-civic">Problem Understanding & Baseline *</label>
                    <textarea 
                      className="form-control form-control-civic" 
                      rows="3" 
                      required 
                      placeholder="Analyze root causes..."
                      value={proposalForm.problem_understanding}
                      onChange={(e) => setProposalForm({...proposalForm, problem_understanding: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-civic">Proposed Technical Solution *</label>
                    <textarea 
                      className="form-control form-control-civic" 
                      rows="3" 
                      required 
                      placeholder="Details of methodology, prototypes, or interventions..."
                      value={proposalForm.proposed_solution}
                      onChange={(e) => setProposalForm({...proposalForm, proposed_solution: e.target.value})}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label-civic">Estimated Duration</label>
                      <input 
                        type="text" 
                        className="form-control form-control-civic" 
                        placeholder="e.g. 3 to 6 months"
                        value={proposalForm.estimated_duration}
                        onChange={(e) => setProposalForm({...proposalForm, estimated_duration: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-civic">Technical Approach</label>
                      <input 
                        type="text" 
                        className="form-control form-control-civic" 
                        placeholder="e.g. Sensor calibration, field pilots"
                        value={proposalForm.technical_approach}
                        onChange={(e) => setProposalForm({...proposalForm, technical_approach: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label-civic">Expected Impact & Success Indicators</label>
                    <textarea 
                      className="form-control form-control-civic" 
                      rows="2" 
                      placeholder="Measurable metrics..."
                      value={proposalForm.expected_impact}
                      onChange={(e) => setProposalForm({...proposalForm, expected_impact: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProposalModal(false)}>Cancel</button>
                  <button type="submit" className="btn-civic btn-sm" disabled={submittingProposal}>
                    {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetailPage;
