import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, AlertTriangle, Layers } from 'lucide-react';
import StatusBadge from './StatusBadge';

const SimilarChallengesList = ({ matches = [], engine = "", onSelectChallenge }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-3 text-center text-muted-custom small bg-light rounded border">
        No similar challenges detected in the active registry.
      </div>
    );
  }

  return (
    <div>
      {engine && (
        <div className="d-flex align-items-center justify-content-between mb-3 text-muted-custom small">
          <span className="d-flex align-items-center gap-1">
            <Layers size={13} className="text-primary-green" />
            <span>Detection Engine: <strong>{engine}</strong></span>
          </span>
          <span>{matches.length} matches found</span>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {matches.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded border transition-all ${item.is_high_similarity ? 'bg-amber-light border-warning' : 'bg-white'}`}
            style={{ backgroundColor: item.is_high_similarity ? 'var(--color-amber-bg)' : '#FFFFFF' }}
          >
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-white border text-dark small fw-semibold">
                    {item.challenge_code || `CS-${item.id}`}
                  </span>
                  <StatusBadge status={item.status} />
                  {item.is_high_similarity && (
                    <span className="badge bg-warning text-dark d-flex align-items-center gap-1 small">
                      <AlertTriangle size={11} /> High Potential Duplicate
                    </span>
                  )}
                </div>
                <h6 className="fw-bold mb-1">
                  <Link 
                    to={`/challenges/${item.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-decoration-none text-dark hover-green"
                  >
                    {item.title}
                  </Link>
                </h6>
                <div className="small text-muted-custom d-flex gap-2">
                  <span>{item.city}</span>
                  <span>•</span>
                  <span>{item.category_name}</span>
                </div>
              </div>

              {/* Match Score */}
              <div className="text-end flex-shrink-0">
                <span className="fw-bold text-forest" style={{ fontSize: '1.05rem' }}>
                  {item.similarity_score}%
                </span>
                <div className="small text-muted-custom" style={{ fontSize: '0.75rem' }}>
                  Similarity
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="progress" style={{ height: '5px' }}>
              <div 
                className={`progress-bar ${item.similarity_score > 60 ? 'bg-warning' : 'bg-success'}`}
                role="progressbar" 
                style={{ width: `${item.similarity_score}%` }} 
                aria-valuenow={item.similarity_score} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarChallengesList;
