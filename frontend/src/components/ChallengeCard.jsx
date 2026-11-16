import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Lightbulb, ArrowRight, Tag, Camera, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ChallengeCard = ({ challenge }) => {
  const {
    id,
    challenge_code,
    title,
    description,
    category_name,
    city,
    location_description,
    estimated_severity,
    status,
    image,
    followers_count = 0,
    proposals_count = 0,
    created_at
  } = challenge;

  return (
    <div className="cs-card h-100 d-flex flex-column cs-card-interactive">
      {/* Photo Header if available, else a tasteful architectural header bar */}
      {image ? (
        <div className="position-relative overflow-hidden" style={{ height: '180px', backgroundColor: '#0F2D25' }}>
          <img 
            src={image.startsWith('http') ? image : image} 
            alt={title}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div 
            className="position-absolute bottom-0 start-0 end-0 p-2"
            style={{ background: 'linear-gradient(to top, rgba(15, 45, 37, 0.85), transparent)' }}
          >
            <span className="badge bg-white text-forest small fw-semibold px-2 py-1 shadow-xs d-inline-flex align-items-center gap-1">
              <Camera size={12} className="text-primary-green" />
              <span>Verified Photo Evidence</span>
            </span>
          </div>
        </div>
      ) : (
        <div 
          className="p-2 border-bottom position-relative"
          style={{ 
            background: 'linear-gradient(135deg, rgba(228, 241, 232, 0.6) 0%, rgba(247, 247, 242, 0.8) 100%)',
            height: '6px'
          }}
        />
      )}

      <div className="p-4 d-flex flex-column flex-grow-1">
        {/* Top Badges */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-light text-forest border px-2.5 py-1 small fw-bold">
            {challenge_code || `CS-${id}`}
          </span>
          <div className="d-flex gap-2">
            <PriorityBadge severity={estimated_severity} />
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Category & Title */}
        <div className="mb-2">
          <span className="text-primary-green small fw-semibold d-inline-flex align-items-center gap-1 mb-1">
            <Tag size={12} />
            {category_name || 'Societal Challenge'}
          </span>
          <h5 className="fw-bold mb-2 lh-snug">
            <Link 
              to={`/challenges/${id}`} 
              className="text-decoration-none text-forest hover-green"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {title}
            </Link>
          </h5>
        </div>

        {/* Description Excerpt */}
        <p 
          className="text-muted-custom small mb-4 flex-grow-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {description}
        </p>

        {/* Metadata Footer */}
        <div className="pt-3 border-top mt-auto">
          <div className="d-flex justify-content-between align-items-center text-muted-custom small mb-3">
            <div className="d-flex align-items-center gap-1 text-truncate" style={{ maxWidth: '160px' }}>
              <MapPin size={14} className="text-primary-green flex-shrink-0" />
              <span className="text-truncate">{city || 'Community Area'}</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span title={`${followers_count} citizens following`} className="d-flex align-items-center gap-1">
                <Users size={14} />
                <span>{followers_count}</span>
              </span>
              <span title={`${proposals_count} solution proposals`} className="d-flex align-items-center gap-1">
                <Lightbulb size={14} />
                <span>{proposals_count}</span>
              </span>
            </div>
          </div>

          <Link 
            to={`/challenges/${id}`} 
            className="btn-civic-secondary w-100 justify-content-between btn-sm py-2"
          >
            <span>View Challenge Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
