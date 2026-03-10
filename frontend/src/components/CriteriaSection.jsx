import React, { useState } from 'react';
import { criteriaApi } from '../services/api';
import { FlaskConical, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CriteriaSection({ userStories }) {
  const [idx, setIdx] = useState('');
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    const i = parseInt(idx, 10);
    const story = userStories.stories[i];
    if (!story) return;
    setLoading(true); setCriteria(null); setError(null);
    try {
      const id = story.story_id||story.id||story._id||0;
      const data = await criteriaApi.generate(id, story.user_story);
      setCriteria(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="card c-active">
      <div className="card-stripe"/>
      <div className="card-body">
        <div className="card-head">
          <div className={`step-badge ${criteria?'sb-green':'sb-amber'}`}>
            {criteria?<CheckCircle size={15}/>:<FlaskConical size={15}/>}
          </div>
          <div className="card-meta">
            <div className="card-title">
              Acceptance Criteria
              <span style={{fontFamily:'Geist Mono,monospace',fontSize:9.5,fontWeight:700,color:'var(--purple)',background:'rgba(167,139,250,0.09)',padding:'2px 6px',borderRadius:3,border:'1px solid rgba(167,139,250,0.16)'}}>Gherkin BDD</span>
              <span className="step-tag">STEP 04</span>
            </div>
            <div className="card-sub">Generate Given / When / Then scenarios for any user story</div>
          </div>
        </div>

        {error && <div className="notice error"><AlertTriangle size={13} style={{flexShrink:0,marginTop:1}}/><span style={{fontSize:12}}>{error}</span></div>}

        <select className="f-select" value={idx} onChange={e=>{setIdx(e.target.value);setCriteria(null);setError(null);}}>
          <option value="">Select a user story...</option>
          {userStories.stories.map((s,i)=><option key={i} value={i}>{s.story_code}: {s.title}</option>)}
        </select>

        <button className="btn btn-primary" onClick={generate} disabled={loading||idx===''}>
          <FlaskConical size={13}/>{loading?'Generating Scenarios...':'Generate Acceptance Criteria →'}
        </button>

        {loading&&<><div className="load-bar"><div className="load-fill"/></div><p className="load-hint">writing BDD scenarios...</p></>}

        {criteria?.criteria?.length>0&&(
          <div style={{marginTop:22}}>
            <div className="group-title" style={{marginTop:0}}>
              <FlaskConical size={12} color="var(--purple)"/>
              {criteria.criteria.length} scenario{criteria.criteria.length!==1?'s':''} generated
            </div>
            {criteria.criteria.map((c,i)=>(
              <div key={i} className="gherkin-card">
                <div className="g-scenario">{c.scenario_name}</div>
                <div className="g-row"><span className="g-kw g-given">Given</span><span className="g-text">{c.given}</span></div>
                <div className="g-row"><span className="g-kw g-when">When</span><span className="g-text">{c.when}</span></div>
                <div className="g-row"><span className="g-kw g-then">Then</span><span className="g-text">{c.then}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}