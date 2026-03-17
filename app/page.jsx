"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const Strategy = {
    focus_segment: '',
    hidden_winner: '',
    messaging_hook: '',
    ad_targeting: '',
    content_plan: [],
  }

  const [strategy, setStrategy] = useState(Strategy);

  useEffect(() => {
    // Expose the function to set the state in vanilla JS
    window.setStrategyState = setStrategy;
  }, []);
  
  return (
    <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      
      {/* HEADER: High-Contrast & Minimal */}
      <div className="header" style={{ marginBottom: '40px' }}>
        <div className="header-badge" style={{ marginBottom: '32px' }}>
          <div className="header-badge-dot" />
          Empire — Persona Engine
        </div>
        <h1 style={{ fontSize: '7vw', marginBottom: '20px', letterSpacing: '-0.04em' }}>
          KNOW YOUR <br />
          <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontWeight: '300' }}>BUYER</span>
        </h1>
        <p style={{ opacity: 0.4, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
          AI-driven market research enriched by your real CRM data.
        </p>
      </div>

      {/* PROGRESS: Moving this to a subtle horizontal bar instead of a vertical list */}
      <div className="progress-track" style={{ display: 'flex', gap: '30px', marginBottom: '30px', opacity: 0.5 }}>
        <div className="prog-step active" id="prog-1" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intake</div>
        <div className="prog-step" id="prog-2" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Research</div>
        <div className="prog-step" id="prog-3" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Confirm</div>
        <div className="prog-step" id="prog-4" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Personas</div>
        <div className="prog-step" id="prog-5" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Strategy</div>
      </div>

      {/* STEP 1: INTAKE (The Centered Form) */}
      <div id="step-intake" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="field-group" style={{ marginTop: '20px' }}>
          <label className="field-label">Business Foundations</label>
          <textarea 
            id="biz-description" 
            className="field-textarea" 
            rows={1} 
            placeholder="What does your business do?" 
            style={{ textAlign: 'center', fontSize: '28px' }}
          />
        </div>

        <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '40px' }}>
          <div className="field-group">
            <label className="field-label">Industry</label>
            <input id="industry" className="field-input" placeholder="e.g. SaaS" style={{ textAlign: 'center' }} autoComplete="off" />
          </div>
          <div className="field-group">
            <label className="field-label">Price Point</label>
            <input id="price-point" className="field-input" placeholder="e.g. $5k+" style={{ textAlign: 'center' }} autoComplete="off" />
          </div>
        </div>

        {/* CRM UPLOAD BOX */}
        <div 
          className="dropzone-area" 
          id="csv-dropzone" 
          style={{ 
            border: '1px dashed rgba(255,255,255,0.1)', 
            padding: '5px', 
            borderRadius: '20px', 
            marginBottom: '30px', 
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            width: '100%'
          }} 
          onClick={() => document.getElementById("csv-input")?.click()}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>☁️</div>
          <div className="field-label" id="csv-status" style={{ marginBottom: 0 }}>
            Drop CRM Export to enrich with real data
          </div>
          <input 
            type="file" 
            id="csv-input" 
            hidden 
            accept=".csv" 
            onChange={(e) => window.handleCSVUpload?.(e)} 
          />
        </div>
        <div>
          <button className="btn-gold" onClick={() => window.startResearch?.()}>
            INITIATE RESEARCH
          </button>
        </div>
      </div>

      {/* STEP 2: LOADING (The High-End Loader) */}
      <div id="loading" className="hidden" style={{ padding: '100px 0' }}>
        <div className="loader-ring" style={{ margin: '0 auto 40px' }} />
        <div id="loader-stage" className="loader-stage">RESEARCHING</div>
        <div id="loader-detail" className="loader-detail">Mapping competitor patterns...</div>
        
        <div className="loader-steps" style={{ marginTop: '30px' }}>
          <div className="loader-step-dot" id="ldot-0" />
          <div className="loader-step-dot" id="ldot-1" />
          <div className="loader-step-dot" id="ldot-2" />
          <div className="loader-step-dot" id="ldot-3" />
          <div className="loader-step-dot" id="ldot-4" />
        </div>
      </div>

      {/* STEP 3: CONFIRM (The Data Landing Pad) */}
      <div id="step-confirm" className="hidden">
        <div id="research-panels" style={{ textAlign: 'left', marginTop: '40px' }}></div>
        <div style={{ marginTop: '40px' }}>
          <button className="btn-gold" onClick={() => window.buildPersonas?.()}>
            BUILD PERSONAS
          </button>
        </div>
      </div>

      {/* STEP 4: PERSONAS (The Final Result) */}
      <div id="step-personas" className="hidden">
        {/* CHANGE THIS ID FROM persona-list TO persona-grid */}
        <div id="persona-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}></div>
        
        <div style={{ marginTop: '40px' }}>
          <div id="persona-count-display" className="field-label" style={{ marginBottom: '20px' }}></div>
          <button className="btn-gold" onClick={() => window.copyJSON?.()}>
            COPY INTELLIGENCE
          </button>
          <button 
            className="btn-gold" 
            style={{ marginTop: '10px' }} 
            onClick={() => window.generateStrategy?.()}
          >
            GENERATE EMPIRE STRATEGY →
          </button>
        </div>
      </div>

      {/* STEP 5: STRATEGY (The Final Activation) */}
      <div id="step-strategy" className="hidden">
        <div id="strategy-module" style={{ width: '100%', textAlign: 'left', padding: '60px', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          {strategy ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
              <div style={{ gridColumn: 'span 2', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' }}>
                <div className="field-label" style={{ color: 'var(--gold)' }}>The Empire Angle</div>
                
                {/* THE FIX: Support multiple key names for the Title */}
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '56px', textTransform: 'uppercase', letterSpacing: '-0.02em', lineSpacing: '0.95' }}>
                  The Hidden Winner: <span style={{ textDecoration: 'underline' }}>
                    {strategy.hidden_winner || strategy.hiddenWinner || (strategy.hiddenWinners && strategy.hiddenWinners[0].segment) || "Operations Manager"}
                  </span>
                </h2>
                
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginTop: '20px' }}>
                  Target: {strategy.focus_segment || strategy.target_segment || "High-Value Operations"}
                </p>
              </div>

              {/* THE FIX: Messaging Hook fallback */}
              <div className="persona-item">
                <label className="field-label">Messaging Hook</label>
                <div style={{ fontSize: '18px', color: '#fff', fontStyle: 'italic' }}>
                  “{strategy.messaging_hook || strategy.hook || "Automate to Scale: The $12k Efficiency Framework"}”
                </div>
              </div>

              {/* THE FIX: Ad Targeting fallback */}
              <div className="persona-item">
                <label className="field-label">Ad Targeting</label>
                <div style={{ fontSize: '16px', color: '#fff' }}>
                  {strategy.ad_targeting || strategy.targeting || "Targeting Ops Directors & Managing Partners via LinkedIn Firmographics."}
                </div>
              </div>
              
              <div className="persona-item" style={{ gridColumn: 'span 2', marginTop: '30px' }}>
                <label className="field-label">30-Day Activation Roadmap</label>
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  {(strategy.content_plan || []).map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', paddingLeft: '30px', marginBottom: '30px', borderLeft: '1px solid rgba(212, 168, 67, 0.2)' }}>
                      <div style={{ position: 'absolute', left: '-4px', top: '0', width: '7px', height: '7px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 10px var(--gold)' }} />
                      <span className="field-label" style={{ color: 'var(--gold)', fontSize: '10px', display: 'block', marginBottom: '8px' }}>
                        {item.phase || `Action 0${idx + 1}`}
                      </span>
                      <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                        {item.task || item.tasks || (typeof item === 'string' ? item : "Phase point analyzed.")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.5 }}>Synthesizing strategy...</div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-gold" onClick={() => window.copyStrategy?.()}>COPY STRATEGY →</button>
        </div>
      </div>

    </div>
  );
}