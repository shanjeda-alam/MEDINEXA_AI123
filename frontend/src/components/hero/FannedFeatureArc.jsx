'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Bot,
  Camera,
  ChevronLeft,
  ChevronRight,
  Droplet,
  HeartPulse,
  MapPin,
  Stethoscope,
} from 'lucide-react';

const features = [
  { title: 'Smart Scan', subtitle: 'AI injury vision', sectionId: 'injury-studio', href: '/injury-studio', icon: Camera },
  { title: 'Nearby Doctors', subtitle: 'Live GPS care', sectionId: 'care-radar', href: '/care-radar', icon: MapPin },
  { title: 'First-Aid Guide', subtitle: 'Step-by-step care', sectionId: 'injury-studio', href: '/injury-studio', icon: Activity },
  { title: 'Heart Health', subtitle: '120 BPM', sectionId: 'dashboard', href: '/dashboard', icon: HeartPulse },
  { title: 'Specialist Care', subtitle: 'Verified doctors', sectionId: 'doctors', href: '/doctors', icon: Stethoscope },
  { title: 'Emergency Blood', subtitle: 'Live donor stock', sectionId: 'blood-bank', href: '/blood-bank', icon: Droplet },
  { title: 'AI Triage Bot', subtitle: '24/7 health chat', sectionId: 'chatbot', href: '/chatbot', icon: Bot },
];

export function FannedFeatureArc() {
  const [activeIndex, setActiveIndex] = useState(3);
  const lastRotationAt = useRef(0);
  const touchStartX = useRef(null);
  const router = useRouter();

  const rotateBy = (direction, throttle = false) => {
    const now = Date.now();
    if (throttle && now - lastRotationAt.current < 220) return;
    if (throttle) lastRotationAt.current = now;
    setActiveIndex((current) => (current + direction + features.length) % features.length);
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 10) return;
    rotateBy(event.deltaY > 0 ? 1 : -1, true);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    const endX = event.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined || Math.abs(endX - startX) < 36) return;
    rotateBy(endX < startX ? 1 : -1, true);
  };

  const openFeature = (feature, index) => {
    setActiveIndex(index);
    const section = document.getElementById(feature.sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.classList.add('feature-section-highlight');
      window.setTimeout(() => section.classList.remove('feature-section-highlight'), 1400);
      return;
    }
    router.push(feature.href);
  };

  return (
    <div className="feature-arc-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="feature-arc" role="group" aria-label="Explore MEDINEXA care features" onWheel={handleWheel}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const offset = ((index - activeIndex + 3 + features.length) % features.length) - 3;
          const isActive = index === activeIndex;
          const lift = Math.abs(offset) * 7;
          const zIndex = offset === 0 ? 40 : Math.abs(offset) === 1 ? 30 : Math.abs(offset) === 2 ? 20 : 10;

          return (
            <button
              type="button"
              key={feature.title}
              onClick={() => openFeature(feature, index)}
              className={`feature-arc-card ${isActive ? 'is-focused' : ''}`}
              style={{
                '--fan-offset-wide': `${offset * 13}vw`,
                '--fan-offset-compact': `${offset * 4.8}vw`,
                transform: `translate(-50%, ${lift}px) rotateY(${offset * 6}deg) rotateZ(${offset * -4}deg) scale(${isActive ? 1.05 : 1}) translateZ(${isActive ? 30 : 0}px)`,
                zIndex,
              }}
              aria-pressed={isActive}
              aria-label={`${feature.title}: ${feature.subtitle}. Open ${feature.href}`}
            >
              <span className={`feature-icon ${index === 3 ? 'heart-beat' : ''}`}><Icon aria-hidden="true" /></span>
              <span className="feature-title">{feature.title}</span>
              {index === 3 ? (
                <span className="feature-heart-rate"><strong>120</strong><small>BPM</small></span>
              ) : (
                <span className="feature-detail">{feature.subtitle}</span>
              )}
              <span className="feature-open-badge">Open <span aria-hidden="true">→</span></span>
            </button>
          );
        })}
      </div>
      <div className="feature-arc-controls" aria-label="Feature carousel controls">
        <button type="button" className="feature-arc-arrow" onClick={() => rotateBy(-1)} aria-label="Previous feature">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className="feature-arc-dots" role="group" aria-label="Choose a feature">
          {features.map((feature, index) => (
            <button
              type="button"
              key={`${feature.sectionId}-${index}`}
              className={`feature-arc-dot ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${feature.title}`}
              aria-pressed={activeIndex === index}
            />
          ))}
        </div>
        <button type="button" className="feature-arc-arrow" onClick={() => rotateBy(1)} aria-label="Next feature">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
