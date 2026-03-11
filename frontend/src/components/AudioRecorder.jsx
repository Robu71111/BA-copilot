import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Circle, CheckCircle } from 'lucide-react';

const AudioRecorder = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }

    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
      }
      setTranscript(prev => prev + final);
    };

    r.onerror = (e) => { if (e.error !== 'no-speech') console.error('Speech error:', e.error); };
    r.onend = () => { if (isRecordingRef.current) r.start(); };

    setRecognition(r);
    return () => r.stop();
  }, []);

  const startRecording = () => {
    if (!recognition) return;
    setTranscript('');
    isRecordingRef.current = true;
    setIsRecording(true);
    try { recognition.start(); } catch(e) { console.error(e); }
  };

  const stopRecording = () => {
    if (!recognition) return;
    isRecordingRef.current = false;
    recognition.stop();
    setIsRecording(false);
    if (transcript.trim().length > 0) onTranscriptComplete(transcript.trim());
  };

  // ── Browser not supported ──────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'rgba(244,63,94,0.08)',
        border: '1px solid rgba(244,63,94,0.25)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <MicOff size={16} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 4 }}>
            Browser not supported
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
            Please use Chrome, Edge, or Safari for voice recording.
            Firefox has limited Web Speech API support.
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { n: '01', text: <>Click <strong style={{color:'var(--t1)'}}>Start Recording</strong></> },
    { n: '02', text: 'Allow microphone access when prompted' },
    { n: '03', text: 'Speak clearly about your project requirements' },
    { n: '04', text: <>Click <strong style={{color:'var(--t1)'}}>Stop Recording</strong> when done</> },
  ];

  return (
    <div>
      {/* ── Record / Stop button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button
          className="btn btn-primary"
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            fontSize: 15, padding: '12px 24px',
            background: isRecording
              ? 'linear-gradient(135deg,#b91c1c,#ef4444)'
              : undefined,
            animation: isRecording ? 'recPulse 1.8s ease infinite' : 'none',
          }}
        >
          {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {isRecording && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 600, fontFamily: 'Geist Mono, monospace',
            color: '#f87171',
          }}>
            <Circle size={9} fill="#f87171" stroke="none" style={{ animation: 'blink 1s ease infinite' }} />
            REC
          </div>
        )}
      </div>

      {/* ── Live transcript ── */}
      {(isRecording || transcript) && (
        <div style={{
          marginBottom: 20, padding: '14px 18px', borderRadius: 12,
          background: 'var(--s2)', border: '1px solid var(--b1)',
          borderLeft: '3px solid rgba(143,1,119,0.5)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'Geist Mono, monospace',
            color: isRecording ? '#d97dbc' : 'var(--green)',
            display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
          }}>
            {isRecording
              ? <><Circle size={8} fill="#d97dbc" stroke="none" style={{animation:'blink 1s ease infinite'}}/> Live transcript</>
              : <><CheckCircle size={12}/> Transcript captured</>
            }
          </div>
          <div style={{
            fontSize: 14, lineHeight: 1.75, color: 'var(--t2)',
            fontFamily: 'Geist, sans-serif', fontStyle: 'italic',
            maxHeight: 180, overflowY: 'auto',
          }}>
            {transcript || <span style={{color:'var(--t3)'}}>Listening…</span>}
          </div>
        </div>
      )}

      {/* ── How-to steps (only before any recording) ── */}
      {!isRecording && !transcript && (
        <div style={{
          padding: '16px 20px', borderRadius: 12,
          background: 'var(--s2)', border: '1px solid var(--b1)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', fontFamily: 'Geist Mono, monospace',
            color: 'var(--t2)', marginBottom: 14,
          }}>
            How to use voice input
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, fontFamily: 'Geist Mono, monospace',
                  color: '#d97dbc', background: 'rgba(143,1,119,0.1)',
                  border: '1px solid rgba(143,1,119,0.2)',
                  padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                  letterSpacing: '0.05em',
                }}>
                  {n}
                </span>
                <span style={{
                  fontSize: 14, color: 'var(--t2)',
                  fontFamily: 'Geist, sans-serif', lineHeight: 1.55,
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes recPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;