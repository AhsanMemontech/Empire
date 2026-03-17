"use client";

export default function Home() {
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
        <div id="persona-list" style={{ textAlign: 'left', marginTop: '40px' }}></div>
        <div style={{ marginTop: '40px' }}>
          <div id="persona-count-display" className="field-label" style={{ marginBottom: '20px' }}></div>
          <button className="btn-gold" onClick={() => window.copyJSON?.()}>
            COPY INTELLIGENCE
          </button>
        </div>
      </div>

    </div>
  );
}