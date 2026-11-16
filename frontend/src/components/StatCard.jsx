import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, colorClass = "text-primary-green" }) => {
  return (
    <div className="cs-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="text-muted-custom small fw-semibold text-uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-soft-mint)' }}>
            <Icon size={18} className={colorClass} />
          </div>
        )}
      </div>
      <div className="d-flex align-items-baseline gap-2 mb-1">
        <h3 className="mb-0 fw-bold display-font" style={{ fontSize: '1.85rem' }}>
          {value}
        </h3>
        {trend && (
          <span className="small text-success fw-medium">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="small text-muted-custom mb-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
