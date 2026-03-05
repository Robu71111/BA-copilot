import React, { useState } from 'react';
import { criteriaApi } from '../services/api';
import { FlaskConical, CheckCircle, AlertTriangle } from 'lucide-react';

const CriteriaSection = ({ userStories }) => {
  const [selectedIdx, setSelectedIdx] = useState('');
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    const idx = parseInt(selectedIdx, 10);
    const story = userStories.stories[idx];
    if (!story) return;
    setLoading(true); setCriteria(null); setError(null);
    try {
      const id = story.story_id || story.id || story._id || 0;
      const data = await criteriaApi.generate(id, story.user_story);
      setCriteria(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="section s-active">
      <div className="section-accent" />
      <div className="section-inner">
        <div className="section-head">
          <div className={`step-icon ${criteria ? 'si-green' : 'si-amber'}`}>
            {criteria ? <CheckCircle size={16} /> : <FlaskConical size={16} />}
          </div>
          <div className="section-meta">
            <div className="section-title">
              Acceptance Criteria
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--purple)', background: 'rgba(167,139,250,0.1)', padding: '1px 6px', borderRadius: 3, border: '1px solid rgba(167,139,250,0.2)' }}>
                Gherkin
              </span>
              <span className="step-chip">STEP 04</span>
            </div>
            <div className="section-sub">Generate Given / When / Then BDD scenarios for any story</div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <select
          className="form-select"
          value={selectedIdx}
          onChange={e => { setSelectedIdx(e.target.value); setCriteria(null); setError(null); }}
        >
          <option value="">// select a user story...</option>
          {userStories.stories.map((s, i) => (
            <option key={i} value={i}>{s.story_code}: {s.title}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || selectedIdx === ''}>
          <FlaskConical size={13} />
          {loading ? 'Generating Scenarios…' : 'Generate Acceptance Criteria →'}
        </button>

        {loading && (
          <>
            <div className="loading-bar"><div className="loading-bar-track" /></div>
            <p className="loading-hint">// writing BDD acceptance scenarios...</p>
          </>
        )}

        {criteria?.criteria?.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="req-group" style={{ marginTop: 0 }}>
              <FlaskConical size={12} color="#a78bfa" />
              {criteria.criteria.length} scenario{criteria.criteria.length !== 1 ? 's' : ''} generated
            </div>
            {criteria.criteria.map((c, i) => (
              <div key={i} className="gherkin-card">
                <div className="gherkin-scenario">{c.scenario_name}</div>
                <div className="gherkin-row">
                  <span className="g-kw g-given">Given</span>
                  <span className="g-text">{c.given}</span>
                </div>
                <div className="gherkin-row">
                  <span className="g-kw g-when">When</span>
                  <span className="g-text">{c.when}</span>
                </div>
                <div className="gherkin-row">
                  <span className="g-kw g-then">Then</span>
                  <span className="g-text">{c.then}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriteriaSection;