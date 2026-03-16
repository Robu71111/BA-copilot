import React, { useState } from 'react';
import { storiesApi } from '../services/api';
import { RefreshCw, BookOpen, Table, Download, CheckCircle, AlertTriangle, Flag, Hash, GitBranch, StickyNote, Pencil, Check, X } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

const pClass = (p) => { if(!p) return 'tag-low'; const l=p.toLowerCase(); if(l==='high') return 'tag-high'; if(l==='medium') return 'tag-med'; return 'tag-low'; };

function EditableStoryCard({ story, index, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...story });

  const save = () => {
    onUpdate(index, draft);
    setEditing(false);
  };

  const cancel = () => { setDraft({ ...story }); setEditing(false); };

  if (editing) {
    return (
      <div className="story-card story-card-editing">
        <div className="s-head">
          <span className="s-code">{story.story_code}</span>
          <input
            className="req-edit-input"
            value={draft.title}
            onChange={e => setDraft({...draft, title: e.target.value})}
            style={{flex:1, fontSize:15, fontWeight:700, padding:'6px 10px'}}
            placeholder="Story title"
          />
        </div>
        <textarea
          className="req-edit-input"
          value={draft.user_story}
          onChange={e => setDraft({...draft, user_story: e.target.value})}
          rows={3}
          style={{marginBottom:10, fontSize:14, lineHeight:1.7}}
          placeholder="As a [role], I want [feature], so that [benefit]"
        />
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:10}}>
          <label style={{fontSize:12, color:'var(--t2)', fontFamily:'Geist Mono,monospace'}}>Priority:</label>
          <select
            value={draft.priority}
            onChange={e => setDraft({...draft, priority: e.target.value})}
            className="f-select"
            style={{width:'auto', marginBottom:0, padding:'6px 28px 6px 10px', fontSize:13}}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <label style={{fontSize:12, color:'var(--t2)', fontFamily:'Geist Mono,monospace'}}>Points:</label>
          <select
            value={draft.story_points}
            onChange={e => setDraft({...draft, story_points: parseInt(e.target.value)})}
            className="f-select"
            style={{width:'auto', marginBottom:0, padding:'6px 28px 6px 10px', fontSize:13}}
          >
            {[1,2,3,5,8,13].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="btn btn-primary btn-sm" onClick={save} style={{padding:'5px 14px', fontSize:12}}>
            <Check size={10}/> Save
          </button>
          <button className="btn btn-secondary btn-sm" onClick={cancel} style={{padding:'5px 14px', fontSize:12}}>
            <X size={10}/> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-card" onClick={() => setEditing(true)} style={{cursor:'pointer'}} title="Click to edit">
      <div className="s-head">
        <span className="s-code">{story.story_code}</span>
        <span className="s-title">{story.title}</span>
        <Pencil size={12} style={{flexShrink:0, color:'var(--t3)', opacity:0, marginLeft:'auto'}} className="req-edit-icon"/>
      </div>
      <div className="s-body">{story.user_story}</div>
      <div className="s-tags">
        <span className={`tag ${pClass(story.priority)}`}><Flag size={9}/> {story.priority}</span>
        <span className="tag tag-pts"><Hash size={9}/> {story.story_points} pts</span>
        {story.dependencies && story.dependencies !== 'None' && (
          <span className="tag tag-dep"><GitBranch size={9}/> {story.dependencies}</span>
        )}
      </div>
      {story.notes && story.notes !== 'None' && (
        <div className="s-notes"><StickyNote size={9} style={{display:'inline',marginRight:4}}/>{story.notes}</div>
      )}
    </div>
  );
}

export default function StoriesSection({ requirements, projectType='General', onComplete, onReset }) {
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

  const updateStory = (index, updatedStory) => {
    const updated = { ...stories };
    updated.stories = [...updated.stories];
    updated.stories[index] = updatedStory;
    setStories(updated);
    onComplete(updated);
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
              <div className="output-scroll-box">
                <div className="edit-hint">
                  <Pencil size={11}/> Click any story to edit it
                </div>
                {stories.stories.map((s,i) => (
                  <EditableStoryCard key={i} story={s} index={i} onUpdate={updateStory} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}