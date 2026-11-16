import React from 'react';
import { Clock, CheckCircle2, RefreshCw, AlertCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    PENDING: {
      label: 'Pending Review',
      className: 'badge-status-pending',
      icon: Clock,
    },
    VERIFIED: {
      label: 'Verified Problem',
      className: 'badge-status-verified',
      icon: CheckCircle2,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      className: 'badge-status-in-progress',
      icon: RefreshCw,
    },
    RESOLVED: {
      label: 'Resolved',
      className: 'badge-status-resolved',
      icon: CheckCircle2,
    },
    REJECTED: {
      label: 'Not Accepted',
      className: 'badge-status-rejected',
      icon: XCircle,
    },
  };

  const current = configs[status] || {
    label: status || 'Unknown',
    className: 'badge-status-pending',
    icon: AlertCircle,
  };

  const IconComponent = current.icon;

  return (
    <span className={`badge-civic ${current.className}`}>
      <IconComponent size={12} strokeWidth={2.5} />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
