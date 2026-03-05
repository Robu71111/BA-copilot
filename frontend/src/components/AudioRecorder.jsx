import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const AudioRecorder = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) setTranscript(prev => prev + final);
    };
    r.onerror = (e) => { if (e.error !== 'no-speech') console.error('SR error:', e.error); };
    recognitionRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, []);

  const start = () => {
    if (!recognitionRef.current) return;
    setTranscript(''); setIsRecording(true);
    try { recognitionRef.current.start(); } catch (e) { console.error(e); }
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    setIsRecording(false);
    setTimeout(() => {
      setTranscript(prev => { if (prev.trim()) onTranscriptComplete(prev.trim()); return prev; });
    }, 300);
  };

  if (!isSupported) {
    return (
      <div className="error-box">
        <MicOff size={15} style={{ flexShrink: 0 }} />
        <div>
          <strong>Browser not supported</strong><br />
          <span style={{ fontSize: 12 }}>Use Chrome, Edge or Safari for voice recording.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="audio-controls">
        <button
          className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
          onClick={isRecording ? stop : start}
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {isRecording && (
          <div className="rec-live">
            <div className="rec-dot" /> Recording live
          </div>
        )}
      </div>

      {(isRecording || transcript) ? (
        <div>
          <div className="transcript-label">{isRecording ? 'Live transcript' : 'Transcript complete'}</div>
          <div className="transcript-box">{transcript || '…'}</div>
        </div>
      ) : (
        <div className="howto-box">
          <strong>How to use voice input</strong>
          <ol>
            <li>Click <strong>Start Recording</strong></li>
            <li>Allow microphone access when prompted</li>
            <li>Speak clearly about your project requirements</li>
            <li>Click <strong>Stop Recording</strong> when done</li>
            <li>Transcript saves automatically — no API cost</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
