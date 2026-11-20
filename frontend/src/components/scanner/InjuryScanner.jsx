'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Activity, Camera, Mic, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useInjuryScan } from '@/hooks/useInjuryScan';
import { imagePaths } from '@/lib/mockData';
import { FirstAidChecklist } from '@/components/scanner/FirstAidChecklist';
import { SeverityGauge } from '@/components/scanner/SeverityGauge';

export function InjuryScanner() {
  const { user } = useAuth();
  const { result, loading, error, submitScan, reset } = useInjuryScan();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInput = useRef(null);
  const recognition = useRef(null);

  useEffect(() => {
    if (!image) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const dictate = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (recording) {
      recognition.current?.stop();
      setRecording(false);
      return;
    }
    const instance = new SpeechRecognition();
    instance.lang = 'en-US';
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((value) => value ? `${value} ${transcript}` : transcript);
      setRecording(false);
    };
    instance.onerror = () => setRecording(false);
    instance.onend = () => setRecording(false);
    recognition.current = instance;
    instance.start();
    setRecording(true);
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      window.alert('Choose a JPEG, PNG, or WebP image smaller than 5MB.');
      event.target.value = '';
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim()) return;
    if (!consent) {
      window.alert('Please confirm consent before submitting the preliminary screening.');
      return;
    }
    try {
      await submitScan({ description: description.trim(), image });
    } catch {
      // The hook exposes the backend error in the form.
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-7 text-center">
        <span className="section-kicker">AI injury vision</span>
        <h3 className="mt-2 font-display text-xl font-bold">Sign in to start a private screening</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm opacity-75">
          Your image and symptoms are sent only after you submit with consent. The scanner uses the existing assessment service.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link className="btn btn-primary rounded-full" href="/login">Sign in</Link>
          <Link className="btn btn-outline rounded-full" href="/register">Create account</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-5">
        <section className="glass-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">Preliminary assessment</h3>
            <span className="badge badge-accent">{String(result.urgency).replaceAll('_', ' ')}</span>
          </div>
          <SeverityGauge urgency={result.urgency} />
          {result.ai_response && <p className="whitespace-pre-line text-sm leading-7">{result.ai_response}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.observations && <div className="rounded-2xl border border-seafoam/70 bg-white/55 p-4 text-sm"><strong>Observations</strong><p className="mt-1">{result.observations}</p></div>}
            {result.limitations && <div className="rounded-2xl border border-taupe bg-white/55 p-4 text-sm"><strong>Limitations</strong><p className="mt-1">{result.limitations}</p></div>}
          </div>
          {result.warning_signs && <div className="rounded-2xl border border-blush bg-blush/55 p-4 text-sm"><strong>Seek urgent help for:</strong><p className="mt-1">{result.warning_signs}</p></div>}
        </section>
        <FirstAidChecklist instructions={result.first_aid} />
        <button type="button" className="btn btn-outline rounded-full" onClick={() => { reset(); setDescription(''); setImage(null); setConsent(false); }}>Start another screening</button>
      </div>
    );
  }

  return (
    <form className="glass-card grid gap-5 p-5 md:grid-cols-2 md:p-7" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="clinical-view-pills"><span>Symptoms</span><span>Image</span><span>Safety</span></div>
        <div className="form-control">
          <label htmlFor="injury-description">Describe the injury or symptoms</label>
          <textarea
            id="injury-description"
            className="textarea textarea-bordered min-h-48 bg-white/70"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what happened, the affected area, and symptoms."
          />
        </div>
        <button type="button" className="btn btn-outline btn-sm rounded-full" onClick={dictate}>
          <Mic size={15} /> {recording ? 'Listening…' : 'Voice dictate'}
        </button>
        <label className="flex items-start gap-3 text-xs leading-relaxed">
          <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>I consent to a preliminary automated assessment. This is not a medical diagnosis.</span>
        </label>
        {error && <p className="error-message">{error}</p>}
        <div className="rounded-2xl border border-blush bg-blush/45 p-4 text-xs leading-relaxed">
          <ShieldAlert className="mb-1 inline h-4 w-4" /> Life-threatening emergency? Call 999 (Bangladesh) immediately.
        </div>
        <button type="submit" className="btn btn-primary w-full rounded-full" disabled={loading}>
          <Sparkles size={16} /> {loading ? 'Submitting…' : 'Analyze with MEDINEXA AI'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="font-bold" htmlFor="injury-image">Optional injury photo · max 5MB</label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInput.current?.click()}><Camera size={16} /> Upload</button>
          <input ref={fileInput} id="injury-image" className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} />
        </div>
        <div className="scan-viewfinder">
          <img src={preview || imagePaths.injurySample} alt={preview ? 'Selected injury photo preview' : 'Example injury scan'} />
          <div className="scan-laser" aria-hidden="true" />
          <span className="absolute left-3 top-3 rounded-full bg-offwhite/85 px-3 py-1 text-[10px] font-bold">IMAGE VIEWFINDER</span>
          {preview && <button type="button" className="btn btn-circle btn-sm absolute right-3 top-3" aria-label="Remove photo" onClick={() => { setImage(null); if (fileInput.current) fileInput.current.value = ''; }}><X size={14} /></button>}
        </div>
        <p className="text-xs opacity-70"><Activity className="mr-1 inline h-3.5 w-3.5" /> Image is only uploaded after you submit.</p>
      </div>
    </form>
  );
}
