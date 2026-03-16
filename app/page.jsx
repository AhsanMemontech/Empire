"use client";

export default function Home() {
  return (
    <div className="wrap">
      {/* HEADER */}
      <div className="header">
        <div className="header-badge">
          <div className="header-badge-dot" />
          Empire of Ideas — Persona Engine
        </div>
        <h1>
          KNOW YOUR
          <br />
          <span>BUYER</span>
        </h1>
        <p>
          AI-driven market research enriched by your real CRM data. Build, validate, and activate buyer personas in
          minutes.
        </p>
      </div>

      {/* PROGRESS */}
      <div className="progress-track" id="progress-track">
        <div className="prog-step active" id="prog-1">
          <div className="prog-num">1</div>
          <div className="prog-label">Intake</div>
        </div>
        <div className="prog-line" id="prog-line-1" />
        <div className="prog-step" id="prog-2">
          <div className="prog-num">2</div>
          <div className="prog-label">Research</div>
        </div>
        <div className="prog-line" id="prog-line-2" />
        <div className="prog-step" id="prog-3">
          <div className="prog-num">3</div>
          <div className="prog-label">Confirm</div>
        </div>
        <div className="prog-line" id="prog-line-3" />
        <div className="prog-step" id="prog-4">
          <div className="prog-num">4</div>
          <div className="prog-label">Personas</div>
        </div>
      </div>

      {/* STEP 1: INTAKE */}
      <div id="step-intake">
        {/* API & CRM */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🔑</div>
            <div>
              <div className="card-title">Engine Connectivity</div>
              <div className="card-subtitle">Setup AI access and data sources</div>
            </div>
          </div>
          <div className="card-body">
            <div className="field-group">
              <div className="field-label">CRM Enrichment (Optional)</div>
              <div className="field-hint">
                Upload a GHL or CRM export (CSV) to find &quot;Hidden Winners&quot; and validate your hypothesis.
              </div>
              <div
                className="dropzone-area"
                id="csv-dropzone"
                onClick={() => {
                  const input = document.getElementById("csv-input");
                  if (input) input.click();
                }}
              >
                <span id="csv-status">Drop CRM Export here to enrich with real data</span>
                <input
                  type="file"
                  id="csv-input"
                  hidden
                  accept=".csv"
                  onChange={(e) => {
                    if (window.handleCSVUpload) {
                      window.handleCSVUpload(e);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BUSINESS */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🏢</div>
            <div className="card-title">Business Foundations</div>
          </div>
          <div className="card-body">
            <div className="field-group">
              <div className="field-label">What does your business do?</div>
              <textarea
                className="field-textarea"
                id="biz-description"
                rows={3}
                placeholder="e.g. We help restaurant owners automate their social media..."
              />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <div className="field-label">Industry</div>
                <input className="field-input" id="industry" placeholder="SaaS, E-commerce, etc." />
              </div>
              <div className="field-group">
                <div className="field-label">Price Point</div>
                <input className="field-input" id="price-point" placeholder="e.g. $99/mo" />
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Your Buyer Hypothesis</div>
              <textarea
                className="field-textarea"
                id="buyer-hypothesis"
                rows={2}
                placeholder="Who do you THINK your current buyer is? AI will test this."
              />
            </div>
          </div>
        </div>

        {/* MARKET CONTEXT */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🎯</div>
            <div className="card-title">Market Context</div>
          </div>
          <div className="card-body">
            <div className="field-group">
              <div className="field-label">Geography</div>
              <div className="chip-group" id="geo-chips">
                <div
                  className="chip selected"
                  onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "geo")}
                >
                  Global
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "geo")}>
                  United States
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "geo")}>
                  UK / Europe
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "geo")}>
                  Australia / NZ
                </div>
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Customer Type</div>
              <div className="chip-group" id="ctype-chips">
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "ctype")}>
                  B2B
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "ctype")}>
                  B2C
                </div>
                <div
                  className="chip selected"
                  onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "ctype")}
                >
                  Both
                </div>
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Persona Count</div>
              <div className="chip-group" id="count-chips">
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "count")}>
                  2
                </div>
                <div
                  className="chip selected"
                  onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "count")}
                >
                  3
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "count")}>
                  4
                </div>
                <div className="chip" onClick={(e) => window.toggleChip && window.toggleChip(e.currentTarget, "count")}>
                  5
                </div>
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Known Competitors</div>
              <input className="field-input" id="competitors" placeholder="e.g. Hootsuite, Buffer" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-gold"
            onClick={() => {
              if (window.startResearch) window.startResearch();
            }}
          >
            Research &amp; Enrich Market →
          </button>
        </div>
      </div>

      {/* LOADING */}
      <div id="loading">
        <div className="loader-ring" />
        <div className="loader-stage" id="loader-stage">
          RESEARCHING
        </div>
        <div className="loader-detail" id="loader-detail">
          Scanning competitor reviews and community patterns...
        </div>
        <div className="loader-steps" id="loader-steps">
          <div className="loader-step-dot" id="ldot-0" />
          <div className="loader-step-dot" id="ldot-1" />
          <div className="loader-step-dot" id="ldot-2" />
          <div className="loader-step-dot" id="ldot-3" />
          <div className="loader-step-dot" id="ldot-4" />
        </div>
      </div>

      {/* STEP 3: CONFIRM */}
      <div id="step-confirm" className="hidden">
        <div className="section-head">Market Intelligence Synthesis</div>
        <div className="info-banner">
          <div className="info-banner-icon">💡</div>
          <p>
            AI has analyzed your market and CRM data. <strong>Uncheck any findings</strong> that are irrelevant to your
            specific business model.
          </p>
        </div>
        <div id="research-panels" />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            className="btn-ghost"
            onClick={() => {
              if (window.showStep) window.showStep(1);
            }}
          >
            ← Back
          </button>
          <button
            className="btn-gold"
            onClick={() => {
              if (window.buildPersonas) window.buildPersonas();
            }}
          >
            Build Personas From This Research →
          </button>
        </div>
      </div>

      {/* STEP 4: PERSONAS */}
      <div id="step-personas" className="hidden">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div className="section-head">Validated Buyer Personas</div>
            <div className="section-sub">Optimized for content strategy and paid social activation.</div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => {
              if (window.showStep) window.showStep(3);
            }}
          >
            ← Research
          </button>
        </div>
        <div className="section-divider" />
        <div id="persona-list" />
        <div className="export-bar">
          <div id="persona-count-display">3 personas ready</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-ghost"
              onClick={() => {
                if (window.toggleExportDrawer) window.toggleExportDrawer();
              }}
            >
              Export Options
            </button>
            <button
              className="btn-gold"
              onClick={() => {
                if (window.copyJSON) window.copyJSON();
              }}
            >
              Copy JSON
            </button>
          </div>
        </div>
        <div className="export-drawer" id="export-drawer">
          <div className="export-options">
            <div
              className="export-opt"
              onClick={() => {
                if (window.exportJSON) window.exportJSON();
              }}
            >
              JSON
            </div>
            <div
              className="export-opt"
              onClick={() => {
                if (window.exportMarkdown) window.exportMarkdown();
              }}
            >
              Markdown
            </div>
            <div
              className="export-opt"
              onClick={() => {
                if (window.exportCSV) window.exportCSV();
              }}
            >
              CSV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

