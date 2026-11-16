import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon = HelpCircle, 
  title = "No challenges found", 
  description = "Try adjusting your search terms or filter criteria to find what you are looking for.", 
  actionLabel, 
  actionLink, 
  onAction 
}) => {
  return (
    <div className="cs-card p-5 text-center my-4">
      <div 
        className="d-inline-flex p-3 rounded-circle mb-3" 
        style={{ backgroundColor: 'var(--color-soft-mint)' }}
      >
        <Icon size={32} className="text-primary-green" />
      </div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted-custom small mb-4 mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-civic">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button type="button" onClick={onAction} className="btn-civic">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
