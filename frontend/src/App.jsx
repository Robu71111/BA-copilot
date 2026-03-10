import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import { healthApi, projectApi } from './services/api';
import { Layers, FileText, Users, FlaskConical, Menu, X, ArrowRight, Zap, ChevronRight } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [healthy, setHealthy] = useState(false);
  const [page, setPage] = useState('home');
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
    { icon: FileText, color: '#8F0177', num: '01', title: 'Requirements Extraction', desc: 'AI extracts functional and non-functional requirements from any source.' },
    { icon: Users, color: '#DE1A58', num: '02', title: 'Agile Story Mapping', desc: 'Scrum-ready user stories with priorities and story points.' },
    { icon: FlaskConical, color: '#1A05A2', num: '03', title: 'Acceptance Criteria', desc: 'Gherkin BDD Given/When/Then scenarios for every story.' },
    { icon: Layers, color: '#F67D31', num: '04', title: 'JIRA Export', desc: 'One-click CSV export for JIRA or download as Markdown.' },
  ];

  const renderPage = () => {
    if (page === 'services') return <ServicesPage onTryIt={() => setPage('workspace')} />;
    if (page === 'workspace') return (
      <WorkspacePage
        current={current} projects={projects}
        onSelect={selectProject} onCreate={createProject} onDelete={deleteProject}
        input={input} setInput={setInput}
        reqs={reqs} setReqs={setReqs}
        stories={stories} setStories={setStories}
      />
    );
    return (
      <div className="home">
        <div className="hero">
          <div className="eyebrow"><div className="eyebrow-dot" />AI-Powered Business Analysis Platform</div>
          <div className="hero-pretitle">Business Analyst Copilot</div>
          <h1 className="hero-h1">Requirements,<br /><em>done right.</em></h1>
          <p className="hero-sub">
            Transform stakeholder inputs — transcripts, docs, voice — into professional
            requirements, user stories and acceptance criteria in minutes.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-hero-primary" onClick={() => setPage('services')}>
              Explore Services <ArrowRight size={14} />
            </button>
            <button className="btn btn-hero-secondary" onClick={() => setPage('workspace')}>
              Open Workspace
            </button>
          </div>
        </div>

        <div className="cap-strip">
          {caps.map(({ icon: Icon, color, num, title, desc }) => (
            <div className="cap" key={num} style={{'--cap-color': color}}>
              <div className="cap-num">{num}</div>
              <div className="cap-icon-wrap"><Icon size={16} color={color} /></div>
              <div className="cap-title">{title}</div>
              <div className="cap-desc">{desc}</div>
            </div>
          ))}
        </div>

        <footer className="home-footer">
          <div className="footer-brand">
            <div className="footer-gem"><Zap size={14} color="#fff" fill="#fff" /></div>
            <div>
              <div className="footer-name">BA <em>Copilot</em></div>
              <div className="footer-copy">AI-powered business analysis platform</div>
            </div>
          </div>
          <div>
            <div className="footer-links-heading">Platform</div>
            <div className="footer-links">
              <button className="footer-link" onClick={() => setPage('home')}>Home</button>
              <button className="footer-link" onClick={() => setPage('services')}>Services</button>
              <button className="footer-link" onClick={() => setPage('workspace')}>Workspace</button>
            </div>
          </div>
          <div>
            <div className="footer-links-heading">Resources</div>
            <div className="footer-links">
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="footer-link">OpenRouter</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            </div>
          </div>
          <div className="footer-status-block">
            <div className="footer-status">
              <div className="footer-status-dot" />
              {healthy ? 'All systems operational' : 'Backend offline'}
            </div>
            <div className="footer-legal">2026 BA Copilot Built with OpenRouter AI</div>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="app">
      <nav className="top-nav">
        <div className="tn-left">
          <button className="mob-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          <div className="tn-logo" onClick={() => setPage('home')}>
            <div className="logo-gem"><Zap size={12} color="#fff" fill="#fff" /></div>
            <span className="tn-brand">BA <em>Copilot</em></span>
          </div>
          <div className="tn-sep" />
          <div className="tn-links">
            {['home','services','workspace'].map(key => (
              <button key={key} className={`tn-link ${page === key ? 'active' : ''}`} onClick={() => setPage(key)}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="tn-right">
          {page === 'workspace' && projectName && (
            <div className="breadcrumb">
              <span className="bc-root">workspace</span>
              <span className="bc-sep">/</span>
              <span className="bc-cur">{projectName}</span>
            </div>
          )}
          <div className={`status-pill ${healthy ? 'on' : 'off'}`}>
            <span className="s-dot" />{healthy ? 'systems nominal' : 'offline'}
          </div>
        </div>
      </nav>

      <div className={`mob-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        projects={projects} selected={current}
        onSelect={selectProject} onCreate={createProject} onDelete={deleteProject}
        isOpen={sidebarOpen} currentPage={page}
        onNav={p => { setPage(p); setSidebarOpen(false); }}
      />

      <div className="main">
        {renderPage()}
      </div>
    </div>
  );
}

function WorkspacePage({ current, projects, onSelect, onCreate, onDelete, input, setInput, reqs, setReqs, stories, setStories }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Web Application', industry: 'Technology' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onCreate(form);
    setForm({ name: '', type: 'Web Application', industry: 'Technology' });
    setShowForm(false);
  };

  if (!current) {
    return (
      <div className="workspace-landing">
        <div className="wl-inner">
          <div className="wl-icon"><Zap size={22} color="#fff" fill="#fff" /></div>
          <h2 className="wl-title">Your Workspace</h2>
          <p className="wl-sub">Create a project to start analysing requirements, generating user stories and acceptance criteria.</p>

          {!showForm ? (
            <button className="btn btn-hero-primary" onClick={() => setShowForm(true)}>
              <Zap size={13} /> Create New Project
            </button>
          ) : (
            <form className="wl-form" onSubmit={submit}>
              <div className="wl-form-title">New Project</div>
              <input className="cf-input" placeholder="Project name (e.g. plentycart)" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
              <select className="f-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Web Application</option>
                <option>Mobile App</option>
                <option>API / Backend</option>
                <option>Data Platform</option>
                <option>E-Commerce</option>
                <option>Enterprise System</option>
                <option>Other</option>
              </select>
              <select className="f-select" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Retail</option>
                <option>Education</option>
                <option>Logistics</option>
                <option>Other</option>
              </select>
              <div className="cf-row" style={{ marginTop: 4 }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Create Project</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {projects.length > 0 && !showForm && (
            <div className="wl-existing">
              <div className="wl-existing-label">Or continue with an existing project</div>
              <div className="wl-proj-list">
                {projects.map(p => {
                  const id = p.id || p.project_id;
                  const name = p.project_name || p.name;
                  return (
                    <button key={id} className="wl-proj-btn" onClick={() => onSelect(p)}>
                      <span>{name}</span><ChevronRight size={12} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="workflow">
      <div className="workflow-inner">
        <InputSection projectId={current.id || current.project_id} onComplete={setInput} />
        {input && <RequirementsSection inputId={input.input_id} onComplete={setReqs} />}
        {reqs && <StoriesSection requirements={reqs} onComplete={setStories} />}
        {stories && <CriteriaSection userStories={stories} />}
      </div>
    </div>
  );
}

function ServicesPage({ onTryIt }) {
  const cards = [
    {
      icon: FileText, iconColor: '#8F0177', iconBg: 'rgba(143,1,119,0.12)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Requirements Analysis', featured: true,
      desc: 'Automatically extract structured requirements from any text input using state-of-the-art AI models.',
      features: ['Functional requirements extraction', 'Non-functional requirements (separate)', 'Multi-format input support', 'Markdown export'],
    },
    {
      icon: Users, iconColor: '#DE1A58', iconBg: 'rgba(222,26,88,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Agile Story Mapping',
      desc: 'Convert requirements into prioritised Scrum user stories complete with story points and dependencies.',
      features: ['As a user I want format', 'Priority classification', 'Story point estimation', 'JIRA CSV export'],
    },
    {
      icon: FlaskConical, iconColor: '#1A05A2', iconBg: 'rgba(26,5,162,0.12)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Acceptance Criteria',
      desc: 'Generate Given/When/Then Gherkin BDD scenarios for every user story automatically.',
      features: ['Gherkin BDD format', 'Multiple scenarios per story', 'Edge case coverage', 'QA-ready output'],
    },
    {
      icon: Layers, iconColor: '#F67D31', iconBg: 'rgba(246,125,49,0.1)',
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
            <div key={title} className={`svc-card ${featured ? 'featured' : ''} ${tag === 'coming' ? 'coming' : ''}`}>
              {featured && <div className="svc-card-glow" />}
              <div className="svc-card-icon" style={{ background: iconBg, borderColor: 'var(--b1)' }}>
                <Icon size={17} color={iconColor} />
              </div>
              <div className={`svc-tag ${tag}`}>{tagLabel}</div>
              <div className="svc-card-title">{title}</div>
              <div className="svc-card-desc">{desc}</div>
              <div className="svc-card-features">
                {features.map(f => (
                  <div key={f} className="svc-feat"><div className="svc-feat-dot" style={{ background: iconColor }} />{f}</div>
                ))}
              </div>
              {tag !== 'coming' && (
                <button className="svc-try-btn" onClick={onTryIt} style={{'--svc-color': iconColor}}>
                  Try it out <ArrowRight size={12} />
                </button>
              )}
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