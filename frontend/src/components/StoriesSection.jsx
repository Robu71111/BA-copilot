import React, { useState } from 'react';
import { storiesApi } from '../services/api';
import { Flag, Hash, GitBranch, Table, Download } from 'lucide-react';

export default function StoriesSection({ requirements, projectType, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await storiesApi.generate(requirements, projectType);
      setStories(res);
      onComplete(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!stories && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <button className="btn btn-primary" onClick={handleGenerate}>Generate User Stories</button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm"><Table size={14} /> JIRA CSV</button>
        <button className="btn btn-secondary btn-sm"><Download size={14} /> Markdown</button>
      </div>

      {loading ? (
        <div className="loading-bar"><div className="loading-fill" /></div>
      ) : (
        stories?.stories.map((s, i) => (
          <div key={i} className="story-card">
            <div className="s-head">
              <span className="s-code">{s.story_code}</span>
              <span className="s-title">{s.title}</span>
            </div>
            <div className="s-body">{s.user_story}</div>
            <div className="s-tags">
              <span className={`tag tag-${s.priority.toLowerCase()}`}><Flag size={10} /> {s.priority}</span>
              <span className="tag" style={{ background: 'var(--s3)', color: 'var(--t2)' }}>
                <Hash size={10} /> {s.story_points} pts
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}