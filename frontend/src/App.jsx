import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import { healthApi, projectApi } from './services/api';
import { Layers, FileText, Users, FlaskConical, Menu, X } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [inputData, setInputData] = useState(null);
  const [reqsData, setReqsData] = useState(null);
  const [storiesData, setStoriesData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { checkHealth(); loadProjects(); }, []);
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 900) setSidebarOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const checkHealth = async () => {
    try { const r = await healthApi.check(); setIsHealthy(r.status === 'healthy'); }
    catch { setIsHealthy(false); }
  };
  const loadProjects = async () => {
    try { const r = await projectApi.getAll(); setProjects(r || []); }
    catch (e) { console.error('Load failed', e); }
  };
  const handleProjectCreate = async (data) => {
    const p = await projectApi.create(data);
    setProjects(prev => [...prev, p]);
    handleSelectProject(p);
    setSidebarOpen(false);
  };
  const handleSelectProject = (project) => {
    setCurrentProject(project);
    setInputData(null); setReqsData(null); setStoriesData(null);
    setSidebarOpen(false);
  };
  const handleDeleteProject = async (id) => {
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(p => (p.id || p.project_id) !== id));
      if (currentProject && (currentProject.id || currentProject.project_id) === id) {
        setCurrentProject(null);
        setInputData(null); setReqsData(null); setStoriesData(null);
      }
    } catch (e) { console.error('Delete failed', e); }
  };

  const projectName = currentProject?.project_name || currentProject?.name;

  const features = [
    { icon: FileText,     color: '#818cf8', bg: 'rgba(99,102,241,0.15)',   name: 'Requirements Extraction', desc: 'AI extracts functional & non-functional requirements from any source.', num: '01' },
    { icon: Users,        color: '#10b981', bg: 'rgba(16,185,129,0.12)',   name: 'Agile Story Mapping',     desc: 'Scrum-ready user stories with priorities and story points.', num: '02' },
    { icon: FlaskConical, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', name: 'Acceptance Criteria',     desc: 'Gherkin BDD scenarios for every user story automatically.', num: '03' },
    { icon: Layers,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  name: 'JIRA Export',             desc: 'Export to CSV for one-click JIRA import or Markdown.', num: '04' },
  ];

  return (
    <div className="app">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        projects={projects}
        selectedProject={currentProject}
        onSelectProject={handleSelectProject}
        onCreateProject={handleProjectCreate}
        onDeleteProject={handleDeleteProject}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="breadcrumb">
              <span className="bc-root">ba-copilot</span>
              {projectName && (<><span className="bc-sep">/</span><span className="bc-page">{projectName}</span></>)}
            </div>
          </div>
          <div className="header-right">
            <div className={`status-pill ${isHealthy ? 'online' : 'offline'}`}>
              <span className="status-dot" />
              {isHealthy ? 'systems nominal' : 'offline'}
            </div>
          </div>
        </header>

        {!currentProject ? (
          <div className="welcome-wrap">
            <div className="welcome-inner">
              <div className="welcome-badge">
                <div className="welcome-badge-dot" />
                AI-Powered · Free Tier · OpenRouter
              </div>
              <h1 className="welcome-h1">
                Business Analysis<br />
                <span className="grad">Reimagined.</span>
              </h1>
              <p className="welcome-sub">
                Transform stakeholder inputs into professional requirements,<br />
                user stories and acceptance criteria — in minutes, not days.
              </p>
              <div className="feature-grid">
                {features.map(({ icon: Icon, color, bg, name, desc, num }) => (
                  <div className="feature-card" key={name}>
                    <span className="feature-num">{num}</span>
                    <div className="feature-icon-wrap" style={{ background: bg }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div className="feature-name">{name}</div>
                    <div className="feature-desc">{desc}</div>
                  </div>
                ))}
              </div>
              <p className="welcome-hint">
                <span>← select a project</span> or create new to begin
              </p>
            </div>
          </div>
        ) : (
          <div className="workflow-scroll">
            <div className="workflow-inner">
              <InputSection projectId={currentProject.id || currentProject.project_id} onComplete={setInputData} />
              {inputData && <RequirementsSection inputId={inputData.input_id} onComplete={setReqsData} />}
              {reqsData && <StoriesSection requirements={reqsData} onComplete={setStoriesData} />}
              {storiesData && <CriteriaSection userStories={storiesData} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;