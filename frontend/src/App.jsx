import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import { healthApi, projectApi } from './services/api';
import { Layers, FileText, Users, FlaskConical, Menu, X, ArrowRight, Zap } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [healthy, setHealthy] = useState(false);
  const [page, setPage] = useState('home'); // 'home' | 'services' | 'workspace'
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

  const selectProject = (p) => {
    setCurrent(p); setInput(null); setReqs(null); setStories(null);
    setPage('workspace'); setSidebarOpen(false);
  };

  const createProject = async (data) => {
    const p = await projectApi.create(data);
    setProjects(prev => [...prev, p]);
    selectProject(p);
  };

  const deleteProject = async (id) => {
    await projectApi.delete(id);
    setProjects(prev => prev.filter(p => (p.id || p.project_id) !== id));
    if (current && (current.id || current.project_id) === id) {
      setCurrent(null); setInput(null); setReqs(null); setStories(null); setPage('home');
    }
  };

  const projectName = current?.project_name || current?.name;

  const caps = [
    { icon: FileText, color: 'var(--ind2)', num: '01', title: 'Requirements Extraction', desc: 'AI extracts functional & non-functional requirements from any source.' },
    { icon: Users, color: 'var(--teal)', num: '02', title: 'Agile Story Mapping', desc: 'Scrum-ready user stories with priorities and story points.' },
    { icon: FlaskConical, color: 'var(--purple)', num: '03', title: 'Acceptance Criteria', desc: 'Gherkin BDD Given/When/Then scenarios for every story.' },
    { icon: Layers, color: 'var(--amber)', num: '04', title: 'JIRA Export', desc: 'One-click CSV export for JIRA or download as Markdown.' },
  ];

  const renderPage = () => {
    if (page === 'services') return <ServicesPage />;
    if (page === 'workspace' && current) return (
      <div className="workflow">
        <div className="workflow-inner">
          <InputSection projectId={current.id || current.project_id} onComplete={setInput} />
          {input && <RequirementsSection inputId={input.input_id} onComplete={setReqs} />}
          {reqs && <StoriesSection requirements={reqs} onComplete={setStories} />}
          {stories && <CriteriaSection userStories={stories} />}
        </div>
      </div>
    );
    // Default: home
    return (
      <div className="home">
        <div className="hero">
          <div className="eyebrow"><div className="eyebrow-dot" />AI-Powered Business Analysis Platform</div>
          <h1 className="hero-h1">Requirements,<br /><em>done right.</em></h1>
          <p className="hero-sub">
            Transform stakeholder inputs — transcripts, docs, voice — into professional
            requirements, user stories and acceptance criteria in minutes.
          </p>
        </div>

        <div className="cap-strip">
          {caps.map(({ icon: Icon, color, num, title, desc }) => (
            <div className="cap" key={num}>
              <div className="cap-num">{num}</div>
              <div className="cap-icon-wrap"><Icon size={16} color={color} /></div>
              <div className="cap-title">{title}</div>
              <div className="cap-desc">{desc}</div>
            </div>
          ))}
        </div>

        <div className="hint-strip">
          <ArrowRight size={13} color="var(--t4)" />
          <span>Create or <strong>select a project</strong> from the sidebar to start analysing</span>
        </div>

        <footer className="home-footer">
          <div className="footer-brand">
            <div className="footer-gem"><Zap size={10} color="#fff" fill="#fff" /></div>
            <span className="footer-name">BA <em>Copilot</em></span>
          </div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setPage('services')} style={{background:'none',border:'none',cursor:'pointer',padding:0,font:'inherit'}}>Services</button>
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="footer-link">OpenRouter</a>
            <a href="https://github.com/Robu71111/BA-copilot" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
          <div className="footer-status">
            <div className="footer-status-dot" />
            {healthy ? 'All systems operational' : 'Backend offline'}
          </div>
          <div className="footer-copy">© 2026 BA Copilot · Built with OpenRouter AI</div>
        </footer>
      </div>
    );
  };

  return (
    <div className="app">
      <div className={`mob-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        projects={projects} selected={current}
        onSelect={selectProject} onCreate={createProject} onDelete={deleteProject}
        isOpen={sidebarOpen} currentPage={page} onNav={p => { setPage(p); setSidebarOpen(false); if (p !== 'workspace') setCurrent(null); }}
      />
      <div className="main">
        <header className="app-header">
          <div className="h-left">
            <button className="mob-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
            <div className="breadcrumb">
              <span className="bc-root">ba-copilot</span>
              {page === 'services' && <><span className="bc-sep">/</span><span className="bc-cur">Services</span></>}
              {page === 'workspace' && projectName && <><span className="bc-sep">/</span><span className="bc-cur">{projectName}</span></>}
            </div>
          </div>
          <div className="h-right">
            <div className={`status-pill ${healthy ? 'on' : 'off'}`}>
              <span className="s-dot" />{healthy ? 'systems nominal' : 'offline'}
            </div>
          </div>
        </header>
        {renderPage()}
      </div>
    </div>
  );
}

function ServicesPage() {
  const cards = [
    {
      icon: FileText, iconColor: 'var(--ind2)', iconBg: 'rgba(99,102,241,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Requirements Analysis', featured: true,
      desc: 'Automatically extract structured requirements from any text input using state-of-the-art AI models.',
      features: ['Functional requirements extraction', 'Non-functional requirements', 'Multi-format input support', 'Markdown export'],
    },
    {
      icon: Users, iconColor: 'var(--teal)', iconBg: 'rgba(45,212,191,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Agile Story Mapping',
      desc: 'Convert requirements into prioritised Scrum user stories complete with story points and dependencies.',
      features: ['As a user I want format', 'Priority classification', 'Story point estimation', 'JIRA CSV export'],
    },
    {
      icon: FlaskConical, iconColor: 'var(--purple)', iconBg: 'rgba(167,139,250,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Acceptance Criteria',
      desc: 'Generate Given/When/Then Gherkin BDD scenarios for every user story automatically.',
      features: ['Gherkin BDD format', 'Multiple scenarios per story', 'Edge case coverage', 'QA-ready output'],
    },
    {
      icon: Layers, iconColor: 'var(--amber)', iconBg: 'rgba(245,158,11,0.1)',
      tag: 'coming', tagLabel: 'COMING SOON',
      title: 'Project Intelligence',
      desc: 'Advanced project type detection, industry-specific templates and smart requirement classification.',
      features: ['Industry templates', 'Auto project classification', 'Compliance checking', 'Risk assessment'],
    },
  ];

  const consultPills = [
    'Requirements Workshops', 'Process Documentation', 'Agile Coaching',
    'BA Training', 'Legacy System Analysis', 'Stakeholder Mapping',
    'Technical Writing', 'QA Strategy',
  ];

  return (
    <div className="services-page">
      <div className="svc-inner">
        <div className="svc-header">
          <div className="svc-eyebrow"><Zap size={10} />Platform Services</div>
          <h1 className="svc-h1">Everything you need<br />to <em>ship faster</em></h1>
          <p className="svc-sub">
            A full business analysis platform powered by the best free AI models.
            Built for analysts, product managers and founders.
          </p>
        </div>

        <div className="svc-grid">
          {cards.map(({ icon: Icon, iconColor, iconBg, tag, tagLabel, title, featured, desc, features }) => (
            <div key={title} className={`svc-card ${featured ? 'featured' : ''}`}>
              {featured && <div className="svc-card-glow" />}
              <div className="svc-card-icon" style={{ background: iconBg, borderColor: 'var(--b1)' }}>
                <Icon size={17} color={iconColor} />
              </div>
              <div className={`svc-tag ${tag}`}>{tagLabel}</div>
              <div className="svc-card-title">{title}</div>
              <div className="svc-card-desc">{desc}</div>
              <div className="svc-card-features">
                {features.map(f => (
                  <div key={f} className="svc-feat"><div className="svc-feat-dot" />{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="consult-banner">
          <div className="consult-inner">
            <div className="consult-title">Need hands-on <em>consultancy</em>?</div>
            <p className="consult-sub">
              Beyond the platform — strategic business analysis, requirements workshops,
              stakeholder alignment and full BA project delivery.
            </p>
            <div className="consult-pills">
              {consultPills.map(p => <span key={p} className="consult-pill">{p}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}