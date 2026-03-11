import React, { useState } from 'react';
import { RefreshCw,  storiesApi } from '../services/api';
import { RefreshCw,  BookOpen, Table, Download, CheckCircle, AlertTriangle, Flag, Hash, GitBranch, StickyNote } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

const pClass = (p) => { if(!p) return 'tag-low'; const l=p.toLowerCase(); if(l==='high') return 'tag-high'; if(l==='medium') return 'tag-med'; return 'tag-low'; };

export default function StoriesSection({ requirements, projectType='General', onComplete }) {
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  const regenerate = () => {
    setStories(null); setError(null);
    if (onReset) onReset();
  };

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      if (!requirements?.input_id) throw new Error('Requirements missing input_id');
      const data = await storiesApi.generate(requirements, projectType);
      if (!data?.stories?.length) throw new Error('No stories generated. Please try again.');
      setStories(data); onComplete(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const exportJira = async () => {
    try {
      const r = await storiesApi.exportJira(stories);
      const url = URL.createObjectURL(new Blob([r.csv],{type:'text/csv'}));
      Object.assign(document.createElement('a'),{href:url,download:'jira_import.csv'}).click();
      URL.revokeObjectURL(url);
    } catch(e) { alert('JIRA export failed: '+e.message); }
  };

  const exportMd = () => {
    let c = '# User Stories\n\n';
    stories.stories.forEach(s => { c += `## ${s.story_code}: ${s.title}\n\n**Story**: ${s.user_story}\n\n**Priority**: ${s.priority} · **Points**: ${s.story_points}\n\n---\n\n`; });
    const url = URL.createObjectURL(new Blob([c],{type:'text/markdown'}));
    Object.assign(document.createElement('a'),{href:url,download:'user_stories.md'}).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <LoadingOverlay type="stories" visible={loading} />
      <div className={`card ${stories ? 'c-done' : 'c-active'}`}>
        <div className="card-stripe"/>
        <div className="card-body">
          <div className="card-head">
            <div className={`step-badge ${stories ? 'sb-green' : 'sb-purple'}`}>
              {stories ? <CheckCircle size={15}/> : <BookOpen size={15}/>}
            </div>
            <div className="card-meta">
              <div className="card-title">Agile Story Mapping <span className="step-tag">STEP 03</span></div>
              <div className="card-sub">
                {stories
                  ? `${stories.total_count} user stories generated in Scrum format`
                  : 'Generate Scrum user stories with priorities and story points'}
              </div>
            </div>
          </div>

          {error && (
            <div className="notice err" style={{marginBottom:16}}>
              <AlertTriangle size={14} style={{flexShrink:0,marginTop:2,color:'var(--rose)'}}/>
              <span style={{fontSize:14,color:'var(--rose)'}}>{error}</span>
            </div>
          )}

          {!stories ? (
            <button className="btn btn-primary" onClick={generate} disabled={loading}
              style={{fontSize:15, padding:'12px 28px'}}>
              <BookOpen size={14}/> Generate User Stories →
            </button>
          ) : (
            <>
              <div className="action-row" style={{marginBottom:18}}>
                <span className="chip chip-i"><CheckCircle size={10}/> {stories.total_count} stories</span>
                <div className="a-right">
                  <button className="btn btn-secondary btn-sm" onClick={exportJira}><Table size={11}/> JIRA CSV</button>
                  <button className="btn btn-secondary btn-sm" onClick={exportMd}><Download size={11}/> Markdown</button>
                  <button className="btn btn-secondary btn-sm" onClick={regenerate} title="Regenerate stories"><RefreshCw size={11}/> Regenerate</button>
                </div>
              </div>
              {stories.stories.map((s,i) => (
                <div key={i} className="story-card">
                  <div className="s-head">
                    <span className="s-code">{s.story_code}</span>
                    <span className="s-title">{s.title}</span>
                  </div>
                  <div className="s-body">{s.user_story}</div>
                  <div className="s-tags">
                    <span className={`tag ${pClass(s.priority)}`}><Flag size={9}/> {s.priority}</span>
                    <span className="tag tag-pts"><Hash size={9}/> {s.story_points} pts</span>
                    {s.dependencies && s.dependencies !== 'None' && (
                      <span className="tag tag-dep"><GitBranch size={9}/> {s.dependencies}</span>
                    )}
                  </div>
                  {s.notes && s.notes !== 'None' && (
                    <div className="s-notes"><StickyNote size={9} style={{display:'inline',marginRight:4}}/>{s.notes}</div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}