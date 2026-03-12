import React, { useState } from 'react';
import { FolderPlus, Trash2, Briefcase, Home, Layers, BookOpen } from 'lucide-react';

export default function Sidebar({ projects=[], selected, onSelect, onCreate, onDelete, isOpen, currentPage, onNav }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Web Application', industry: 'Technology' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form);
    setForm({ name: '', type: 'Web Application', industry: 'Technology' });
    setShowForm(false);
  };

  // Only show on mobile (CSS hides on desktop)
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sb-nav">
        {/* Mobile nav links */}
        <div className="sb-section-label">Platform</div>
        <div className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNav('home')}>
          <div className="nav-icon"><Home size={12} /></div>
          <span className="nav-label-text">Home</span>
        </div>
        <div className={`nav-item ${currentPage === 'services' ? 'active' : ''}`} onClick={() => onNav('services')}>
          <div className="nav-icon"><Layers size={12} /></div>
          <span className="nav-label-text">Services</span>
        </div>

        {/* Workspace — prominent CTA */}
        <button
          className={`sb-workspace-btn ${currentPage === 'workspace' ? 'active' : ''}`}
          onClick={() => onNav('workspace')}
        >
          <BookOpen size={13} />
          <span>Workspace</span>
          {currentPage !== 'workspace' && <span className="sb-ws-arrow">→</span>}
        </button>

        <div className="sb-divider" />

        {/* Projects */}
        <div className="sb-section-label">Projects</div>
        <button className="btn-new-proj" onClick={() => setShowForm(v => !v)}>
          <FolderPlus size={12} /> New Project
        </button>

        {showForm && (
          <form className="create-form" onSubmit={submit}>
            <input className="cf-input" placeholder="project-name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
            <div className="cf-row">
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Create</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {projects.map(p => {
          const id = p.id || p.project_id;
          const name = p.project_name || p.name;
          const active = selected && (selected.id || selected.project_id) === id;
          return (
            <div key={id} className={`proj-item ${active ? 'active' : ''}`} onClick={() => onSelect(p)}>
              <div className="proj-ico"><Briefcase size={10} /></div>
              <span className="proj-name">{name}</span>
              <button className="proj-del" onClick={e => { e.stopPropagation(); onDelete(id); }} title="Delete">
                <Trash2 size={10} />
              </button>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--t4)', fontFamily: 'Geist Mono, monospace' }}>
            no projects yet
          </div>
        )}
      </div>

      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">BA</div>
          <div className="sb-user-info">
            <div className="sb-user-name">BA Copilot</div>
            <div className="sb-user-role">User</div>
          </div>
          <div className="sb-plan">FREE</div>
        </div>
      </div>
    </div>
  );
}