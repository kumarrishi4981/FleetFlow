import { useEffect, useState, useRef } from 'react';

export default function KPICard({ icon: Icon, label, value, trend, trendValue, color = 'blue' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const isFloat = !Number.isInteger(numericValue);

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (numericValue - start) * eased;
      setDisplayValue(isFloat ? current.toFixed(1) : Math.round(current));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';

  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-card-header">
        <div className="kpi-icon-wrapper">
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <div className={`kpi-trend ${trendClass}`}>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="kpi-card-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{displayValue}</div>
      </div>
    </div>
  );
}

