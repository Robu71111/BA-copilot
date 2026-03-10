import React, { useState } from 'react';
import { Upload, FileText, Mic, CheckCircle, Pencil, AlertTriangle } from 'lucide-react';
import { inputApi } from '../services/api';
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
    const ext = '.'+file.name.split('.').pop().toLowerCase();
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

  if (done) return (
    <div className="card c-done">
      <div className="card-stripe"/>
      <div className="card-body">
        <div className="card-head">
          <div className="step-badge sb-green"><CheckCircle size={15}/></div>
          <div className="card-meta">
            <div className="card-title">Input Captured <span className="step-tag">STEP 1 DONE</span></div>
            <div className="card-sub">Source locked — proceed to requirements extraction</div>
          </div>
        </div>
        <div className="done-line"><CheckCircle size={13}/> Input processed and ready for AI analysis</div>
      </div>
    </div>
  );

  return (
    <div className="card c-active">
      <div className="card-stripe"/>
      <div className="card-body">
        <div className="card-head">
          <div className="step-badge sb-blue"><Pencil size={14}/></div>
          <div className="card-meta">
            <div className="card-title">Data Input <span className="step-tag">STEP 01</span></div>
            <div className="card-sub">Provide source material — text, document, or voice recording</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab==='text'?'active':''}`} onClick={()=>setTab('text')}><FileText size={12}/> Manual Text</button>
          <button className={`tab ${tab==='file'?'active':''}`} onClick={()=>setTab('file')}><Upload size={12}/> Upload Doc</button>
          <button className={`tab ${tab==='voice'?'active':''}`} onClick={()=>setTab('voice')}><Mic size={12}/> Voice <span className="tab-badge">FREE</span></button>
        </div>

        {error && <div className="notice error"><AlertTriangle size={13} style={{flexShrink:0,marginTop:1}}/><span style={{fontSize:12}}>{error}</span></div>}

        {tab==='text' && <div className="fade-in">
          <textarea className="f-textarea" placeholder="Paste transcript, meeting notes, or requirements here..." rows={9}
            value={text} onChange={e=>{setText(e.target.value);setError(null);}} />
          <div className="action-row">
            <span className="char-count">{text.length} chars {text.length<50?`· need ${50-text.length} more`:'· ready'}</span>
            <button className="btn btn-primary" onClick={submit} disabled={loading||text.trim().length<50}>
              {loading?'Processing...':'Analyse Input →'}
            </button>
          </div>
          {loading&&<><div className="load-bar"><div className="load-fill"/></div><p className="load-hint">saving input...</p></>}
        </div>}

        {tab==='file' && <div className="fade-in">
          <label htmlFor="file-up" className="dropzone">
            <div className="dz-icon"><Upload size={18}/></div>
            <div className="dz-title">Drop document or click to browse</div>
            <div className="dz-hint">.txt · .docx · .pdf</div>
            <span className="btn btn-secondary btn-sm" style={{display:'inline-flex'}}>{loading?'Uploading...':'Choose File'}</span>
          </label>
          <input type="file" accept=".txt,.docx,.pdf" onChange={upload} style={{display:'none'}} id="file-up"/>
          {loading&&<><div className="load-bar"><div className="load-fill"/></div><p className="load-hint">parsing document...</p></>}
        </div>}

        {tab==='voice' && <div className="fade-in">
          <div className="notice success">
            <div className="notice-dot"/>
            <div><p>100% Free — Browser Web Speech API</p><small>No API costs. Runs client-side in Chrome, Edge and Safari.</small></div>
          </div>
          <AudioRecorder onTranscriptComplete={fromVoice}/>
        </div>}
      </div>
    </div>
  );
}