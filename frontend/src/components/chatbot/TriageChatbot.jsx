'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bot, Send, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { telehealthAPI } from '@/lib/api';
import { AiTriageOrb } from '@/components/chatbot/AiTriageOrb';

const welcomeMessage = 'Hello! I am your MEDINEXA AI Triage Assistant. I can help organize symptoms and suggest a care direction. What health concern can I help with today?';

export function TriageChatbot({ compact = false }) {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([{ id: 'welcome', role: 'assistant', content: welcomeMessage }]);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const speechRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    setMessage('');
    setError('');
    setMessages((items) => [...items, { id: `${Date.now()}-user`, role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await telehealthAPI.chat({ message: text, session_id: sessionId || undefined });
      setSessionId(data.session_id);
      setMessages((items) => [...items, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply,
        isEmergency: data.is_emergency,
        doctors: data.suggested_doctors || [],
      }]);
    } catch (requestError) {
      const detail = requestError.response?.data?.detail || 'The assistant could not connect to the health service. Please retry or contact emergency services if this is urgent.';
      setError(detail);
      setMessages((items) => [...items, { id: `${Date.now()}-error`, role: 'assistant', content: detail, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not available in this browser.');
      return;
    }
    if (recording) {
      speechRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setMessage((current) => current ? `${current} ${spoken}` : spoken);
      setRecording(false);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    speechRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const reset = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: 'Session refreshed. How can I help you today?' }]);
    setSessionId('');
    setError('');
  };

  return (
    <section className={`glass-card overflow-hidden ${compact ? '' : 'p-4 sm:p-6'}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AiTriageOrb size="small" />
          <div>
            <p className="section-kicker">24/7 care guide</p>
            <h2 className="font-display font-bold">MEDINEXA AI Triage Bot</h2>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>New chat</button>
      </header>
      <p className="mb-3 rounded-xl border border-blush/70 bg-blush/35 p-3 text-xs leading-relaxed">
        This assistant is for preliminary guidance, not diagnosis. If someone may be in immediate danger, call local emergency services (Bangladesh: 999).
      </p>
      {error && <p role="alert" className="error-message mb-3">{error}</p>}
      {authLoading ? (
        <p className="rounded-2xl bg-white/40 p-6 text-center text-sm">Checking your account…</p>
      ) : !user ? (
        <div className="rounded-2xl border border-seafoam/55 bg-white/45 p-5 text-center">
          <p className="text-sm">Sign in to use the medical triage assistant. Your chat is sent to the existing protected backend service.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link className="btn btn-primary btn-sm rounded-full" href="/login">Sign in</Link>
            <Link className="btn btn-outline btn-sm rounded-full" href="/register">Create account</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-scroll rounded-2xl border border-seafoam/55 bg-white/35" aria-live="polite">
            {messages.map((item) => (
              <div key={item.id} className={`chat-message ${item.role === 'user' ? 'user' : ''} ${item.isEmergency || item.isError ? 'border-blush' : ''}`}>
                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-70">
                  {item.role === 'user' ? <UserRound size={12} /> : <Bot size={12} />}
                  {item.role === 'user' ? 'You' : 'MEDINEXA AI'}
                </div>
                <p>{item.content}</p>
                {item.isEmergency && <p className="mt-2 font-bold">Emergency warning from the triage service.</p>}
                {!!item.doctors?.length && (
                  <div className="mt-3 space-y-2 border-t border-seafoam/50 pt-3">
                    <strong className="text-xs">Suggested specialists</strong>
                    {item.doctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/65 p-2 text-xs">
                        <span><strong>{doctor.full_name}</strong><br />{doctor.specialty?.name || 'Specialist'}</span>
                        <Link className="btn btn-primary btn-xs rounded-full" href={`/dashboard/user/appointments?doctor_id=${doctor.id}`}>Book</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-xs opacity-70">Reviewing your message…</p>}
            <div ref={endRef} />
          </div>
          <div className="quick-replies mt-3">
            {['I have a new symptom', 'Help find a specialist', 'I need first-aid guidance'].map((prompt) => (
              <button key={prompt} type="button" className="btn btn-outline btn-xs rounded-full" onClick={() => setMessage(prompt)}>{prompt}</button>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={sendMessage}>
            <button type="button" className={`btn btn-circle btn-sm ${recording ? 'btn-accent' : 'btn-ghost'}`} onClick={startVoiceInput} aria-label={recording ? 'Stop voice input' : 'Start voice input'}>🎙</button>
            <input className="input input-bordered min-w-0 flex-1 bg-white/65" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe a symptom or concern" />
            <button type="submit" className="btn btn-primary btn-circle" disabled={!message.trim() || loading} aria-label="Send message"><Send size={16} /></button>
          </form>
        </>
      )}
    </section>
  );
}
