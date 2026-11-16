import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="py-5 bg-warm-offwhite min-vh-100 d-flex align-items-center text-center">
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="cs-card p-5">
          <HelpCircle size={48} className="text-primary-green mb-3" />
          <h2 className="display-font fw-bold text-forest mb-2">404 - Page Not Found</h2>
          <p className="text-muted-custom small mb-4">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link to="/" className="btn-civic w-100 justify-content-center">
            <ArrowLeft size={16} />
            <span>Return to CivicSync Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
