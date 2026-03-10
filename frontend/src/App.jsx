import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import { healthApi, projectApi } from './services/api';
import { Layers, FileText, Users, FlaskConical, Menu, X, ArrowRight } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [healthy, setHealthy] = useState(false);
  const [input, setInput] = useState(null);
  const [reqs, setReqs] = useState(null);
  const [stories, setStories] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    healthApi.check().then(r => setHealthy(r.status === 'healthy')).catch(() => setHealthy(false));
    projectApi.getAll().then(r => setProjects(r || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 980) setSidebarOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const selectProject = (p) => { setCurrent(p); setInput(null); setReqs(null); setStories(null); setSidebarOpen(false); };

  const createProject = async (data) => {
    const p = await projectApi.create(data);
    setProjects(prev => [...prev, p]);
    selectProject(p);
  };

  const deleteProject = async (id) => {
    await projectApi.delete(id);
    setProjects(prev => prev.filter(p => (p.id || p.project_id) !== id));
    if (current && (current.id || current.project_id) === id) { setCurrent(null); setInput(null); setReqs(null); setStories(null); }
  };

  const projectName = current?.project_name || current?.name;

  const caps = [
    { icon: FileText,     color: 'var(--indigo3)', num: '01', title: 'Requirements Extraction', desc: 'AI extracts functional & non-functional requirements from transcripts, docs, or voice.' },
    { icon: Users,        color: 'var(--teal)',     num: '02', title: 'Agile Story Mapping',     desc: 'Scrum-ready user stories with priorities, story points and dependencies.' },
    { icon: FlaskConical, color: 'var(--purple)',   num: '03', title: 'Acceptance Criteria',     desc: 'Gherkin BDD Given/When/Then scenarios for every user story.' },
    { icon: Layers,       color: 'var(--amber)',    num: '04', title: 'JIRA Export',             desc: 'One-click CSV export for JIRA or download as Markdown.' },
  ];

  return (
    <div className="app">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar projects={projects} selected={current} onSelect={selectProject} onCreate={createProject} onDelete={deleteProject} isOpen={sidebarOpen} />

      <div className="main">
        <header className="app-header">
          <div className="h-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X size={15}/> : <Menu size={15}/>}
            </button>
            <div className="breadcrumb">
              <span className="bc-root">ba-copilot</span>
              {projectName && <><span className="bc-sep">/</span><span className="bc-cur">{projectName}</span></>}
            </div>
          </div>
          <div className="h-right">
            <div className={`status-pill ${healthy ? 'online' : 'offline'}`}>
              <span className="s-dot" />{healthy ? 'systems nominal' : 'offline'}
            </div>
          </div>
        </header>

        {!current ? (
          <div className="welcome">
            <div className="hero">
              <div className="hero-eyebrow">
                <div className="eyebrow-dot" />
                AI-Powered Business Analysis Platform
              </div>
              <h1 className="hero-h1">
                Requirements,<br/>
                <em>done right.</em>
              </h1>
              <p className="hero-sub">
                Transform stakeholder inputs — transcripts, docs, voice — into
                professional requirements, user stories and acceptance criteria in minutes.
              </p>
            </div>

            <div className="cap-row">
              {caps.map(({ icon: Icon, color, num, title, desc }) => (
                <div className="cap-item" key={num}>
                  <div className="cap-icon"><Icon size={18} color={color} /></div>
                  <div className="cap-num">{num}</div>
                  <div className="cap-title">{title}</div>
                  <div className="cap-desc">{desc}</div>
                </div>
              ))}
            </div>

            <div className="hint-bar">
              <ArrowRight size={13} color="var(--t4)" />
              <span>Create or <strong>select a project</strong> from the sidebar to get started</span>
            </div>
          </div>
        ) : (
          <div className="workflow">
            <div className="workflow-inner">
              <InputSection projectId={current.id || current.project_id} onComplete={setInput} />
              {input && <RequirementsSection inputId={input.input_id} onComplete={setReqs} />}
              {reqs && <StoriesSection requirements={reqs} onComplete={setStories} />}
              {stories && <CriteriaSection userStories={stories} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}