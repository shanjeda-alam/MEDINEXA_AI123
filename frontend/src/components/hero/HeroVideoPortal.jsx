'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { imagePaths } from '@/lib/mockData';

function drawHologram(canvas, time) {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(bounds.width * ratio));
  const height = Math.max(1, Math.round(bounds.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d');
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);
  context.strokeStyle = 'rgba(93, 107, 107, 0.32)';
  context.fillStyle = 'rgba(189, 215, 216, 0.12)';
  context.lineWidth = 1;

  const centerX = bounds.width / 2;
  const centerY = bounds.height * 0.48;
  const scale = Math.min(bounds.width / 560, bounds.height / 315);
  const pulse = Math.sin(time * 0.0016) * 2;
  const joint = (x, y, radius = 2) => {
    context.beginPath();
    context.arc(centerX + x * scale, centerY + y * scale, radius * scale, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  };
  const line = (points) => {
    context.beginPath();
    points.forEach(([x, y], index) => {
      const projectedX = centerX + x * scale;
      const projectedY = centerY + y * scale;
      if (index === 0) context.moveTo(projectedX, projectedY);
      else context.lineTo(projectedX, projectedY);
    });
    context.stroke();
  };

  context.save();
  context.translate(Math.sin(time * 0.00035) * 5, 0);
  context.beginPath();
  context.ellipse(centerX, centerY + 10 * scale, 72 * scale, 142 * scale, 0, 0, Math.PI * 2);
  context.strokeStyle = 'rgba(189, 215, 216, 0.34)';
  context.stroke();
  context.beginPath();
  context.arc(centerX, centerY - 92 * scale, 15 * scale, 0, Math.PI * 2);
  context.strokeStyle = 'rgba(93, 107, 107, 0.52)';
  context.stroke();

  const body = [
    [[0, -76], [0, -36], [0, 5], [0, 44], [0, 86]],
    [[-29, -35], [-48, -12], [-64, 18], [-69, 54]],
    [[29, -35], [48, -12], [64, 18], [69, 54]],
    [[-30, -36], [-17, -45], [0, -39], [17, -45], [30, -36]],
    [[-28, -10], [-12, -2], [0, 1], [12, -2], [28, -10]],
    [[-17, 45], [-25, 68], [-31, 96], [-32, 126]],
    [[17, 45], [25, 68], [31, 96], [32, 126]],
    [[-69, 54], [-74, 69], [-75, 79]],
    [[69, 54], [74, 69], [75, 79]],
  ];
  context.strokeStyle = 'rgba(93, 107, 107, 0.42)';
  body.forEach(line);
  body.flat().forEach(([x, y], index) => joint(x, y, index % 2 ? 2 : 2.7));

  context.beginPath();
  context.arc(centerX, centerY + pulse * scale, 10 * scale, 0, Math.PI * 2);
  context.fillStyle = 'rgba(247, 203, 202, 0.38)';
  context.fill();
  context.strokeStyle = 'rgba(93, 107, 107, 0.5)';
  context.stroke();
  context.restore();
}

export function HeroVideoPortal() {
  const portalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [videoUrl, setVideoUrl] = useState('/videos/hero-demo.mp4');
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let frameId;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const render = (time) => {
      drawHologram(canvas, time);
      frameId = window.requestAnimationFrame(render);
    };
    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!videoUrl.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const updateTilt = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: -y * 4, y: x * 5 });
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || !videoAvailable) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch (error) {
        console.error('Unable to play the selected video:', error);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'video/mp4') {
      event.target.value = '';
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setVideoAvailable(false);
    setPlaying(false);
  };

  const handleFullscreen = useCallback(() => {
    if (portalRef.current?.requestFullscreen) {
      portalRef.current.requestFullscreen().catch((error) => console.error('Unable to enter fullscreen:', error));
    }
  }, []);

  const seek = (event) => {
    if (videoRef.current) videoRef.current.currentTime = Number(event.target.value);
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  return (
    <div
      ref={portalRef}
      className="holo-portal glass-card"
      style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      onPointerMove={updateTilt}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <img className="holo-poster" src={imagePaths.heroPoster} alt="" aria-hidden="true" />
      <canvas ref={canvasRef} className="holo-canvas" aria-label="Animated holographic diagnostic body visualization" />
      <video
        ref={videoRef}
        className={`holo-video ${videoAvailable ? 'is-visible' : ''}`}
        src={videoUrl}
        poster={imagePaths.heroPoster}
        muted={muted}
        playsInline
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setVideoAvailable(true);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setVideoAvailable(false);
          setPlaying(false);
        }}
      />
      <div className="holo-topline">
        <span>MEDINEXA · SPATIAL CARE</span>
        <span>LIVE VISUALIZATION</span>
      </div>
      <div className="holo-hud holo-hud-left">
        <span>Full-body intelligence.</span>
        <strong>98.4%</strong>
      </div>
      <div className="holo-hud holo-hud-right">
        <strong>72 <span>BPM</span></strong>
        <span aria-label="Decorative ECG waveform">⌁⌁⌁⌁⌁</span>
      </div>
      <div className="holo-player">
        <button type="button" onClick={togglePlayback} disabled={!videoAvailable} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <span className="holo-time">{formatTime(currentTime)}</span>
        <input
          className="holo-progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={seek}
          disabled={!videoAvailable}
          aria-label="Video playback position"
        />
        <span className="holo-time">{formatTime(duration)}</span>
        <button type="button" onClick={toggleMute} disabled={!videoAvailable} aria-label={muted ? 'Unmute video' : 'Mute video'}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button type="button" onClick={handleFullscreen} aria-label="Toggle fullscreen">
          <Maximize2 size={14} />
        </button>
        <label className="holo-upload">
          Add MP4
          <input type="file" accept="video/mp4" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
}
