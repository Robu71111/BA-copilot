import React, { useState } from 'react';
import { requirementsApi } from '../services/api';
import { ListChecks, Settings2, Download, CheckCircle } from 'lucide-react';

export default function RequirementsSection({ inputId, projectType='General', industry='General', onComplete }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleExtract = async () => {
    setLoading(true);
    try {
      const res = await requirementsApi.extract(inputId, projectType, industry);
      setData(res);
      onComplete({ ...res, input_id: inputId });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <button className="btn btn-primary" onClick={handleExtract}>
          Extract Requirements from Input
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="tag tag-low"><CheckCircle size={10} /> {data?.functional?.length} Functional</span>
          <span className="tag tag-med"><Settings2 size={10} /> {data?.non_functional?.length} Non-Functional</span>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={14} /> Export .MD</button>
      </div>

      {loading ? (
        <div className="loading-bar"><div className="loading-fill" /></div>
      ) : (
        <>
          <div className="sb-section-label"><ListChecks size={12} /> Functional Requirements</div>
          {data?.functional.map((r, i) => (
            <div key={i} className="req-item">
              <div className="req-code rc-func">{r.req_code}</div>
              <div className="req-desc">{r.description}</div>
            </div>
          ))}

          <div className="sb-section-label" style={{ marginTop: '24px' }}><Settings2 size={12} /> Non-Functional</div>
          {data?.non_functional.map((r, i) => (
            <div key={i} className="req-item">
              <div className="req-code rc-nfunc">{r.req_code}</div>
              <div className="req-desc">{r.description}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}