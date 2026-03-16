import React, { useEffect, useState } from 'react';

const STEPS = {
  input: [
    { label: 'Receiving input', detail: 'Parsing your text or document...' },
    { label: 'Preprocessing', detail: 'Cleaning and structuring content...' },
    { label: 'Saving to project', detail: 'Storing input data securely...' },
    { label: 'Ready', detail: 'Input captured successfully!' },
  ],
  requirements: [
    { label: 'Connecting to AI', detail: 'Selecting best available model...' },
    { label: 'Analysing content', detail: 'Reading and understanding your input...' },
    { label: 'Extracting functional requirements', detail: 'Identifying features and behaviours...' },
    { label: 'Extracting non-functional requirements', detail: 'Identifying quality attributes...' },
    { label: 'Structuring output', detail: 'Formatting FR and NFR lists...' },
    { label: 'Finalising', detail: 'Validating and deduplicating requirements...' },
  ],
  stories: [
    { label: 'Connecting to AI', detail: 'Selecting best available model...' },
    { label: 'Reading requirements', detail: 'Processing your extracted requirements...' },
    { label: 'Mapping user journeys', detail: 'Creating As a / I want / So that stories...' },
    { label: 'Assigning priorities', detail: 'Classifying High / Medium / Low...' },
    { label: 'Estimating story points', detail: 'Fibonacci sizing: 1, 2, 3, 5, 8, 13...' },
    { label: 'Finalising', detail: 'Formatting Scrum-ready output...' },
  ],
  criteria: [
    { label: 'Connecting to AI', detail: 'Selecting best available model...' },
    { label: 'Analysing user story', detail: 'Understanding context and requirements...' },
    { label: 'Writing happy path', detail: 'Generating successful scenario...' },
    { label: 'Writing edge cases', detail: 'Generating error and boundary scenarios...' },
    { label: 'Formatting Gherkin', detail: 'Given / When / Then structure...' },
    { label: 'Finalising', detail: 'Validating BDD scenarios...' },
  ],
  flow: [
    { label: 'Connecting to AI', detail: 'Selecting best available model...' },
    { label: 'Analysing user stories', detail: 'Mapping story dependencies...' },
    { label: 'Building process map', detail: 'Creating nodes and decision branches...' },
    { label: 'Generating Mermaid syntax', detail: 'Writing flowchart TD diagram code...' },
    { label: 'Validating diagram', detail: 'Checking node connections...' },
    { label: 'Finalising', detail: 'Preparing diagram for rendering...' },
  ],
};

const ICONS = {
  requirements: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  stories: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  criteria: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  input: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  flow: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M18 9a9 9 0 01-9 9"/>
    </svg>
  ),
};

const TITLES = {
  requirements: 'Extracting Requirements',
  stories: 'Generating User Stories',
  criteria: 'Generating Acceptance Criteria',
  input: 'Processing Input',
  flow: 'Generating Process Flow',
};

const COLORS = {
  requirements: { from: '#8F0177', to: '#DE1A58' },
  stories:      { from: '#1A05A2', to: '#8F0177' },
  criteria:     { from: '#DE1A58', to: '#F67D31' },
  input:        { from: '#1A05A2', to: '#DE1A58' },
  flow:         { from: '#22c55e', to: '#1A05A2' },
};

