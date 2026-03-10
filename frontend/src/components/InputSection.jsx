import React, { useState } from 'react';
import { Upload, FileText, Mic, CheckCircle, AlertCircle } from 'lucide-react';
import { inputApi } from '../services/api';
import AudioRecorder from './AudioRecorder';

export default function InputSection({ projectId, onComplete }) {
  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text || text.trim().length < 50) {
      setError("Please provide more detail (min 50 characters).");
      return;
    }
    setLoading(true); setError(null);
    try {
      const result = await inputApi.submitText(projectId, text, 'manual');
      onComplete(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const result = await inputApi.uploadDocument(projectId, file);
      onComplete(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-stripe" />
      <div className="card-body">
        <div className="card-title">Initial Input</div>
        <p className="card-desc">Define the scope of your feature or project. The more detail, the better the analysis.</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className={`btn ${tab === 'text' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('text')}>
            <FileText size={16} /> Text Input
          </button>
          <button className={`btn ${tab === 'file' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('file')}>
            <Upload size={16} /> Upload Doc
          </button>
          <button className={`btn ${tab === 'voice' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('voice')}>
            <Mic size={16} /> Voice Record
          </button>
        </div>

        {tab === 'text' && (
          <div>
            <textarea 
              className="input-area" 
              placeholder="e.g., We need a secure user authentication system that supports OAuth2 and Multi-Factor Authentication..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Analyze Requirements →'}
            </button>
          </div>
        )}

        {tab === 'file' && (
          <div style={{ padding: '40px', border: '2px dashed var(--b2)', borderRadius: '12px', textAlign: 'center' }}>
            <Upload size={32} color={'var(--t3)'} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '16px' }}>PDF, DOCX, or TXT</p>
            <input type="file" id="file-up" style={{ display: 'none' }} onChange={handleFileUpload} />
            <label htmlFor="file-up" className="btn btn-secondary">Choose File</label>
          </div>
        )}

        {tab === 'voice' && <AudioRecorder onTranscriptComplete={(t) => setText(t)} />}
        
        {error && (
          <div style={{ marginTop: '16px', color: 'var(--rose)', fontSize: '12px', display: 'flex', gap: '6px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}