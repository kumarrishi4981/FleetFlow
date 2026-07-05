const statusMap = {
  ACTIVE: { color: 'emerald', label: 'Active' },
  DELIVERED: { color: 'emerald', label: 'Delivered' },
  IDLE: { color: 'amber', label: 'Idle' },
  PENDING: { color: 'amber', label: 'Pending' },
  MAINTENANCE: { color: 'rose', label: 'Maintenance' },
  CANCELLED: { color: 'rose', label: 'Cancelled' },
  IN_TRANSIT: { color: 'blue', label: 'In Transit' },
  ASSIGNED: { color: 'blue', label: 'Assigned' },
  URGENT: { color: 'rose', pulse: true, label: 'Urgent' },
  HIGH: { color: 'amber', label: 'High' },
  MEDIUM: { color: 'blue', label: 'Medium' },
  LOW: { color: 'slate', label: 'Low' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = statusMap[status] || { color: 'slate', label: status };
  const sizeClass = size === 'sm' ? 'status-badge--sm' : '';
  const pulseClass = config.pulse ? 'status-badge--pulse' : '';

  return (
    <span className={`status-badge status-badge--${config.color} ${sizeClass} ${pulseClass}`}>
      {config.label}
    </span>
  );
}
