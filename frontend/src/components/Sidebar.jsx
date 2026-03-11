import React, { useState } from 'react';
import { FolderPlus, Trash2, Briefcase, Home, Layers } from 'lucide-react';

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
          <form onSubmit={submit} className="create-form" style={{ padding: '0 14px' }}>
            <input 
              className="cf-input" 
              placeholder="Project Name" 
              style={{ width: '100%', padding: '8px', background: 'var(--s2)', border: '1px solid var(--b2)', borderRadius: '4px', color: 'white', marginBottom: '8px' }}
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '4px' }}>Add</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '4px' }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="sb-footer" style={{ padding: '20px', borderTop: '1px solid var(--b1)' }}>
        <div className="sb-user" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="sb-avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--p1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>BA</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>BA Copilot</div>
            <div style={{ fontSize: '10px', color: 'var(--t3)' }}>User</div>
          </div>
        </div>
      </div>
    </div>
  );
}