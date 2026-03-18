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
  const [personas, setPersonaState] = useState([]);

  useEffect(() => {
    // Expose setters to vanilla JS
    window.setStrategyState = setStrategy;
    window.setPersonaState = setPersonaState;
  }, []);
  
  return (
    <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      
      {/* HEADER: Apple Minimalist */}
      <div className="header" style={{ marginBottom: '40px' }}>
        <div className="header-badge" style={{ 
          marginBottom: '24px', 
          fontSize: '12px', 
          fontWeight: '600', 
          letterSpacing: '0.1em', 
          color: 'var(--muted)',
          textTransform: 'uppercase' 
        }}>
          Empire — Persona Engine
        </div>
        <h1 style={{ 
          fontSize: '64px', 
          fontWeight: '700', 
          marginBottom: '20px', 
          letterSpacing: '-0.03em', 
          lineHeight: '1.1',
          color: 'var(--text)' 
        }}>
          Know your <br />
          <span style={{ color: 'var(--gold)' }}>Buyer.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '21px', maxWidth: '540px', margin: '0 auto', lineHeight: '1.4' }}>
          AI-driven market research enriched by your real CRM data.
        </p>
      </div>

      {/* PROGRESS TRACK: iOS style */}
      <div className="progress-track" style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        {['Intake', 'Research', 'Confirm', 'Personas', 'Strategy'].map((step, i) => (
          <div key={i} id={`prog-${i+1}`} className={`prog-step ${i === 0 ? 'active' : ''}`} style={{ 
            fontSize: '13px', 
            fontWeight: '500', 
            color: 'var(--muted)',
            transition: 'all 0.3s ease'
          }}>
            {step}
          </div>
        ))}
      </div>

      {/* STEP 1: INTAKE */}
      <div id="step-intake" style={{ width: '100%', maxWidth: '640px' }}>
        <div className="field-group" style={{ marginBottom: '40px' }}>
          <label className="field-label">Business Foundations</label>
          <textarea 
            id="biz-description" 
            className="field-textarea" 
            rows={2} 
            placeholder="What does your business do?" 
            style={{ textAlign: 'center', fontSize: '24px', background: 'var(--bg-subtle)', borderRadius: '18px', border: 'none', padding: '20px', marginTop: '5px' }}
          />
        </div>

        <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="field-group">
            <label className="field-label">Industry</label>
            <input id="industry" className="field-input" placeholder="e.g. SaaS" style={{ textAlign: 'center', background: 'var(--bg-subtle)', marginTop: '5px' }} />
          </div>
          <div className="field-group">
            <label className="field-label">Price Point</label>
            <input id="price-point" className="field-input" placeholder="e.g. $5k+" style={{ textAlign: 'center', background: 'var(--bg-subtle)', marginTop: '5px' }} />
          </div>
        </div>

        {/* CRM UPLOAD: Cupertino Well style */}
        <div 
          className="dropzone-area" 
          id="csv-dropzone" 
          style={{ 
            background: 'var(--bg-subtle)',
            padding: '10px', 
            borderRadius: '20px', 
            marginBottom: '40px', 
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }} 
          onClick={() => document.getElementById("csv-input")?.click()}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
          <div className="field-label" id="csv-status" style={{ marginBottom: 0, textTransform: 'none', letterSpacing: '0', fontSize: '15px' }}>
            Click to upload CRM Export (.csv)
          </div>
          <input type="file" id="csv-input" hidden accept=".csv" onChange={(e) => window.handleCSVUpload?.(e)} />
        </div>

        <button className="btn-gold" style={{ width: '100%', padding: '20px' }} onClick={() => window.startResearch?.()}>
          Initiate Research
        </button>
      </div>

      {/* STEP 2: LOADING */}
      <div id="loading" className="hidden" style={{ padding: '100px 0' }}>
        <div className="loader-ring" style={{ width: '40px', height: '40px', border: '3px solid var(--bg-subtle)', borderTopColor: 'var(--gold)', margin: '0 auto 24px' }} />
        <div id="loader-stage" style={{ fontWeight: '600', color: 'var(--text)' }}>RESEARCHING</div>
        <div id="loader-detail" style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>Mapping patterns...</div>
      </div>

      {/* STEP 3: CONFIRM */}
      <div id="step-confirm" className="hidden" style={{ width: '100%' }}>
        <div id="research-panels"></div>
        <button className="btn-gold" onClick={() => window.buildPersonas?.()}>Build Personas</button>
      </div>

      {/* STEP 4: PERSONAS */}
      <div id="step-personas" className="hidden" style={{ width: '100%' }}>
        <div id="persona-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}></div>
        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-gold" style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }} onClick={() => window.copyJSON?.()}>Copy JSON</button>
          <button className="btn-gold" onClick={() => window.generateStrategy?.()}>Generate Empire Strategy →</button>
        </div>
      </div>

      {/* STEP 5: STRATEGY (Cupertino Card) */}
      <div id="step-strategy" className="hidden" style={{ width: '100%' }}>
        <div id="strategy-module" style={{ 
          textAlign: 'left', 
          padding: '50px', 
          borderRadius: '28px', 
          background: '#fff', 
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)'
        }}>
          {strategy ? (
            <div>
              <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
                <div className="field-label" style={{ color: 'var(--gold)' }}>The Empire Angle</div>
                <h2 style={{ fontSize: '48px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  {strategy.hidden_winner || strategy.hiddenWinner || "Operations Manager"}
                </h2>
                <p style={{ fontSize: '19px', color: 'var(--muted)', marginTop: '12px' }}>
                  Target Segment: {strategy.focus_segment || "High-Value Operations"}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                  <label className="field-label">Messaging Hook</label>
                  <div style={{ fontSize: '18px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.4' }}>
                    “{strategy.messaging_hook || strategy.hook || "Automate to Scale"}”
                  </div>
                </div>
                <div>
                  <label className="field-label">Ad Targeting</label>
                  <div style={{ fontSize: '16px', color: 'var(--muted)' }}>
                    {strategy.ad_targeting || "LinkedIn Firmographics targeting Ops Directors."}
                  </div>
                </div>
                
                <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                  <label className="field-label">30-Day Activation Roadmap</label>
                  <div style={{ marginTop: '24px' }}>
                    {(strategy.content_plan || []).map((item, idx) => (
                      <div key={idx} className="strategy-step" style={{ borderLeft: '2px solid var(--bg-subtle)', paddingLeft: '24px', marginBottom: '24px' }}>
                        <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '40px' }}>
                          {item.phase || `Phase 0${idx + 1}`}
                        </span>
                        <div style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.5' }}>
                          {item.task || item.tasks || "Analyzing point..."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <button className="btn-gold" style={{ marginTop: '40px' }} onClick={() => window.copyStrategy?.()}>Copy Activation Plan</button>
      </div>
    </div>
  );
}