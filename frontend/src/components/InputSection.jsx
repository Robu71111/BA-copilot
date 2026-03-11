import React, { useState } from 'react';
import { Upload, FileText, Mic, CheckCircle, Pencil, AlertTriangle } from 'lucide-react';
import { inputApi } from '../services/api';
import LoadingOverlay from './LoadingOverlay';
import AudioRecorder from './AudioRecorder';

export default function InputSection({ projectId, onComplete }) {
  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!text || text.trim().length < 50) return;
    setLoading(true); setError(null);
    try { const r = await inputApi.submitText(projectId, text, 'manual'); onComplete(r); setDone(true); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.txt','.docx','.pdf'].includes(ext)) { setError('Only .txt, .docx, .pdf supported'); return; }
    setLoading(true); setError(null);
    try { const r = await inputApi.uploadDocument(projectId, file); onComplete(r); setDone(true); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fromVoice = async (transcript) => {
    if (!transcript || transcript.trim().length < 50) { setError('Transcript too short (min 50 chars)'); return; }
    setLoading(true); setError(null);
    try { const r = await inputApi.submitText(projectId, transcript, 'voice'); onComplete(r); setDone(true); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const charCount = text.length;
  const isReady = charCount >= 50;

  if (done) return (
    <div className="card c-done">
      <div className="card-stripe"/>
      <div className="card-body">
        <div className="card-head">
          <div className="step-badge sb-green"><CheckCircle size={16}/></div>
          <div className="card-meta">
            <div className="card-title">Input Captured <span className="step-tag">STEP 1 DONE</span></div>
            <div className="card-sub">Source locked — proceed to requirements extraction below</div>
          </div>
        </div>
        <div className="done-line"><CheckCircle size={14}/> Input processed and ready for AI analysis</div>
      </div>
    </div>
  );

  return (
    <>
      <LoadingOverlay type="input" visible={loading} />
      <div className="card c-active">
      <div className="card-stripe"/>
      <div className="card-body">
        <div className="card-head">
          <div className="step-badge sb-blue"><Pencil size={15}/></div>
          <div className="card-meta">
            <div className="card-title">
              Initial Input
              <span className="step-tag">STEP 01</span>
            </div>
            <div className="card-sub">Define the scope of your feature or project. The more detail, the better the analysis.</div>
          </div>
        </div>

        <div className="tabs" style={{marginBottom:20}}>
          <button className={`tab ${tab==='text'?'active':''}`} onClick={()=>setTab('text')}>
            <FileText size={13}/> Text Input
          </button>
          <button className={`tab ${tab==='file'?'active':''}`} onClick={()=>setTab('file')}>
            <Upload size={13}/> Upload Doc
          </button>
          <button className={`tab ${tab==='voice'?'active':''}`} onClick={()=>setTab('voice')}>
            <Mic size={13}/> Voice Record <span className="tab-badge">FREE</span>
          </button>
        </div>

        {error && (
          <div className="notice err" style={{marginBottom:16}}>
            <AlertTriangle size={14} style={{flexShrink:0,marginTop:2,color:'var(--rose)'}}/>
            <span style={{fontSize:14,color:'var(--rose)'}}>{error}</span>
          </div>
        )}

        {tab==='text' && (
          <div className="fade-in">
            <textarea
              className="f-textarea"
              placeholder="e.g., We need a secure user authentication system that supports email/password login, OAuth with Google and GitHub, two-factor authentication, and session management. Users should be able to reset passwords via email. The system must handle 10,000 concurrent users with sub-200ms response times..."
              rows={10}
              value={text}
              onChange={e => { setText(e.target.value); setError(null); }}
              style={{width:'100%', display:'block'}}
            />
            <div className="action-row" style={{marginTop:14}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <span className="char-count">{charCount} chars</span>
                {!isReady && (
                  <span style={{fontSize:14,color:'var(--t2)',fontFamily:'Geist Mono,monospace'}}>
                    · {50 - charCount} more needed
                  </span>
                )}
                {isReady && (
                  <span style={{fontSize:14,color:'var(--green)',fontFamily:'Geist Mono,monospace',display:'flex',alignItems:'center',gap:4}}>
                    <CheckCircle size={11}/> Ready to analyse
                  </span>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={loading || !isReady}
                style={{fontSize:15, padding:'12px 28px'}}
              >
                {loading ? 'Processing...' : 'Analyze Requirements →'}
              </button>
            </div>
            {loading && (
              <div style={{marginTop:16}}>
                <div className="load-bar"><div className="load-fill"/></div>
                <p className="load-hint">Running AI extraction — this may take 30-60 seconds...</p>
              </div>
            )}
          </div>
        )}

        {tab==='file' && (
          <div className="fade-in">
            <label htmlFor="file-up" className="dropzone" style={{cursor:'pointer'}}>
              <div className="dz-icon"><Upload size={22}/></div>
              <div className="dz-title">Drop your document here or click to browse</div>
              <div className="dz-hint">Supported formats: .txt · .docx · .pdf</div>
              <span className="btn btn-secondary btn-sm" style={{display:'inline-flex',marginTop:8}}>
                {loading ? 'Uploading...' : 'Choose File'}
              </span>
            </label>
            <input type="file" accept=".txt,.docx,.pdf" onChange={upload} style={{display:'none'}} id="file-up"/>
            {loading && (
              <div style={{marginTop:16}}>
                <div className="load-bar"><div className="load-fill"/></div>
                <p className="load-hint">Parsing document...</p>
              </div>
            )}
          </div>
        )}

        {tab==='voice' && (
          <div className="fade-in">
            <div className="notice ok" style={{marginBottom:16}}>
              <div className="n-dot"/>
              <div>
                <p style={{marginBottom:2}}>Free Speech to Transcript Converter</p>
                
              </div>
            </div>
            <AudioRecorder onTranscriptComplete={fromVoice}/>
          </div>
        )}
      </div>
    </div>
    </>
  );
}