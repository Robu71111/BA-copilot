import React, { useState } from 'react';
import { criteriaApi } from '../services/api';
import { FlaskConical, CheckCircle } from 'lucide-react';

export default function CriteriaSection({ userStories }) {
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState('');
  const [criteria, setCriteria] = useState(null);

  const handleGenerate = async () => {
    const story = userStories.stories[parseInt(idx)];
    if (!story) return;
    setLoading(true);
    try {
      const res = await criteriaApi.generate(story.story_id || 0, story.user_story);
      setCriteria(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in" style={{ background: 'var(--bg)' }}>
      <div className="card-body">
        <div className="card-title">Acceptance Criteria</div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <select 
            className="input-area" 
            style={{ minHeight: 'unset', padding: '8px', marginBottom: 0 }}
            value={idx}
            onChange={(e) => setIdx(e.target.value)}
          >
            <option value="">Select User Story...</option>
            {userStories.stories.map((s, i) => (
              <option key={i} value={i}>{s.story_code}: {s.title}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={!idx || loading}>
            {loading ? 'Working...' : 'Generate Criteria'}
          </button>
        </div>

        {criteria?.criteria.map((c, i) => (
          <div key={i} className="gherkin-card">
            <div style={{ marginBottom: '12px', color: 'var(--t1)', fontWeight: 'bold' }}>Scenario: {c.scenario_name}</div>
            <div className="g-row"><span className="g-kw g-given">Given</span> {c.given}</div>
            <div className="g-row"><span className="g-kw g-when">When</span> {c.when}</div>
            <div className="g-row"><span className="g-kw g-then">Then</span> {c.then}</div>
          </div>
        ))}
      </div>
    </div>
  );
}