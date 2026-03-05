import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import RequirementsSection from './components/RequirementsSection';
import StoriesSection from './components/StoriesSection';
import CriteriaSection from './components/CriteriaSection';
import { healthApi, projectApi } from './services/api';
import { Activity, AlertTriangle, Layers, FileText, Users, FlaskConical, Menu, X } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [inputData, setInputData] = useState(null);
  const [reqsData, setReqsData] = useState(null);
  const [storiesData, setStoriesData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { checkHealth(); loadProjects(); }, []);

  // Close sidebar on resize to desktop
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
    { icon: FileText,     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  name: 'Requirements Extraction', desc: 'Auto-generate functional & non-functional requirements from any source.' },
    { icon: Users,        color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    name: 'Agile Story Mapping',      desc: 'Convert requirements into Scrum-ready user stories with priorities.' },
    { icon: FlaskConical, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', name: 'Acceptance Criteria',      desc: 'Generate Gherkin BDD scenarios for every user story.' },
    { icon: Layers,       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  name: 'JIRA Export',              desc: 'Export stories to CSV for one-click JIRA import.' },
  ];

  return (
    <div className="app">
      {/* Mobile overlay */}
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
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="breadcrumb">
              <span className="bc-root">BA Copilot</span>
              {projectName && (<>
                <span className="bc-sep">/</span>
                <span className="bc-page">{projectName}</span>
              </>)}
            </div>
          </div>
          <div className="header-right">
            <div className={`status-pill ${isHealthy ? 'online' : 'offline'}`}>
              <span className="status-dot" />
              {isHealthy ? 'Online' : 'Offline'}
            </div>
          </div>
        </header>

        {!currentProject ? (
          <div className="welcome-wrap">
            <div className="welcome-inner">
              <div className="welcome-glyph"><Activity size={26} /></div>
              <h1 className="welcome-h1">AI-Powered<br /><span>Business Analysis</span></h1>
              <p className="welcome-sub">
                Transform stakeholder inputs into professional requirements,<br />
                user stories and acceptance criteria — in minutes.
              </p>
              <div className="feature-grid">
                {features.map(({ icon: Icon, color, bg, name, desc }) => (
                  <div className="feature-card" key={name}>
                    <div className="feature-icon" style={{ background: bg }}>
                      <Icon size={17} color={color} />
                    </div>
                    <div className="feature-name">{name}</div>
                    <div className="feature-desc">{desc}</div>
                  </div>
                ))}
              </div>
              <p className="welcome-hint">
                <span>← Create or select a project</span> from the sidebar to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="workflow-scroll">
            <div className="workflow-inner">
              <InputSection
                projectId={currentProject.id || currentProject.project_id}
                onComplete={setInputData}
              />
              {inputData && (
                <RequirementsSection
                  inputId={inputData.input_id}
                  onComplete={setReqsData}
                />
              )}
              {reqsData && (
                <StoriesSection
                  requirements={reqsData}
                  onComplete={setStoriesData}
                />
              )}
              {storiesData && (
                <CriteriaSection userStories={storiesData} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
