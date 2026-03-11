import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, CheckCircle, AlertTriangle, Download, RefreshCw, Maximize2, X } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

// ── Mermaid loader (CDN, no npm needed) ──────────────────────────────────────
function useMermaid() {
  const [ready, setReady] = useState(!!window.mermaid);
  useEffect(() => {
    if (window.mermaid) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    s.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false, theme: 'dark',
        themeVariables: {
          background: '#0c0c1a', primaryColor: '#8F0177',
          primaryTextColor: '#f4f4ff', primaryBorderColor: '#8F0177',
          lineColor: '#5a5a80', secondaryColor: '#1A05A2',
          tertiaryColor: '#0e0e24', edgeLabelBackground: '#14142a',
          clusterBkg: '#0e0e24', titleColor: '#f4f4ff',
          nodeBorder: '#8F0177', mainBkg: '#14142a',
          nodeTextColor: '#f4f4ff',
        },
        flowchart: { curve: 'basis', padding: 20 },
      });
      setReady(true);
    };
    document.head.appendChild(s);
  }, []);
  return ready;
}

// ── Generate diagram via backend AI ─────────────────────────────────────────
async function generateDiagram(stories, projectName) {
  const API = process.env.REACT_APP_API_URL || '';
  const storiesText = stories.map(s =>
    `${s.story_code}: ${s.title} — ${s.user_story}`
  ).join('\n');

  const res = await fetch(`${API}/api/flow/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stories_text: storiesText, project_name: projectName }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.mermaid_code;
}

// ── Render Mermaid into a container ─────────────────────────────────────────
async function renderMermaid(code, container) {
  const id = 'mermaid-' + Date.now();
  const { svg } = await window.mermaid.render(id, code);
  container.innerHTML = svg;
  // Make SVG responsive
  const svgEl = container.querySelector('svg');
  if (svgEl) {
    svgEl.style.width = '100%';
    svgEl.style.height = 'auto';
    svgEl.style.maxWidth = '100%';
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProcessFlowSection({ userStories, projectName = 'System' }) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState('diagram'); // 'diagram' | 'code'
  const diagramRef = useRef(null);
  const fullRef = useRef(null);
  const mermaidReady = useMermaid();
  const stories = userStories?.stories || [];

  // Render whenever code or mermaid becomes ready
  useEffect(() => {
    if (!code || !mermaidReady) return;
    setRenderError(null);
    const target = fullscreen ? fullRef.current : diagramRef.current;
    if (!target) return;
    renderMermaid(code, target).catch(e => {
      setRenderError('Diagram syntax error — try regenerating.');
      console.error('[mermaid]', e);
    });
  }, [code, mermaidReady, fullscreen, view]);

  const generate = async () => {
    setLoading(true); setError(null); setCode(null); setRenderError(null);
    try {
      const mermaidCode = await generateDiagram(stories, projectName);
      setCode(mermaidCode);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    const svg = diagramRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url, download: `${projectName.replace(/\s+/g,'_')}_process_flow.svg`
    }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <LoadingOverlay type="stories" visible={loading} />

      <div className={`card ${code ? 'c-done' : 'c-active'}`}>
        <div className="card-stripe"/>
        <div className="card-body">

          {/* Header */}
          <div className="card-head">
            <div className={`step-badge ${code ? 'sb-green' : 'sb-amber'}`}>
              {code ? <CheckCircle size={15}/> : <GitBranch size={15}/>}
            </div>
            <div className="card-meta">
              <div className="card-title">
                Process Flow Diagram
                <span style={{
                  fontFamily:'Geist Mono,monospace', fontSize:10, fontWeight:700,
                  color:'#F67D31', background:'rgba(246,125,49,0.1)',
                  padding:'2px 8px', borderRadius:4, border:'1px solid rgba(246,125,49,0.25)'
                }}>Mermaid.js</span>
                <span className="step-tag">STEP 05</span>
              </div>
              <div className="card-sub">
                {code
                  ? `End-to-end process map generated from ${stories.length} user stories`
                  : 'Auto-generate a swimlane process flow diagram from your user stories'}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="notice err" style={{marginBottom:16}}>
              <AlertTriangle size={14} style={{flexShrink:0, marginTop:2, color:'var(--rose)'}}/>
              <span style={{fontSize:14, color:'var(--rose)'}}>{error}</span>
            </div>
          )}
          {renderError && (
            <div className="notice err" style={{marginBottom:16}}>
              <AlertTriangle size={14} style={{flexShrink:0, marginTop:2, color:'var(--rose)'}}/>
              <span style={{fontSize:14, color:'var(--rose)'}}>{renderError}</span>
            </div>
          )}

          {/* Generate button */}
          {!code && (
            <button className="btn btn-primary" onClick={generate} disabled={loading}
              style={{fontSize:15, padding:'12px 28px'}}>
              <GitBranch size={14}/> Generate Process Flow →
            </button>
          )}

          {/* Diagram area */}
          {code && (
            <div>
              {/* Toolbar */}
              <div style={{
                display:'flex', alignItems:'center', gap:10, marginBottom:16,
                flexWrap:'wrap',
              }}>
                {/* View toggle */}
                <div style={{
                  display:'flex', gap:2, padding:4,
                  background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:10,
                }}>
                  {[['diagram','Diagram'],['code','Mermaid Code']].map(([v,label]) => (
                    <button key={v} onClick={() => setView(v)} style={{
                      padding:'6px 14px', borderRadius:7, border:'none', cursor:'pointer',
                      fontSize:13, fontWeight:600, fontFamily:'Geist,sans-serif',
                      background: view===v ? 'var(--s4)' : 'transparent',
                      color: view===v ? 'var(--t1)' : 'var(--t2)',
                      transition:'all 0.14s',
                    }}>{label}</button>
                  ))}
                </div>

                <div style={{marginLeft:'auto', display:'flex', gap:8}}>
                  <button className="btn btn-secondary btn-sm" onClick={generate}>
                    <RefreshCw size={12}/> Regenerate
                  </button>
                  {view === 'diagram' && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={downloadSvg}>
                        <Download size={12}/> SVG
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setFullscreen(true)}>
                        <Maximize2 size={12}/> Fullscreen
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Diagram view */}
              {view === 'diagram' && (
                <div style={{
                  background:'var(--s2)', border:'1px solid var(--b1)',
                  borderRadius:16, padding:'24px', overflow:'auto',
                  minHeight:320,
                }}>
                  <div ref={diagramRef}/>
                  {!mermaidReady && (
                    <div style={{
                      textAlign:'center', padding:'60px 0',
                      color:'var(--t2)', fontSize:14, fontFamily:'Geist Mono,monospace',
                    }}>
                      Loading diagram renderer…
                    </div>
                  )}
                </div>
              )}

              {/* Code view */}
              {view === 'code' && (
                <div style={{
                  background:'var(--s2)', border:'1px solid var(--b1)',
                  borderRadius:16, padding:'20px', overflow:'auto',
                  maxHeight:420,
                }}>
                  <pre style={{
                    margin:0, fontSize:13, lineHeight:1.8,
                    color:'#d97dbc', fontFamily:'Geist Mono,monospace',
                    whiteSpace:'pre-wrap', wordBreak:'break-word',
                  }}>{code}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div style={{
          position:'fixed', inset:0, zIndex:9998,
          background:'rgba(6,6,16,0.96)',
          backdropFilter:'blur(20px)',
          display:'flex', flexDirection:'column',
          padding:'24px',
        }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginBottom:20, flexShrink:0,
          }}>
            <div style={{fontSize:18, fontWeight:800, color:'var(--t1)', letterSpacing:'-0.5px'}}>
              {projectName} — Process Flow
            </div>
            <div style={{display:'flex', gap:10}}>
              <button className="btn btn-secondary btn-sm" onClick={downloadSvg}>
                <Download size={12}/> Download SVG
              </button>
              <button onClick={() => setFullscreen(false)} style={{
                background:'var(--s2)', border:'1px solid var(--b1)',
                color:'var(--t2)', borderRadius:8, padding:'7px 10px',
                cursor:'pointer', display:'flex', alignItems:'center',
              }}>
                <X size={16}/>
              </button>
            </div>
          </div>
          <div style={{
            flex:1, overflow:'auto',
            background:'var(--s1)', border:'1px solid var(--b1)',
            borderRadius:16, padding:'32px',
          }}>
            <div ref={fullRef}/>
          </div>
        </div>
      )}
    </>
  );
}
