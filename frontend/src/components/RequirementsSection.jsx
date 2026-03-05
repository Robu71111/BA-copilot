import React, { useState } from 'react';
import { requirementsApi } from '../services/api';
import { ScanText, Download, CheckCircle, AlertTriangle, ListChecks, Settings2 } from 'lucide-react';

const RequirementsSection = ({ inputId, projectType = 'General', industry = 'General', onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [reqs, setReqs] = useState(null);
  const [error, setError] = useState(null);

  const handleExtract = async () => {
    setLoading(true); setError(null);
    try {
      const data = await requirementsApi.extract(inputId, projectType, industry);
      const enriched = { ...data, input_id: inputId };
      setReqs(enriched); onComplete(enriched);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const downloadMd = () => {
    if (!reqs) return;
    let c = '# Requirements Document\n\n';
    c += `**Total**: ${reqs.total_count}\n\n## Functional\n\n`;
    reqs.functional.forEach(r => { c += `**${r.req_code}**: ${r.description}\n\n`; });
    c += '## Non-Functional\n\n';
    reqs.non_functional.forEach(r => { c += `**${r.req_code}**: ${r.description}\n\n`; });
    const url = URL.createObjectURL(new Blob([c], { type: 'text/markdown' }));
    Object.assign(document.createElement('a'), { href: url, download: 'requirements.md' }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`section ${reqs ? 's-done' : 's-active'}`}>
      <div className="section-head">
        <div className={`step-icon ${reqs ? 'si-green' : 'si-blue'}`}>
          {reqs ? <CheckCircle size={17} /> : <ScanText size={17} />}
        </div>
        <div className="section-meta">
          <div className="section-title">
            Requirements Extraction <span className="step-chip">STEP 2</span>
          </div>
          <div className="section-sub">
            {reqs
              ? `${reqs.total_count} requirements — ${reqs.functional.length} functional, ${reqs.non_functional.length} non-functional`
              : 'AI extracts functional & non-functional requirements from your source'}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-box">
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {!reqs ? (
        <>
          <button className="btn btn-primary" onClick={handleExtract} disabled={loading}>
            <ScanText size={14} />
            {loading ? 'Analysing…' : 'Extract Requirements'}
          </button>
          {loading && (
            <>
              <div className="loading-bar"><div className="loading-bar-track" /></div>
              <p className="loading-hint">Running AI extraction — may take 30–60 s ☕</p>
            </>
          )}
        </>
      ) : (
        <>
          <div className="stat-row">
            <span className="stat-chip chip-total">{reqs.total_count} Total</span>
            <span className="stat-chip chip-func"><ListChecks size={11} /> {reqs.functional.length} Functional</span>
            <span className="stat-chip chip-nfunc"><Settings2 size={11} /> {reqs.non_functional.length} Non-Functional</span>
            <button className="btn btn-secondary btn-sm" onClick={downloadMd} style={{ marginLeft: 'auto' }}>
              <Download size={12} /> Export .md
            </button>
          </div>

          {reqs.functional.length > 0 && (
            <>
              <div className="req-group">
                <ListChecks size={13} color="#3b82f6" /> Functional Requirements
              </div>
              {reqs.functional.map((r, i) => (
                <div key={i} className="req-item">
                  <span className="req-badge rb-func">{r.req_code}</span>
                  <span className="req-desc">{r.description}</span>
                </div>
              ))}
            </>
          )}

          {reqs.non_functional.length > 0 && (
            <>
              <div className="req-group">
                <Settings2 size={13} color="#22c55e" /> Non-Functional Requirements
              </div>
              {reqs.non_functional.map((r, i) => (
                <div key={i} className="req-item">
                  <span className="req-badge rb-nfunc">{r.req_code}</span>
                  <span className="req-desc">{r.description}</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RequirementsSection;
