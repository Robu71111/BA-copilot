import React, { useState } from 'react';
import { FolderPlus, Trash2, Briefcase, Zap } from 'lucide-react';

export default function Sidebar({ projects=[], selected, onSelect, onCreate, onDelete, isOpen }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', type:'Web Application', industry:'Technology' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form);
    setForm({ name:'', type:'Web Application', industry:'Technology' });
    setShowForm(false);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark"><Zap size={13} color="#fff" fill="#fff" /></div>
        <span className="logo-text">BA <em>Copilot</em></span>
      </div>

      <div className="sidebar-nav">
        <div className="nav-label">Workspace</div>
        <button className="btn-new" onClick={() => setShowForm(v=>!v)}>
          <FolderPlus size={12} /> New Project
        </button>

        {showForm && (
          <form className="create-form" onSubmit={submit} style={{marginTop:8}}>
            <input className="create-input" placeholder="project-name" value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})} required autoFocus />
            <select className="create-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option>Web Application</option><option>Mobile App</option>
              <option>E-commerce</option><option>Internal Tool</option><option>API / Integration</option>
            </select>
            <select className="create-input" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})}>
              <option>Technology</option><option>Finance</option>
              <option>Healthcare</option><option>Retail</option><option>Education</option>
            </select>
            <div className="form-row">
              <button type="submit" className="btn btn-primary btn-sm" style={{flex:1}}>Create</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {projects.length > 0 && <>
          <div className="nav-label" style={{marginTop:16}}>Projects</div>
          {projects.map(p => {
            const id = p.id || p.project_id;
            const name = p.project_name || p.name;
            const active = selected && (selected.id || selected.project_id) === id;
            return (
              <div key={id} className={`project-item ${active?'active':''}`} onClick={()=>onSelect(p)}>
                <div className="proj-icon"><Briefcase size={10}/></div>
                <span className="proj-name">{name}</span>
                <button className="proj-del" onClick={e=>{e.stopPropagation();onDelete(id)}} title="Delete">
                  <Trash2 size={10}/>
                </button>
              </div>
            );
          })}
        </>}
      </div>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">BA</div>
          <span className="user-label">Business Analyst</span>
        </div>
      </div>
    </div>
  );
}