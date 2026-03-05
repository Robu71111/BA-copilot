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
      <div className="section-accent" />
      <div className="section-inner">
        <div className="section-head">
          <div className={`step-icon ${reqs ? 'si-green' : 'si-blue'}`}>
            {reqs ? <CheckCircle size={16} /> : <ScanText size={16} />}
          </div>
          <div className="section-meta">
            <div className="section-title">
              Requirements Extraction <span className="step-chip">STEP 02</span>
            </div>
            <div className="section-sub">
              {reqs
                ? `${reqs.total_count} requirements extracted — ${reqs.functional.length} functional, ${reqs.non_functional.length} non-functional`
                : 'AI extracts functional & non-functional requirements from your source'}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {!reqs ? (
          <>
            <button className="btn btn-primary" onClick={handleExtract} disabled={loading}>
              <ScanText size={13} />
              {loading ? 'Analysing…' : 'Extract Requirements →'}
            </button>
            {loading && (
              <>
                <div className="loading-bar"><div className="loading-bar-track" /></div>
                <p className="loading-hint">// running AI extraction — may take 30–60s ☕</p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="stat-row">
              <span className="stat-chip chip-total">{reqs.total_count} total</span>
              <span className="stat-chip chip-func"><ListChecks size={10} /> {reqs.functional.length} functional</span>
              <span className="stat-chip chip-nfunc"><Settings2 size={10} /> {reqs.non_functional.length} non-functional</span>
              <button className="btn btn-secondary btn-sm" onClick={downloadMd} style={{ marginLeft: 'auto' }}>
                <Download size={11} /> Export .md
              </button>
            </div>

            {reqs.functional.length > 0 && (
              <>
                <div className="req-group"><ListChecks size={12} color="#818cf8" /> Functional Requirements</div>
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
                <div className="req-group"><Settings2 size={12} color="#10b981" /> Non-Functional Requirements</div>
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
    </div>
  );
};

export default RequirementsSection;