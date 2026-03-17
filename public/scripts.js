let personas = [];
let researchData = null;
let crmContext = "";
let chipSelections = { geo: ['Global'], ctype: ['Both'], count: ['3'] };

// SAFETY WRAPPER: Get element value or return empty string
const getVal = (id) => document.getElementById(id)?.value?.trim() || "";

function toggleChip(el, group) {
  const parent = el.parentElement;
  if (parent) {
    parent.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  }
  el.classList.add('selected');
  chipSelections[group] = [el.textContent.trim()];
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = e.target.result.split('\n');
    crmContext = rows.slice(0, 100).join('\n'); 
    const statusEl = document.getElementById('csv-status');
    if (statusEl) {
      statusEl.innerText = `✅ ${file.name} Loaded`;
      statusEl.style.color = "#d4a843"; // Gold color
    }
  };
  reader.readAsText(file);
}

function showStep(n) {
  const steps = ['step-intake', 'loading', 'step-confirm', 'step-personas'];
  
  // Hide all
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Show target
  const targetId = steps[n - 1];
  const targetEl = document.getElementById(targetId);
  if (targetEl) targetEl.classList.remove('hidden');

  // Update Progress Dots (Minimalist Logic)
  const dots = document.querySelectorAll('.prog-step');
  dots.forEach((dot, idx) => {
    dot.classList.remove('active', 'done');
    if (idx + 1 < n) dot.classList.add('done');
    if (idx + 1 === n) dot.classList.add('active');
  });
}

let loaderInterval;
const stages = [
  ['RESEARCHING', 'Mapping landscape...'],
  ['SCANNING', 'Competitor reviews...'],
  ['ANALYZING', 'Finding pain points...'],
  ['SYNTHESIZING', 'Finalizing research...']
];

function startLoader(customStage) {
  showStep(2); // Show loading step
  let idx = 0;
  if (loaderInterval) clearInterval(loaderInterval);
  
  loaderInterval = setInterval(() => {
    const stageEl = document.getElementById('loader-stage');
    const detailEl = document.getElementById('loader-detail');
    
    if (stageEl) stageEl.innerText = customStage || stages[idx][0];
    if (detailEl) detailEl.innerText = stages[idx][1];
    
    idx = (idx + 1) % stages.length;
  }, 2000);
}

async function startResearch() {
  const desc = getVal('biz-description');
  if (!desc) return alert("Description required");

  startLoader();

  const systemPrompt = `You are a Senior Market Research Analyst. Return valid JSON only. Structure: {"market_overview": "...", "research_sections": [{"source": "...", "findings": ["..."], "relevance": "..."}], "segment_hypotheses": [{"label": "...", "description": "..."}]}`;
  
  // Note: Using getVal ensures we don't crash if Edward removed "Competitors" or "Hypothesis" from the UI
  const userPrompt = `
    Business: ${desc}
    Industry: ${getVal('industry')}
    Price: ${getVal('price-point')}
    Geo: ${chipSelections.geo}
    CRM DATA: ${crmContext}
    Research this market and highlight "Hidden Winners".`;

  try {
    const res = await callClaude(systemPrompt, userPrompt);
    clearInterval(loaderInterval);
    researchData = res;
    renderResearch(res);
    showStep(3);
  } catch (e) {
    clearInterval(loaderInterval);
    alert(e.message);
    showStep(1);
  }
}

function renderResearch(data) {
  const container = document.getElementById('research-panels');
  
  // 1. Clear and Add Executive Overview with a "Glass" look
  container.innerHTML = `
    <div style="text-align: left; margin-bottom: 60px; padding: 40px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--gold); border-radius: 0 20px 20px 0;">
      <div class="field-label" style="color: var(--gold)">Intelligence Synthesis</div>
      <h2 style="font-family: var(--serif); font-size: 32px; margin-bottom: 20px; text-transform: uppercase;">Executive Overview</h2>
      <p style="font-size: 18px; line-height: 1.6; font-weight: 300; color: rgba(255,255,255,0.8)">${data.market_overview}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;" id="research-grid"></div>
  `;

  const grid = document.getElementById('research-grid');

  // 2. Map Findings into a sleek 2-column grid
  data.research_sections.forEach((s, i) => {
    grid.innerHTML += `
      <div class="research-card" style="text-align: left; padding: 30px; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; background: rgba(255,255,255,0.01);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <span class="field-label" style="margin: 0;">${s.source}</span>
          <input type="checkbox" id="check-${i}" checked style="accent-color: var(--gold);">
        </div>
        
        <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
          ${s.findings.map(f => `
            <li style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 12px; padding-left: 15px; border-left: 1px solid rgba(212,168,67,0.3);">
              ${f}
            </li>
          `).join('')}
        </ul>
        
        <div style="font-size: 10px; font-family: var(--mono); color: var(--gold); opacity: 0.8; letter-spacing: 0.1em; text-transform: uppercase;">
          Relevance: ${s.relevance}
        </div>
      </div>
    `;
  });
}

