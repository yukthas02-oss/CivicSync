import React from 'react';
import { GraduationCap, Award, CheckCircle2, ChevronRight } from 'lucide-react';

const RecommendationCard = ({ recommendation, onExpressInterest }) => {
  const {
    university_id,
    institution_name,
    campus_location,
    department_name,
    match_score,
    matched_expertises = [],
    rationale,
    confidence_label
  } = recommendation;

  return (
    <div className="cs-card p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="d-flex gap-3 align-items-center">
          <div 
            className="p-2 rounded-circle flex-shrink-0" 
            style={{ backgroundColor: 'var(--color-soft-mint)' }}
          >
            <GraduationCap size={22} className="text-primary-green" />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">{institution_name}</h6>
            <span className="small text-muted-custom">{campus_location}</span>
          </div>
        </div>

        <div className="text-end">
          <span className="fw-bold text-primary-green" style={{ fontSize: '1.2rem' }}>
            {match_score}%
          </span>
          <div className="small text-muted-custom" style={{ fontSize: '0.75rem' }}>
            {confidence_label}
          </div>
        </div>
      </div>

      <div className="p-2 mb-3 rounded bg-light border">
        <div className="small fw-semibold text-dark mb-1">
          {department_name}
        </div>
        <p className="small text-muted-custom mb-0" style={{ fontSize: '0.825rem' }}>
          {rationale}
        </p>
      </div>

      <div className="mb-3 mt-auto">
        <div className="d-flex flex-wrap gap-1">
          {matched_expertises.map((tag, idx) => (
            <span key={idx} className="badge bg-white border text-forest small fw-normal">
              <CheckCircle2 size={11} className="text-primary-green me-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
