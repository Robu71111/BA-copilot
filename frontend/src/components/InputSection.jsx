import React, { useState } from 'react';
import { Upload, FileText, Mic, CheckCircle, Pencil, AlertTriangle } from 'lucide-react';
import { inputApi } from '../services/api';
import AudioRecorder from './AudioRecorder';

const InputSection = ({ projectId, onComplete }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text || text.trim().length < 50) return;
    setLoading(true); setError(null);
    try {
      const res = await inputApi.submitText(projectId, text, 'manual');
      onComplete(res); setIsDone(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.txt', '.docx', '.pdf'].includes(ext)) { setError('Only .txt, .docx, .pdf supported'); return; }
    setLoading(true); setError(null);
    try {
      const res = await inputApi.uploadDocument(projectId, file);
      onComplete(res); setIsDone(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleTranscript = async (transcript) => {
    if (!transcript || transcript.trim().length < 50) { setError('Transcript too short (min 50 chars)'); return; }
    setLoading(true); setError(null);
    try {
      const res = await inputApi.submitText(projectId, transcript, 'voice');
      onComplete(res); setIsDone(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (isDone) {
    return (
      <div className="section s-done">
        <div className="section-accent" />
        <div className="section-inner">
          <div className="section-head">
            <div className="step-icon si-green"><CheckCircle size={16} /></div>
            <div className="section-meta">
              <div className="section-title">Input Captured <span className="step-chip">STEP 1 · DONE</span></div>
              <div className="section-sub">Source locked — proceed to requirements extraction</div>
            </div>
          </div>
          <div className="done-row"><CheckCircle size={13} /> Input processed and ready for AI analysis</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section s-active">
      <div className="section-accent" />
      <div className="section-inner">
        <div className="section-head">
          <div className="step-icon si-blue"><Pencil size={15} /></div>
          <div className="section-meta">
            <div className="section-title">Data Input <span className="step-chip">STEP 01</span></div>
            <div className="section-sub">Provide your source material — text, document, or voice</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
            <FileText size={12} /> Manual Text
          </button>
          <button className={`tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => setActiveTab('file')}>
            <Upload size={12} /> Upload Doc
          </button>
          <button className={`tab ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>
            <Mic size={12} /> Voice <span className="tab-free">FREE</span>
          </button>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="fade-in">
            <textarea
              className="form-textarea"
              placeholder="Paste transcript, meeting notes, or requirements here..."
              rows={9}
              value={text}
              onChange={e => { setText(e.target.value); setError(null); }}
            />
            <div className="action-bar">
              <span className="char-count">{text.length} chars {text.length < 50 ? `· need ${50 - text.length} more` : '· ready'}</span>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || text.trim().length < 50}>
                {loading ? 'Processing...' : 'Analyse Input →'}
              </button>
            </div>
            {loading && (
              <>
                <div className="loading-bar"><div className="loading-bar-track" /></div>
                <p className="loading-hint">saving input...</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'file' && (
          <div className="fade-in">
            <label htmlFor="file-upload" className="dropzone">
              <div className="dropzone-icon"><Upload size={19} /></div>
              <div className="dropzone-title">Drop document or click to browse</div>
              <div className="dropzone-hint">.txt · .docx · .pdf</div>
              <span className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                {loading ? 'Uploading...' : 'Choose File'}
              </span>
            </label>
            <input type="file" accept=".txt,.docx,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
            {loading && (
              <>
                <div className="loading-bar"><div className="loading-bar-track" /></div>
                <p className="loading-hint">parsing document...</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="fade-in">
            <div className="free-notice">
              <div className="free-dot" />
              <div>
                <p>100% Free — Browser Web Speech API</p>
                <small>No API costs. Runs client-side in Chrome, Edge &amp; Safari.</small>
              </div>
            </div>
            <AudioRecorder onTranscriptComplete={handleTranscript} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;