export default function LoadingOverlay({ type = 'requirements', visible }) {
  const steps = STEPS[type] || STEPS.requirements;
  const color = COLORS[type] || COLORS.requirements;
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible) { setCurrentStep(0); setElapsed(0); return; }

    const stepInterval = Math.floor(50000 / steps.length);
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }, stepInterval);

    const dotsTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);

    const elapsedTimer = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(dotsTimer);
      clearInterval(elapsedTimer);
    };
  }, [visible, steps.length]);

  if (!visible) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6,6,16,0.92)',
      backdropFilter: 'blur(20px)',
      animation: 'fadeIn 0.25s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.92)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes floatUp { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes orbitA { 0%{transform:rotate(0deg) translateX(52px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(52px) rotate(-360deg)} }
        @keyframes orbitB { 0%{transform:rotate(120deg) translateX(52px) rotate(-120deg)} 100%{transform:rotate(480deg) translateX(52px) rotate(-480deg)} }
        @keyframes orbitC { 0%{transform:rotate(240deg) translateX(52px) rotate(-240deg)} 100%{transform:rotate(600deg) translateX(52px) rotate(-600deg)} }
      `}</style>

      <div style={{
        position:'absolute', width:500, height:500, borderRadius:'50%',
        background:`radial-gradient(circle, ${color.from}22 0%, transparent 70%)`,
        top:'10%', left:'20%', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(circle, ${color.to}18 0%, transparent 70%)`,
        bottom:'15%', right:'15%', pointerEvents:'none',
      }}/>

      <div style={{
        background: 'rgba(12,12,26,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px 44px',
        width: '100%', maxWidth: 480,
        margin: '0 16px',
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${color.from}18`,
        animation: 'floatUp 0.3s ease',
      }}>

        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', borderRadius:24, overflow:'hidden',
          backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
        }}/>

        <div style={{
          position:'absolute', top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent 0%, ${color.from} 30%, ${color.to} 70%, transparent 100%)`,
          borderRadius:'24px 24px 0 0',
        }}/>

        <div style={{position:'relative', width:100, height:100, margin:'0 auto 28px', flexShrink:0}}>
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:56, height:56, borderRadius:16,
            background:`linear-gradient(135deg, ${color.from}, ${color.to})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white',
            boxShadow:`0 0 30px ${color.from}60, 0 0 60px ${color.from}20`,
            animation:'pulse 2s ease infinite',
          }}>
            {ICONS[type] || ICONS.requirements}
          </div>
          {[{ anim:'orbitA', size:6, color:color.from },
            { anim:'orbitB', size:5, color:color.to },
            { anim:'orbitC', size:4, color:'#F67D31' }
          ].map((o,i) => (
            <div key={i} style={{
              position:'absolute', top:'50%', left:'50%', marginTop:-o.size/2, marginLeft:-o.size/2,
              width:o.size, height:o.size, borderRadius:'50%',
              background:o.color, boxShadow:`0 0 8px ${o.color}`,
              animation:`${o.anim} ${2.4 + i*0.4}s linear infinite`,
            }}/>
          ))}
        </div>

        <div style={{textAlign:'center', marginBottom:8}}>
          <div style={{
            fontSize:20, fontWeight:800, color:'#f4f4ff',
            letterSpacing:'-0.5px', fontFamily:'Geist,sans-serif',
          }}>
            {TITLES[type] || TITLES.requirements}{dots}
          </div>
          <div style={{
            fontSize:13, color:'rgba(180,180,215,0.9)',
            fontFamily:'Geist Mono,monospace', marginTop:6,
          }}>
            {elapsed}s elapsed — this can take up to 120s for large inputs
          </div>
        </div>

        <div style={{
          height:4, background:'rgba(255,255,255,0.06)',
          borderRadius:4, overflow:'hidden', margin:'24px 0 20px', position:'relative',
        }}>
          <div style={{
            height:'100%', borderRadius:4,
            width:`${progress}%`,
            background:`linear-gradient(90deg, ${color.from}, ${color.to})`,
            transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', top:0, bottom:0, width:'60%',
              background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation:'shimmer 1.6s ease infinite',
            }}/>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const pending = i > currentStep;
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                opacity: pending ? 0.3 : 1,
                transition:'opacity 0.4s ease',
                animation: active ? 'floatUp 0.3s ease' : 'none',
              }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: done
                    ? 'rgba(34,197,94,0.15)'
                    : active
                    ? `linear-gradient(135deg, ${color.from}, ${color.to})`
                    : 'rgba(255,255,255,0.04)',
                  border: done
                    ? '1px solid rgba(34,197,94,0.3)'
                    : active
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: active ? `0 0 14px ${color.from}60` : 'none',
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : active ? (
                    <div style={{
                      width:6, height:6, borderRadius:'50%', background:'white',
                      animation:'pulse 1s ease infinite',
                    }}/>
                  ) : (
                    <div style={{width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.2)'}}/>
                  )}
                </div>

                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontSize:13, fontWeight: active ? 700 : 500,
                    color: done ? '#22c55e' : active ? '#f4f4ff' : 'rgba(180,180,215,0.9)',
                    fontFamily:'Geist,sans-serif',
                    transition:'color 0.3s',
                  }}>
                    {step.label}
                  </div>
                  {active && (
                    <div style={{
                      fontSize:13, color:'rgba(180,180,215,0.85)',
                      fontFamily:'Geist Mono,monospace', marginTop:2,
                      animation:'floatUp 0.2s ease',
                    }}>
                      {step.detail}
                    </div>
                  )}
                </div>

                {active && (
                  <div style={{
                    width:16, height:16, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${color.from}`,
                    borderTopColor:'transparent',
                    animation:'spin 0.8s linear infinite',
                  }}/>
                )}
                {done && (
                  <div style={{
                    fontSize:14, fontFamily:'Geist Mono,monospace',
                    color:'rgba(34,197,94,0.5)', flexShrink:0,
                  }}>
                    done
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop:24, paddingTop:18,
          borderTop:'1px solid rgba(255,255,255,0.05)',
          textAlign:'center',
          fontSize:14, color:'rgba(160,160,200,0.9)',
          fontFamily:'Geist Mono,monospace',
        }}>
          Powered by Artificial Intelligence
        </div>
      </div>
    </div>
  );
}