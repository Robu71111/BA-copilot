import React, { useState } from 'react';
import { requirementsApi } from '../services/api';
import { ScanText, Download, CheckCircle, AlertTriangle, ListChecks, Settings2 } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

export default function RequirementsSection({ inputId, projectType='General', industry='General', onComplete, onReset }) {
  const [loading, setLoading] = useState(false);
  const [reqs, setReqs] = useState(null);
  const [error, setError] = useState(null);

  const extract = async () => {
    setLoading(true); setError(null);
    try {
      const data = await requirementsApi.extract(inputId, projectType, industry);
      const enriched = { ...data, input_id: inputId };
      setReqs(enriched); onComplete(enriched);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const regenerate = () => {
    setReqs(null); setError(null);
    if (onReset) onReset();
  };

  const downloadMd = () => {
    let c = '# Requirements\n\n## Functional\n\n';
    reqs.functional.forEach(r => { c += `**${r.req_code}**: ${r.description}\n\n`; });
    c += '## Non-Functional\n\n';
    reqs.non_functional.forEach(r => { c += `**${r.req_code}**: ${r.description}\n\n`; });
    const url = URL.createObjectURL(new Blob([c],{type:'text/markdown'}));
    Object.assign(document.createElement('a'),{href:url,download:'requirements.md'}).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <LoadingOverlay type="requirements" visible={loading} />
      <div className={`card ${reqs ? 'c-done' : 'c-active'}`}>
        <div className="card-stripe"/>
        <div className="card-body">
          <div className="card-head">
            <div className={`step-badge ${reqs ? 'sb-green' : 'sb-blue'}`}>
              {reqs ? <CheckCircle size={15}/> : <ScanText size={15}/>}
            </div>
            <div className="card-meta">
              <div className="card-title">Requirements Extraction <span className="step-tag">STEP 02</span></div>
              <div className="card-sub">
                {reqs
                  ? `${reqs.total_count} requirements — ${reqs.functional.length} functional, ${reqs.non_functional.length} non-functional`
                  : 'AI extracts functional and non-functional requirements from your source'}
              </div>
            </div>
          </div>

          {error && (
            <div className="notice err" style={{marginBottom:16}}>
              <AlertTriangle size={14} style={{flexShrink:0,marginTop:2,color:'var(--rose)'}}/>
              <span style={{fontSize:14,color:'var(--rose)'}}>{error}</span>
            </div>
          )}

          {!reqs ? (
            <button className="btn btn-primary" onClick={extract} disabled={loading}
              style={{fontSize:15, padding:'12px 28px'}}>
              <ScanText size={14}/> Extract Requirements →
            </button>
          ) : (
            <>
              <div className="stat-chips">
                <span className="chip chip-n">{reqs.total_count} total</span>
                <span className="chip chip-i"><ListChecks size={10}/> {reqs.functional.length} functional</span>
                <span className="chip chip-g"><Settings2 size={10}/> {reqs.non_functional.length} non-functional</span>
                <button className="btn btn-secondary btn-sm" onClick={downloadMd} style={{marginLeft:'auto'}}>
                  <Download size={11}/> Export .md
                </button>
                <button className="btn btn-secondary btn-sm" onClick={regenerate}
                  title="Clear and regenerate requirements">
                  <Settings2 size={11}/> Regenerate
                </button>
              </div>
              {reqs.functional.length > 0 && <>
                <div className="group-title">
                  <ListChecks size={12} color="var(--p2)"/> Functional Requirements
                </div>
                {reqs.functional.map((r,i) => (
                  <div key={i} className="req-item">
                    <span className="req-code rc-f">{r.req_code}</span>
                    <span className="req-desc">{r.description}</span>
                  </div>
                ))}
              </>}
              {reqs.non_functional.length > 0 && <>
                <div className="group-title">
                  <Settings2 size={12} color="var(--green)"/> Non-Functional Requirements
                </div>
                {reqs.non_functional.map((r,i) => (
                  <div key={i} className="req-item">
                    <span className="req-code rc-n">{r.req_code}</span>
                    <span className="req-desc">{r.description}</span>
                  </div>
                ))}
              </>}
            </>
          )}
        </div>
      </div>
    </>
  );
}