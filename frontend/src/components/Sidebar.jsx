import React, { useState } from 'react';
import { FolderPlus, Trash2, Briefcase, Home, Layers, BookOpen, ChevronRight } from 'lucide-react';

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

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sb-nav">
        <div className="sb-section-label">Navigation</div>
        <div className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNav('home')}>
          <div className="nav-icon"><Home size={18} /></div>
          <span>Home</span>
        </div>
        <div className={`nav-item ${currentPage === 'services' ? 'active' : ''}`} onClick={() => onNav('services')}>
          <div className="nav-icon"><Layers size={18} /></div>
          <span>Services</span>
        </div>

        <div className="sb-section-label">Your Projects</div>
        {projects.map(p => {
          const id = p.id || p.project_id;
          const active = selected && (selected.id || selected.project_id) === id;
          return (
            <div key={id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => onSelect(p)}>
              <div className="nav-icon"><Briefcase size={16} /></div>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.project_name || p.name}
              </span>
              <button className="proj-del" onClick={e => { e.stopPropagation(); onDelete(id); }}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {!showForm ? (
          <button className="btn-new-proj" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
            <FolderPlus size={14} /> New Project
          </button>
        ) : (
          <form onSubmit={submit} className="create-form">
            <input 
              className="cf-input" 
              placeholder="Project Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              autoFocus
            />
            <div className="cf-row">
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Add</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="sb-footer" style={{ padding: '20px', borderTop: '1px solid var(--b1)' }}>
        <div className="sb-user" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="sb-avatar">VS</div>
          <div>
            <div className="sb-user-name">Vishva Shukla</div>
            <div className="sb-user-role">Enterprise Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}