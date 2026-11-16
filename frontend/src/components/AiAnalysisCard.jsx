import React from 'react';
import { Sparkles, CheckCircle, Tag, Users, Activity, AlertCircle } from 'lucide-react';

const AiAnalysisCard = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="cs-card p-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Sparkles size={18} className="text-primary-green" />
          <h6 className="fw-bold mb-0">AI Challenge Analysis</h6>
        </div>
        <p className="small text-muted mb-0">Analysis is processing or not yet generated for this challenge.</p>
      </div>
    );
  }

  const {
    summary,
    suggested_category,
    extracted_location,
    main_problem,
    suggested_outcomes,
    suggested_priority,
    keywords = [],
    possible_stakeholders = [],
    measurable_indicators = [],
    model_source
  } = analysis;

  return (
    <div className="cs-card p-4 border-2" style={{ borderColor: 'var(--color-soft-mint-border)' }}>
      {/* Header with AI Pill */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className="ai-badge">
            <Sparkles size={14} />
            <span>Civic AI Intelligence</span>
          </span>
          <span className="badge bg-light text-muted border small">
            {suggested_priority} Priority Advisory
          </span>
        </div>
        <span className="small text-muted-custom fst-italic" style={{ fontSize: '0.75rem' }}>
          {model_source || 'CivicSync Local Advisory Pipeline'}
        </span>
      </div>

      {/* Advisory Banner */}
      <div className="ai-notice-box mb-4">
        <div className="d-flex align-items-start gap-2">
          <AlertCircle size={16} className="text-primary-green flex-shrink-0 mt-1" />
          <p className="mb-0 small">
            <strong>Advisory Notice:</strong> This structured summary and recommendation set was generated automatically by the platform's AI engine to assist civic stakeholders. These suggestions are advisory and do not replace official verification.
          </p>
        </div>
      </div>

      {/* AI Structured Summary */}
      <div className="mb-4">
        <h6 className="small fw-bold text-uppercase text-muted-custom tracking-wider mb-2">
          Structured Synthesis
        </h6>
        <p className="fw-medium text-dark mb-2">
          {summary || main_problem}
        </p>
      </div>

      {/* Suggested Desired Outcome */}
      {suggested_outcomes && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#F8FAF9', border: '1px solid #E5EFEA' }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <CheckCircle size={15} className="text-primary-green" />
            <span className="small fw-bold text-forest">Target Collaborative Outcome</span>
          </div>
          <p className="small text-muted-custom mb-0">
            {suggested_outcomes}
          </p>
        </div>
      )}

      <div className="row g-3 mb-3">
        {/* Stakeholders */}
        {possible_stakeholders?.length > 0 && (
          <div className="col-md-6">
            <div className="p-3 rounded h-100 border" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Users size={15} className="text-primary-green" />
                <span className="small fw-bold text-dark">Suggested Stakeholders</span>
              </div>
              <ul className="list-unstyled mb-0 small text-muted-custom">
                {possible_stakeholders.map((s, idx) => (
                  <li key={idx} className="mb-1 d-flex align-items-start gap-1">
                    <span className="text-primary-green">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Measurable Indicators */}
        {measurable_indicators?.length > 0 && (
          <div className="col-md-6">
            <div className="p-3 rounded h-100 border" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Activity size={15} className="text-primary-green" />
                <span className="small fw-bold text-dark">Suggested Success Metrics</span>
              </div>
              <ul className="list-unstyled mb-0 small text-muted-custom">
                {measurable_indicators.map((ind, idx) => (
                  <li key={idx} className="mb-1 d-flex align-items-start gap-1">
                    <span className="text-primary-green">✓</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Keywords */}
      {keywords?.length > 0 && (
        <div>
          <span className="small fw-semibold text-muted-custom me-2">Extracted Themes:</span>
          <div className="d-inline-flex flex-wrap gap-1 align-items-center mt-1">
            {keywords.map((kw, idx) => (
              <span key={idx} className="badge bg-white border text-dark px-2 py-1 small fw-normal">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysisCard;