async function buildPersonas() {
  startLoader();
  document.getElementById('loader-stage').innerText = "BUILDING PERSONAS";
  
  const confirmed = researchData.research_sections.filter((_,i) => document.getElementById('check-'+i).checked);
  const count = chipSelections.count[0];
  
  const systemPrompt = `Return JSON only: {"personas": [{"name": "...", "segment_name": "...", "role": "...", "emoji": "...", "summary": "...", "jtbd": "...", "goals": [], "pain_points": [], "motivations": "...", "buying_triggers": "...", "objections": "...", "messaging_angle": "...", "ad_targeting_notes": "...", "voice_quote": "..."}]}`;
  const userPrompt = `Build ${count} vivid personas based on this confirmed research: ${JSON.stringify(confirmed)}`;

  try {
    const res = await callClaude(systemPrompt, userPrompt);
    clearInterval(loaderInterval);
    personas = res.personas;
    renderPersonas();
    showStep(4);
  } catch(e) {
    clearInterval(loaderInterval);
    alert(e.message);
    showStep(3);
  }
}

function renderPersonas() {
  const container = document.getElementById('persona-list');
  container.innerHTML = personas.map((p, i) => `
    <div class="persona-card" style="border-top: 1px solid var(--border); padding-top: 60px; margin-bottom: 100px;">
      
      <div class="persona-header" style="margin-bottom: 40px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: var(--gold); margin-bottom: 8px;">
          ${p.segment_name || 'Target Segment'}
        </div>
        <h2 style="font-family: var(--serif); font-size: 48px; text-transform: uppercase; line-height: 1;">
          ${p.name}
        </h2>
        <p style="color: var(--muted); font-size: 16px; margin-top: 8px;">${p.role}</p>
      </div>

      <div class="persona-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px 40px;">
        
        <div class="persona-item" style="grid-column: span 2;">
          <label class="field-label">Executive Summary</label>
          <div style="font-size: 18px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.8)">${p.summary}</div>
        </div>

        <div class="persona-item">
          <label class="field-label">Pain Points</label>
          <ul style="list-style: none; padding: 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.8;">
            ${p.pain_points.map(pt => `<li>— ${pt}</li>`).join('')}
          </ul>
        </div>

        <div class="persona-item">
          <label class="field-label">Messaging Angle</label>
          <div style="font-size: 14px; line-height: 1.6; color: var(--gold); italic">${p.messaging_angle}</div>
        </div>

      </div>

      <div style="margin-top: 60px; padding: 40px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px inset rgba(255,255,255,0.05);">
        <div style="font-family: var(--serif); font-size: 32px; line-height: 1.2; font-style: italic; color: #fff;">
          "${p.voice_quote}"
        </div>
      </div>
    </div>
  `).join('');
  
  const countDisplay = document.getElementById('persona-count-display');
  if (countDisplay) countDisplay.innerText = `${personas.length} Intelligence Profiles Active`;
}

async function callClaude(sys, user) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      system: sys, 
      user 
    })
  });
  if(!res.ok) throw new Error("API Connection Failed");
  const data = await res.json();
  let text = data.content[0].text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch(e) { 
    throw new Error("AI returned invalid JSON. Try again."); 
  }
}

function toggleExportDrawer() { 
    const drawer = document.getElementById('export-drawer');
    drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block'; 
}

function copyJSON() { 
    navigator.clipboard.writeText(JSON.stringify(personas, null, 2)); 
    alert("Copied to clipboard"); 
}

function exportJSON() { 
    download('personas.json', JSON.stringify(personas, null, 2), 'application/json'); 
}

function download(filename, text, type) { 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(new Blob([text], {type})); 
    a.download = filename; 
    a.click(); 
}

function exportMarkdown() { 
    let md = "# Personas\n\n"; 
    personas.forEach(p => md += `## ${p.name}\n${p.summary}\n\n**JTBD:** ${p.jtbd}\n\n**Ad Targeting:** ${p.ad_targeting_notes}\n\n> "${p.voice_quote}"\n\n---\n\n`);
    download('personas.md', md, 'text/markdown');
}

function exportCSV() {
    const headers = "Name,Role,Segment,Summary,JTBD,AdTargeting,Quote\n";
    const rows = personas.map(p => `"${p.name}","${p.role}","${p.segment_name}","${p.summary.substring(0,50)}...","${p.jtbd}","${p.ad_targeting_notes}","${p.voice_quote}"`).join('\n');
    download('personas.csv', headers + rows, 'text/csv');
}