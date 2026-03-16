import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import ProcessFlowSection from './components/ProcessFlowSection';
import { healthApi, projectApi } from './services/api';
import { Layers, FileText, Users, FlaskConical, Menu, X, ArrowRight, Zap, ChevronRight, GitBranch, ExternalLink } from 'lucide-react';

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
        {/* Abstract network grid background */}
        <svg className="home-net-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(143,1,119,0.12)" strokeWidth="0.8" fill="none">
            <line x1="80" y1="60" x2="240" y2="140"/><line x1="240" y1="140" x2="160" y2="300"/>
            <line x1="160" y1="300" x2="60" y2="250"/><line x1="60" y1="250" x2="80" y2="60"/>
            <line x1="240" y1="140" x2="400" y2="80"/><line x1="400" y1="80" x2="480" y2="220"/>
            <line x1="480" y1="220" x2="340" y2="300"/><line x1="340" y1="300" x2="160" y2="300"/>
            <line x1="400" y1="80" x2="580" y2="50"/><line x1="580" y1="50" x2="660" y2="160"/>
            <line x1="660" y1="160" x2="480" y2="220"/><line x1="580" y1="50" x2="760" y2="100"/>
            <line x1="760" y1="100" x2="660" y2="160"/><line x1="760" y1="100" x2="920" y2="60"/>
            <line x1="920" y1="60" x2="1000" y2="180"/><line x1="1000" y1="180" x2="840" y2="260"/>
            <line x1="840" y1="260" x2="660" y2="160"/><line x1="920" y1="60" x2="1100" y2="120"/>
            <line x1="1100" y1="120" x2="1000" y2="180"/><line x1="1100" y1="120" x2="1260" y2="80"/>
            <line x1="1260" y1="80" x2="1340" y2="200"/><line x1="1340" y1="200" x2="1160" y2="280"/>
            <line x1="1160" y1="280" x2="1000" y2="180"/>
            <line x1="60" y1="250" x2="120" y2="440"/><line x1="120" y1="440" x2="280" y2="400"/>
            <line x1="280" y1="400" x2="340" y2="300"/><line x1="280" y1="400" x2="440" y2="480"/>
            <line x1="440" y1="480" x2="560" y2="380"/><line x1="560" y1="380" x2="480" y2="220"/>
            <line x1="560" y1="380" x2="740" y2="420"/><line x1="740" y1="420" x2="840" y2="260"/>
            <line x1="740" y1="420" x2="880" y2="500"/><line x1="880" y1="500" x2="1020" y2="400"/>
            <line x1="1020" y1="400" x2="1160" y2="280"/><line x1="1020" y1="400" x2="1140" y2="520"/>
            <line x1="1140" y1="520" x2="1340" y2="460"/><line x1="1340" y1="460" x2="1340" y2="200"/>
            <line x1="120" y1="440" x2="200" y2="600"/><line x1="200" y1="600" x2="360" y2="560"/>
            <line x1="360" y1="560" x2="440" y2="480"/><line x1="360" y1="560" x2="520" y2="640"/>
            <line x1="520" y1="640" x2="680" y2="580"/><line x1="680" y1="580" x2="740" y2="420"/>
            <line x1="680" y1="580" x2="840" y2="660"/><line x1="840" y1="660" x2="880" y2="500"/>
            <line x1="840" y1="660" x2="1020" y2="680"/><line x1="1020" y1="680" x2="1140" y2="520"/>
            <line x1="200" y1="600" x2="100" y2="760"/><line x1="520" y1="640" x2="460" y2="780"/>
            <line x1="840" y1="660" x2="920" y2="800"/><line x1="1020" y1="680" x2="1200" y2="760"/>
          </g>
          <g fill="rgba(143,1,119,0.18)">
            <circle cx="80" cy="60" r="2"/><circle cx="240" cy="140" r="2.5"/><circle cx="400" cy="80" r="2"/>
            <circle cx="580" cy="50" r="2.5"/><circle cx="760" cy="100" r="2"/><circle cx="920" cy="60" r="2.5"/>
            <circle cx="1100" cy="120" r="2"/><circle cx="1260" cy="80" r="2.5"/><circle cx="1340" cy="200" r="2"/>
            <circle cx="480" cy="220" r="2.5"/><circle cx="660" cy="160" r="2"/><circle cx="1000" cy="180" r="2.5"/>
            <circle cx="120" cy="440" r="2"/><circle cx="440" cy="480" r="2.5"/><circle cx="740" cy="420" r="2"/>
            <circle cx="880" cy="500" r="2.5"/><circle cx="1140" cy="520" r="2"/><circle cx="200" cy="600" r="2.5"/>
            <circle cx="520" cy="640" r="2"/><circle cx="840" cy="660" r="2.5"/><circle cx="1020" cy="680" r="2"/>
          </g>
          <g fill="rgba(222,26,88,0.25)">
            <circle cx="660" cy="160" r="3.5"/><circle cx="480" cy="220" r="3"/>
            <circle cx="1000" cy="180" r="3.5"/><circle cx="440" cy="480" r="3"/>
            <circle cx="840" cy="660" r="2.5"/><circle cx="240" cy="140" r="3"/>
          </g>
        </svg>
        <div className="wake-banner">
          <span className="wake-dot" />
          <span className="wake-text">
            System may take <strong>30–60 seconds</strong> to wake up on first use — please wait, then refresh if needed.
          </span>
          <button className="wake-close" onClick={e => e.currentTarget.parentElement.style.display='none'}>✕</button>
        </div>
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
            <div className="footer-links-heading">Tools</div>
            <div className="footer-links">
              <a href="https://ai-summarizer-self.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-link">AI Summarizer</a>
            </div>
          </div>
          <div>
            <div className="footer-links-heading">Legal</div>
            <div className="footer-links">
              <a href="https://ai-summarizer-self.vercel.app/privacy" target="_blank" rel="noopener noreferrer" className="footer-link">Privacy Policy</a>
              <a href="https://ai-summarizer-self.vercel.app/terms" target="_blank" rel="noopener noreferrer" className="footer-link">Terms of Service</a>
            </div>
          </div>
          <div className="footer-status-block">
            <div className="footer-status">
              <div className="footer-status-dot" />
              {healthy ? 'All systems operational' : 'Backend offline'}
            </div>
            <div className="footer-legal">© 2026 BA Copilot. All rights reserved.</div>
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
            <div className="breadcrumb" style={{minWidth:0, flex:'0 1 auto'}}>
              <span className="bc-root">workspace</span>
              <span className="bc-sep">/</span>
              <span className="bc-cur">{projectName}</span>
            </div>
          )}
          <div className={`status-pill ${healthy ? 'on' : 'off'}`}>
            <span className="s-dot" />{healthy ? 'system online' : 'system offline'}
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

  const steps = [
    { num:'01', label:'Input',    desc:'Paste text, upload doc or record voice',          color:'#8f9fff' },
    { num:'02', label:'Extract',  desc:'AI extracts functional & non-functional reqs',    color:'#d97dbc' },
    { num:'03', label:'Stories',  desc:'Scrum user stories with story points',            color:'#f47ba0' },
    { num:'04', label:'Criteria', desc:'Gherkin BDD acceptance scenarios',                color:'#F67D31' },
    { num:'05', label:'Flow',     desc:'Auto-generate process flow diagram',              color:'#22c55e' },
  ];

  if (!current) {
    return (
      <div className="workspace-landing">

        {/* ── LEFT panel ── */}
        <div className="wl-left">
          <div className="wl-left-inner">
            <div className="wl-icon"><Zap size={22} color="#fff" fill="#fff" /></div>
            <h2 className="wl-title">BA<br />Workspace</h2>
            <p className="wl-sub">From raw notes to professional requirements, user stories, and process diagrams — in minutes.</p>
            <div className="wl-steps">
              {steps.map(({ num, label, desc, color }) => (
                <div key={num} className="wl-step">
                  <span className="wl-step-num" style={{ background:`${color}18`, color, border:`1px solid ${color}33` }}>{num}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:12, color:'var(--t2)', fontFamily:'Geist,sans-serif' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT panel ── */}
        <div className="wl-right">
          {!showForm ? (
            <>
              <div className="wl-right-header">Your Projects</div>
              <button className="wl-create-btn" onClick={() => setShowForm(true)}>
                <Zap size={16} fill="white" /> New Project
              </button>

              {projects.length > 0 && (
                <>
                  <div className="wl-proj-divider">
                    <div className="wl-proj-divider-line"/>
                    <div className="wl-proj-divider-text">Continue existing</div>
                    <div className="wl-proj-divider-line"/>
                  </div>
                  <div className="wl-proj-list">
                    {projects.map(p => {
                      const id = p.id || p.project_id;
                      const name = p.project_name || p.name;
                      const type = p.project_type || p.type || '';
                      return (
                        <div key={id} className="wl-proj-btn">
                          <button onClick={() => onSelect(p)} style={{
                            flex:1, display:'flex', alignItems:'center', gap:14,
                            padding:'14px 18px', background:'transparent', border:'none',
                            color:'var(--t2)', fontSize:15, fontWeight:500, cursor:'pointer',
                            textAlign:'left', transition:'color 0.14s',
                          }}
                            onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'}
                            onMouseLeave={e=>e.currentTarget.style.color='var(--t2)'}
                          >
                            <span style={{
                              width:36, height:36, borderRadius:10,
                              background:'linear-gradient(135deg,rgba(143,1,119,0.2),rgba(222,26,88,0.15))',
                              border:'1px solid rgba(143,1,119,0.25)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:15, fontWeight:800, color:'#d97dbc', flexShrink:0,
                            }}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            <span style={{flex:1, minWidth:0}}>
                              <span style={{display:'block', fontWeight:600, color:'var(--t1)', fontSize:15}}>{name}</span>
                              {type && <span style={{fontSize:12, color:'var(--t3)', fontFamily:'Geist Mono,monospace'}}>{type}</span>}
                            </span>
                            <ChevronRight size={14} style={{flexShrink:0, opacity:0.5}} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); if(window.confirm(`Delete "${name}"?`)) onDelete(id); }}
                            style={{
                              padding:'14px 16px', background:'transparent', border:'none',
                              borderLeft:'1px solid var(--b1)', color:'var(--t3)',
                              cursor:'pointer', display:'flex', alignItems:'center', transition:'all 0.14s', flexShrink:0,
                            }}
                            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(244,63,94,0.08)'; e.currentTarget.style.color='var(--rose)'; }}
                            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--t3)'; }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {projects.length === 0 && (
                <div style={{
                  textAlign:'center', padding:'48px 24px',
                  color:'var(--t3)', fontSize:14, fontFamily:'Geist,sans-serif', lineHeight:1.7,
                }}>
                  <div style={{fontSize:32, marginBottom:12}}>📋</div>
                  No projects yet.<br/>Create your first one above.
                </div>
              )}
            </>
          ) : (
            <form className="wl-form" onSubmit={submit}>
              <div className="wl-form-header">
                <div className="wl-form-title">New Project</div>
                <button type="button" className="wl-form-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="wl-field">
                <label className="wl-label">Project Name</label>
                <input className="cf-input" placeholder="e.g. Fintech, AuthService, DataPipeline"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
              </div>
              <div className="wl-field">
                <label className="wl-label">Project Type</label>
                <div className="wl-type-grid">
                  {[
                    { v:'Web Application',   hint:'Frontend + backend',  color:'#8F0177',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                    { v:'Mobile App',        hint:'iOS / Android',       color:'#DE1A58',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
                    { v:'API / Backend',     hint:'Services & endpoints', color:'#1A05A2',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
                    { v:'E-Commerce',        hint:'Retail & payments',   color:'#F67D31',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
                    { v:'Data Platform',     hint:'Analytics & pipelines',color:'#22c55e',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                    { v:'Enterprise System', hint:'Internal tooling',    color:'#d97dbc',
                      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
                  ].map(({ v, icon, hint, color }) => (
                    <button key={v} type="button"
                      className={`wl-type-card ${form.type === v ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, type: v })}
                      style={form.type === v ? {'--card-color': color} : {}}>
                      <span className="wl-type-icon" style={{color: form.type===v ? color : 'var(--t2)'}}>{icon}</span>
                      <span className="wl-type-name">{v}</span>
                      <span className="wl-type-hint">{hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="wl-field">
                <label className="wl-label">Industry</label>
                <div className="wl-industry-row">
                  {['Technology','Finance','Healthcare','Retail','Education','Logistics','Other'].map(ind => (
                    <button key={ind} type="button"
                      className={`wl-ind-pill ${form.industry === ind ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, industry: ind })}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="wl-create-btn" style={{marginBottom:0,marginTop:8}}
                disabled={!form.name.trim()}>
                <Zap size={15} fill="white"/> Create Project
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="workflow">
      <div className="workflow-inner">
        <InputSection projectId={current.id || current.project_id} onComplete={(v) => { setInput(v); setReqs(null); setStories(null); }} />
        {input && <RequirementsSection inputId={input.input_id} onComplete={setReqs} onReset={() => { setReqs(null); setStories(null); }} />}
        {reqs && <StoriesSection requirements={reqs} onComplete={setStories} onReset={() => setStories(null)} />}
        {stories && <CriteriaSection userStories={stories} />}
        {stories && <ProcessFlowSection userStories={stories} projectName={current?.project_name || current?.name || 'System'} />}
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
      icon: GitBranch, iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'Process Flow Diagram',
      desc: 'Auto-generate Mermaid.js process flow diagrams from your user stories. Export as SVG.',
      features: ['End-to-end user journey map', 'Decision branch visualisation', 'SVG & code export', 'Fullscreen view'],
    },
  ];

  const toolCards = [
    {
      icon: FileText, iconColor: '#F77F00', iconBg: 'rgba(247,127,0,0.1)',
      tag: 'free', tagLabel: 'FREE',
      title: 'AI Summarizer',
      desc: 'Transform lengthy text, documents, or web articles into concise summaries powered by AI. Supports translation to 7+ languages.',
      features: ['Text, PDF, DOCX & URL input', 'Multiple summary styles & lengths', 'Export as PDF or TXT', 'Translate to 7+ languages'],
      externalLink: 'https://ai-summarizer-self.vercel.app',
    },
  ];

  return (
    <div className="services-page">
      <div className="svc-inner">
        <div className="svc-header">
          <div className="svc-eyebrow"><Zap size={12} />Platform Services</div>
          <h1 className="svc-h1">Everything you need<br />to <em>ship faster</em></h1>
          <p className="svc-sub">
            A full business analysis platform powered by the best free AI models.
            Built for analysts, product managers and founders.
          </p>
        </div>

        <div style={{position:"relative"}}>
        <div className="svc-grid-bg" />
        <div className="svc-grid" style={{position:"relative",zIndex:1}}>
          {cards.map((card) => { const { icon: Icon, iconColor, iconBg, tag, tagLabel, title, featured, desc, features } = card; return (
            <div key={title} className={`svc-card ${featured ? 'featured' : ''} ${tag === 'coming' ? 'coming' : ''}`}>
              {featured && <div className="svc-card-glow" />}
              <div className="svc-card-header-row">
                <div className="svc-card-icon" style={{ background: iconBg, borderColor: 'var(--b1)' }}>
                  <Icon size={22} color={iconColor} />
                </div>
                <div className="svc-card-title-block">
                  <div className="svc-card-title">{title}</div>
                  <div className={`svc-tag ${tag}`}>{tagLabel}</div>
                </div>
              </div>
              <div className="svc-card-desc">{desc}</div>
              <div className="svc-card-features">
                {features.map(f => (
                  <div key={f} className="svc-feat"><div className="svc-feat-dot" style={{ background: iconColor }} />{f}</div>
                ))}
              </div>
              {tag !== 'coming' && (
                card.externalLink ? (
                  <a href={card.externalLink} target="_blank" rel="noopener noreferrer"
                    className="svc-try-btn" style={{'--svc-color': iconColor, textDecoration:'none'}}>
                    Open Tool <ExternalLink size={12} />
                  </a>
                ) : (
                  <button className="svc-try-btn" onClick={onTryIt} style={{'--svc-color': iconColor}}>
                    Try it out <ArrowRight size={12} />
                  </button>
                )
              )}
            </div>
          ); })}
        </div>

        </div>

        {/* ── Other Tools section ── */}
        <div className="svc-tools-section">
          <div className="svc-tools-header">
            <div className="svc-tools-line" />
            <span className="svc-tools-label"><Zap size={11} /> Other Tools</span>
            <div className="svc-tools-line" />
          </div>
          <div className="svc-grid" style={{position:"relative",zIndex:1}}>
            {toolCards.map((card) => { const { icon: Icon, iconColor, iconBg, tag, tagLabel, title, desc, features } = card; return (
              <div key={title} className="svc-card">
                <div className="svc-card-header-row">
                  <div className="svc-card-icon" style={{ background: iconBg, borderColor: 'var(--b1)' }}>
                    <Icon size={22} color={iconColor} />
                  </div>
                  <div className="svc-card-title-block">
                    <div className="svc-card-title">{title}</div>
                    <div className={`svc-tag ${tag}`}>{tagLabel}</div>
                  </div>
                </div>
                <div className="svc-card-desc">{desc}</div>
                <div className="svc-card-features">
                  {features.map(f => (
                    <div key={f} className="svc-feat"><div className="svc-feat-dot" style={{ background: iconColor }} />{f}</div>
                  ))}
                </div>
                {card.externalLink ? (
                  <a href={card.externalLink} target="_blank" rel="noopener noreferrer"
                    className="svc-try-btn" style={{'--svc-color': iconColor, textDecoration:'none'}}>
                    Open Tool <ExternalLink size={12} />
                  </a>
                ) : (
                  <button className="svc-try-btn" onClick={onTryIt} style={{'--svc-color': iconColor}}>
                    Try it out <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ); })}
          </div>
        </div>

        <div className="consult-banner">
          <div className="consult-inner">
            <div className="consult-title">About <em>me</em></div>
            <p className="consult-sub">
              Hey! I'm Vishva — a 25-year-old Business Analyst with nearly 2 years of hands-on experience
              in healthcare and e-commerce. Currently pursuing my Master's degree while building AI-powered
              tools that make BA work less painful. Part analyst, part builder, full-time nerd for clean requirements. ⚡
            </p>
            <div className="consult-pills">
              {['Business Analysis', 'Healthcare', 'E-Commerce', 'Agile & Scrum', 'Master\'s Student', 'AI Enthusiast', 'Requirements Engineering', 'Process Mapping'].map(p => <span key={p} className="consult-pill">{p}</span>)}
            </div>
            <div className="consult-contact">
              <div className="consult-contact-label">Contact me</div>
              <div className="consult-contact-links">
                <a href="mailto:vishvashukla.16@gmail.com" className="consult-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  vishvashukla.16@gmail.com
                </a>
                <a href="https://www.linkedin.com/in/vishva-shukla" target="_blank" rel="noopener noreferrer" className="consult-contact-item consult-linkedin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  linkedin.com/in/vishva-shukla
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}