import React, { useState } from 'react';
import { criteriaApi } from '../services/api';
import { FlaskConical, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

export default function CriteriaSection({ userStories }) {
  const [selectedIdx, setSelectedIdx] = useState('');
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState(null);
  const [error, setError] = useState(null);

  const stories = userStories?.stories || [];

  const generate = async () => {
    const i = parseInt(selectedIdx, 10);
    const story = stories[i];
    if (!story) return;
    setLoading(true); setCriteria(null); setError(null);
    try {
      const id = story.story_id || story.id || story._id || i;
      const data = await criteriaApi.generate(id, story.user_story);
      setCriteria(data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedStory = selectedIdx !== '' ? stories[parseInt(selectedIdx, 10)] : null;

  return (
    <>
      <LoadingOverlay type="criteria" visible={loading} />
      <div className={`card ${criteria ? 'c-done' : 'c-active'}`}>
      <div className="card-stripe"/>
      <div className="card-body">

        {/* Header */}
        <div className="card-head">
          <div className={`step-badge ${criteria ? 'sb-green' : 'sb-amber'}`}>
            {criteria ? <CheckCircle size={15}/> : <FlaskConical size={15}/>}
          </div>
          <div className="card-meta">
            <div className="card-title">
              Acceptance Criteria
              <span style={{
                fontFamily:'Geist Mono,monospace', fontSize:14, fontWeight:700,
                color:'#a78bfa', background:'rgba(167,139,250,0.1)',
                padding:'2px 8px', borderRadius:4, border:'1px solid rgba(167,139,250,0.2)'
              }}>Gherkin BDD</span>
              <span className="step-tag">STEP 04</span>
            </div>
            <div className="card-sub">
              Generate Given / When / Then test scenarios for any user story
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="notice err" style={{marginBottom:16}}>
            <AlertTriangle size={14} style={{flexShrink:0, marginTop:2, color:'var(--rose)'}}/>
            <span style={{fontSize:14, color:'var(--rose)'}}>{error}</span>
          </div>
        )}

        {/* Story selector */}
        <div style={{marginBottom:16}}>
          <label style={{
            display:'block', fontSize:14, fontWeight:600,
            color:'var(--t2)', fontFamily:'Geist Mono,monospace',
            textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8
          }}>
            Select a User Story
          </label>
          <div style={{position:'relative'}}>
            <select
              className="f-select"
              value={selectedIdx}
              onChange={e => { setSelectedIdx(e.target.value); setCriteria(null); setError(null); }}
              style={{marginBottom:0, paddingRight:40}}
            >
              <option value="">Choose a story to generate criteria for...</option>
              {stories.map((s, i) => (
                <option key={i} value={i}>
                  {s.story_code || `US-${String(i+1).padStart(3,'0')}`}: {s.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{
              position:'absolute', right:14, top:'50%',
              transform:'translateY(-50%)', color:'var(--t2)', pointerEvents:'none'
            }}/>
          </div>
        </div>

        {/* Selected story preview */}
        {selectedStory && (
          <div style={{
            background:'var(--s2)', border:'1px solid var(--b1)',
            borderRadius:12, padding:'14px 18px', marginBottom:16,
            borderLeft:'3px solid rgba(167,139,250,0.5)'
          }}>
            <div style={{fontSize:14, fontWeight:700, color:'#a78bfa', fontFamily:'Geist Mono,monospace', marginBottom:6}}>
              SELECTED STORY
            </div>
            <div style={{fontSize:14, color:'var(--t1)', fontStyle:'italic', lineHeight:1.65}}>
              {selectedStory.user_story}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={loading || selectedIdx === ''}
          style={{fontSize:15, padding:'12px 28px', marginBottom: loading ? 0 : 0}}
        >
          <FlaskConical size={14}/>
          {loading ? 'Generating Scenarios...' : 'Generate Acceptance Criteria →'}
        </button>

        {loading && (
          <div style={{marginTop:16}}>
            <div className="load-bar"><div className="load-fill"/></div>
            <p className="load-hint">Writing Gherkin BDD scenarios...</p>
          </div>
        )}

        {/* Results */}
        {criteria?.criteria?.length > 0 && (
          <div style={{marginTop:24}}>
            <div className="group-title" style={{marginTop:0}}>
              <FlaskConical size={12} color="#a78bfa"/>
              <span>{criteria.criteria.length} scenario{criteria.criteria.length !== 1 ? 's' : ''} generated</span>
              <span style={{
                marginLeft:'auto', fontSize:13, fontWeight:600,
                color:'var(--green)', fontFamily:'Geist Mono,monospace',
                background:'var(--green-bg)', border:'1px solid rgba(34,197,94,0.18)',
                padding:'2px 8px', borderRadius:4
              }}>
                ✓ QA Ready
              </span>
            </div>
            {criteria.criteria.map((c, i) => (
              <div key={i} className="gherkin-card" style={{marginBottom:12}}>
                <div className="g-scenario">
                  <span style={{
                    fontSize:14, fontFamily:'Geist Mono,monospace', fontWeight:700,
                    color:'#a78bfa', marginRight:10, opacity:0.7
                  }}>
                    SCENARIO {i+1}
                  </span>
                  {c.scenario_name}
                </div>
                {c.given && (
                  <div className="g-row">
                    <span className="g-kw g-given">Given</span>
                    <span className="g-text">{c.given}</span>
                  </div>
                )}
                {c.when && (
                  <div className="g-row">
                    <span className="g-kw g-when">When</span>
                    <span className="g-text">{c.when}</span>
                  </div>
                )}
                {c.then && (
                  <div className="g-row">
                    <span className="g-kw g-then">Then</span>
                    <span className="g-text">{c.then}</span>
                  </div>
                )}
                {c.and_steps?.map((step, j) => (
                  <div key={j} className="g-row">
                    <span className="g-kw" style={{color:'var(--t2)'}}>And</span>
                    <span className="g-text">{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}