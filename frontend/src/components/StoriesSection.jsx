import React, { useState } from 'react';
import { storiesApi } from '../services/api';
import { BookOpen, Table, Download, CheckCircle, AlertTriangle, Flag, Hash, GitBranch, StickyNote } from 'lucide-react';

const priorityClass = (p) => {
  if (!p) return 'tag-low';
  const l = p.toLowerCase();
  if (l === 'high') return 'tag-high';
  if (l === 'medium') return 'tag-medium';
  return 'tag-low';
};

const StoriesSection = ({ requirements, projectType = 'General', onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      if (!requirements?.input_id) throw new Error('Requirements missing input_id');
      const data = await storiesApi.generate(requirements, projectType);
      if (!data?.stories?.length) throw new Error('No stories generated. Please try again.');
      setStories(data); onComplete(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const downloadJira = async () => {
    try {
      const r = await storiesApi.exportJira(stories);
      const url = URL.createObjectURL(new Blob([r.csv], { type: 'text/csv' }));
      Object.assign(document.createElement('a'), { href: url, download: 'jira_import.csv' }).click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('JIRA export failed: ' + e.message); }
  };

  const downloadMd = () => {
    let c = '# User Stories\n\n';
    stories.stories.forEach(s => {
      c += `## ${s.story_code}: ${s.title}\n\n**Story**: ${s.user_story}\n\n**Priority**: ${s.priority} · **Points**: ${s.story_points}\n\n---\n\n`;
    });
    const url = URL.createObjectURL(new Blob([c], { type: 'text/markdown' }));
    Object.assign(document.createElement('a'), { href: url, download: 'user_stories.md' }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`section ${stories ? 's-done' : 's-active'}`}>
      <div className="section-accent" />
      <div className="section-inner">
        <div className="section-head">
          <div className={`step-icon ${stories ? 'si-green' : 'si-purple'}`}>
            {stories ? <CheckCircle size={16} /> : <BookOpen size={16} />}
          </div>
          <div className="section-meta">
            <div className="section-title">
              Agile Story Mapping <span className="step-chip">STEP 03</span>
            </div>
            <div className="section-sub">
              {stories
                ? `${stories.total_count} user stories generated in Scrum format`
                : 'Generate Scrum user stories with priorities and story points'}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {!stories ? (
          <>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              <BookOpen size={13} />
              {loading ? 'Generating Stories…' : 'Generate User Stories →'}
            </button>
            {loading && (
              <>
                <div className="loading-bar"><div className="loading-bar-track" /></div>
                <p className="loading-hint">// mapping user journeys — may take 30–60s ☕</p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="action-bar" style={{ marginBottom: 18 }}>
              <span className="stat-chip chip-func"><CheckCircle size={10} /> {stories.total_count} stories</span>
              <div className="action-right">
                <button className="btn btn-secondary btn-sm" onClick={downloadJira}>
                  <Table size={11} /> JIRA CSV
                </button>
                <button className="btn btn-secondary btn-sm" onClick={downloadMd}>
                  <Download size={11} /> Markdown
                </button>
              </div>
            </div>

            {stories.stories.map((s, i) => (
              <div key={i} className="story-card">
                <div className="story-header">
                  <span className="story-code">{s.story_code}</span>
                  <span className="story-title-text">{s.title}</span>
                </div>
                <div className="story-body">{s.user_story}</div>
                <div className="story-tags">
                  <span className={`tag ${priorityClass(s.priority)}`}><Flag size={9} /> {s.priority}</span>
                  <span className="tag tag-pts"><Hash size={9} /> {s.story_points} pts</span>
                  {s.dependencies && s.dependencies !== 'None' && (
                    <span className="tag tag-dep"><GitBranch size={9} /> {s.dependencies}</span>
                  )}
                </div>
                {s.notes && s.notes !== 'None' && (
                  <div className="story-notes">
                    <StickyNote size={10} style={{ display: 'inline', marginRight: 4 }} />
                    {s.notes}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default StoriesSection;