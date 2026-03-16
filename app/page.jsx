const bodyHtml = `

<div class="wrap">
  <!-- HEADER -->
  <div class="header">
    <div class="header-badge"><div class="header-badge-dot"></div>Empire of Ideas — Persona Engine</div>
    <h1>KNOW YOUR<br><span>BUYER</span></h1>
    <p>AI-driven market research enriched by your real CRM data. Build, validate, and activate buyer personas in minutes.</p>
  </div>

  <!-- PROGRESS -->
  <div class="progress-track" id="progress-track">
    <div class="prog-step active" id="prog-1"><div class="prog-num">1</div><div class="prog-label">Intake</div></div>
    <div class="prog-line" id="prog-line-1"></div>
    <div class="prog-step" id="prog-2"><div class="prog-num">2</div><div class="prog-label">Research</div></div>
    <div class="prog-line" id="prog-line-2"></div>
    <div class="prog-step" id="prog-3"><div class="prog-num">3</div><div class="prog-label">Confirm</div></div>
    <div class="prog-line" id="prog-line-3"></div>
    <div class="prog-step" id="prog-4"><div class="prog-num">4</div><div class="prog-label">Personas</div></div>
  </div>

  <!-- STEP 1: INTAKE -->
  <div id="step-intake">
    <!-- API & CRM -->
    <div class="card">
      <div class="card-header"><div class="card-icon">🔑</div><div><div class="card-title">Engine Connectivity</div><div class="card-subtitle">Setup AI access and data sources</div></div></div>
      <div class="card-body">
        <div class="field-group">
          <div class="field-label">CRM Enrichment (Optional)</div>
          <div class="field-hint">Upload a GHL or CRM export (CSV) to find "Hidden Winners" and validate your hypothesis.</div>
          <div class="dropzone-area" id="csv-dropzone" onclick="document.getElementById('csv-input').click()">
            <span id="csv-status">Drop CRM Export here to enrich with real data</span>
            <input type="file" id="csv-input" hidden accept=".csv" onchange="handleCSVUpload(event)">
          </div>
        </div>
      </div>
    </div>

    <!-- BUSINESS -->
    <div class="card">
      <div class="card-header"><div class="card-icon">🏢</div><div class="card-title">Business Foundations</div></div>
      <div class="card-body">
        <div class="field-group">
          <div class="field-label">What does your business do?</div>
          <textarea class="field-textarea" id="biz-description" rows="3" placeholder="e.g. We help restaurant owners automate their social media..."></textarea>
        </div>
        <div class="field-grid">
          <div class="field-group"><div class="field-label">Industry</div><input class="field-input" id="industry" placeholder="SaaS, E-commerce, etc."></div>
          <div class="field-group"><div class="field-label">Price Point</div><input class="field-input" id="price-point" placeholder="e.g. $99/mo"></div>
        </div>
        <div class="field-group">
          <div class="field-label">Your Buyer Hypothesis</div>
          <textarea class="field-textarea" id="buyer-hypothesis" rows="2" placeholder="Who do you THINK your current buyer is? AI will test this."></textarea>
        </div>
      </div>
    </div>

    <!-- MARKET CONTEXT -->
    <div class="card">
      <div class="card-header"><div class="card-icon">🎯</div><div class="card-title">Market Context</div></div>
      <div class="card-body">
        <div class="field-group">
          <div class="field-label">Geography</div>
          <div class="chip-group" id="geo-chips">
            <div class="chip selected" onclick="toggleChip(this,'geo')">Global</div>
            <div class="chip" onclick="toggleChip(this,'geo')">United States</div>
            <div class="chip" onclick="toggleChip(this,'geo')">UK / Europe</div>
            <div class="chip" onclick="toggleChip(this,'geo')">Australia / NZ</div>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Customer Type</div>
          <div class="chip-group" id="ctype-chips">
            <div class="chip" onclick="toggleChip(this,'ctype')">B2B</div>
            <div class="chip" onclick="toggleChip(this,'ctype')">B2C</div>
            <div class="chip selected" onclick="toggleChip(this,'ctype')">Both</div>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Persona Count</div>
          <div class="chip-group" id="count-chips">
            <div class="chip" onclick="toggleChip(this,'count')">2</div>
            <div class="chip selected" onclick="toggleChip(this,'count')">3</div>
            <div class="chip" onclick="toggleChip(this,'count')">4</div>
            <div class="chip" onclick="toggleChip(this,'count')">5</div>
          </div>
        </div>
        <div class="field-group">
            <div class="field-label">Known Competitors</div>
            <input class="field-input" id="competitors" placeholder="e.g. Hootsuite, Buffer">
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end">
      <button class="btn-gold" onclick="startResearch()">Research & Enrich Market →</button>
    </div>
  </div>

  <!-- LOADING -->
  <div id="loading">
    <div class="loader-ring"></div>
    <div class="loader-stage" id="loader-stage">RESEARCHING</div>
    <div class="loader-detail" id="loader-detail">Scanning competitor reviews and community patterns...</div>
    <div class="loader-steps" id="loader-steps">
      <div class="loader-step-dot" id="ldot-0"></div>
      <div class="loader-step-dot" id="ldot-1"></div>
      <div class="loader-step-dot" id="ldot-2"></div>
      <div class="loader-step-dot" id="ldot-3"></div>
      <div class="loader-step-dot" id="ldot-4"></div>
    </div>
  </div>

  <!-- STEP 3: CONFIRM -->
  <div id="step-confirm" class="hidden">
    <div class="section-head">Market Intelligence Synthesis</div>
    <div class="info-banner">
      <div class="info-banner-icon">💡</div>
      <p>AI has analyzed your market and CRM data. <strong>Uncheck any findings</strong> that are irrelevant to your specific business model.</p>
    </div>
    <div id="research-panels"></div>
    <div style="display:flex;justify-content:space-between;margin-top:28px">
      <button class="btn-ghost" onclick="showStep(1)">← Back</button>
      <button class="btn-gold" onclick="buildPersonas()">Build Personas From This Research →</button>
    </div>
  </div>

  <!-- STEP 4: PERSONAS -->
  <div id="step-personas" class="hidden">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div><div class="section-head">Validated Buyer Personas</div><div class="section-sub">Optimized for content strategy and paid social activation.</div></div>
        <button class="btn-ghost" onclick="showStep(3)">← Research</button>
    </div>
    <div class="section-divider"></div>
    <div id="persona-list"></div>
    <div class="export-bar">
      <div id="persona-count-display">3 personas ready</div>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" onclick="toggleExportDrawer()">Export Options</button>
        <button class="btn-gold" onclick="copyJSON()">Copy JSON</button>
      </div>
    </div>
    <div class="export-drawer" id="export-drawer">
        <div class="export-options">
            <div class="export-opt" onclick="exportJSON()">JSON</div>
            <div class="export-opt" onclick="exportMarkdown()">Markdown</div>
            <div class="export-opt" onclick="exportCSV()">CSV</div>
        </div>
    </div>
  </div>
</div>
`;

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

