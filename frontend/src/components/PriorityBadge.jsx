import React from 'react';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

const PriorityBadge = ({ severity }) => {
  const configs = {
    LOW: {
      label: 'Low Severity',
      className: 'badge-priority-low',
      icon: Info,
    },
    MEDIUM: {
      label: 'Medium Severity',
      className: 'badge-priority-medium',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'High Urgency',
      className: 'badge-priority-high',
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'Critical / Urgent',
      className: 'badge-priority-urgent',
      icon: AlertOctagon,
    },
  };

  const current = configs[severity] || {
    label: severity || 'Medium',
    className: 'badge-priority-medium',
    icon: AlertTriangle,
  };

  const IconComponent = current.icon;

  return (
    <span className={`badge-civic ${current.className}`}>
      <IconComponent size={12} strokeWidth={2.5} />
      <span>{current.label}</span>
    </span>
  );
};

export default PriorityBadge;
