import { Sparkles } from 'lucide-react';

export function AiTriageOrb({ size = 'normal' }) {
  return (
    <span className={`orb-avatar ${size === 'small' ? 'orb-small' : ''}`} aria-hidden="true">
      <Sparkles className="h-7 w-7" />
    </span>
  );
}
