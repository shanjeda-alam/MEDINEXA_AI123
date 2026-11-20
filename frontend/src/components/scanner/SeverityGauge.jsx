const levels = ['non_urgent', 'urgent', 'emergency'];

export function SeverityGauge({ urgency }) {
  const active = Math.max(0, levels.indexOf(urgency));
  return (
    <div className="severity-gauge" aria-label={`Severity: ${String(urgency || 'unknown').replaceAll('_', ' ')}`}>
      {levels.map((level, index) => (
        <span key={level} className={index <= active ? 'active' : ''}>
          {level.replaceAll('_', ' ')}
        </span>
      ))}
    </div>
  );
}
