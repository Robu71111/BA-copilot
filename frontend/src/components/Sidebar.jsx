import React, { useState } from 'react';
import { FolderPlus, Trash2, Briefcase, Zap } from 'lucide-react';

const Sidebar = ({ projects = [], selectedProject, onSelectProject, onCreateProject, onDeleteProject, isOpen, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Web Application', industry: 'Technology' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreateProject(form);
    setForm({ name: '', type: 'Web Application', industry: 'Technology' });
    setShowForm(false);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        <span className="logo-text">BA <em>Copilot</em></span>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="sidebar-section-title">Workspace</div>

        <button className="btn-new-project" onClick={() => setShowForm(v => !v)}>
          <FolderPlus size={13} />
          New Project
        </button>

        {showForm && (
          <form className="create-form" onSubmit={handleSubmit}>
            <input
              className="create-form-input"
              placeholder="Project name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required autoFocus
            />
            <select
              className="create-form-input"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option>Web Application</option>
              <option>Mobile App</option>
              <option>E-commerce</option>
              <option>Internal Tool</option>
              <option>API / Integration</option>
            </select>
            <select
              className="create-form-input"
              value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}
            >
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Retail</option>
              <option>Education</option>
            </select>
            <div className="create-form-actions">
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Create</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {projects.length > 0 && (
          <>
            <div className="sidebar-section-title" style={{ marginTop: 14 }}>Projects</div>
            {projects.map(project => {
              const id = project.id || project.project_id;
              const name = project.project_name || project.name;
              const isActive = selectedProject && (selectedProject.id || selectedProject.project_id) === id;
              return (
                <div
                  key={id}
                  className={`project-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectProject(project)}
                >
                  <div className="project-item-icon">
                    <Briefcase size={12} />
                  </div>
                  <span className="project-item-name">{name}</span>
                  <button
                    className="project-item-del"
                    onClick={e => { e.stopPropagation(); onDeleteProject(id); }}
                    title="Delete project"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">BA</div>
          <span className="sidebar-user-label">Business Analyst</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
