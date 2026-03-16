
let personas = [];
let researchData = null;
let crmContext = "";
let chipSelections = { geo: ['Global'], ctype: ['Both'], count: ['3'] };


function toggleChip(el, group) {
  document.querySelectorAll(`#${group}-chips .chip`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  chipSelections[group] = [el.textContent.trim()];
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = e.target.result.split('\n');
    crmContext = rows.slice(0, 100).join('\n'); // Protect token limit
    document.getElementById('csv-status').innerText = `✅ ${file.name} Loaded`;
    document.getElementById('csv-status').style.color = "var(--teal)";
  };
  reader.readAsText(file);
}

function showStep(n) {
  ['step-intake','loading','step-confirm','step-personas'].forEach(id => document.getElementById(id).classList.add('hidden'));
  const target = [null,'step-intake','loading','step-confirm','step-personas'][n];
  document.getElementById(target).classList.remove('hidden');
  for(let i=1; i<=4; i++) {
    const el = document.getElementById('prog-'+i);
    const line = document.getElementById('prog-line-'+i);
    el.classList.remove('active','done');
    if(i < n) el.classList.add('done');
    if(i === n) el.classList.add('active');
    if(line) line.classList.toggle('done', i < n);
  }
}

let loaderInterval;
const stages = [['RESEARCHING','Mapping landscape...'],['SCANNING','Competitor reviews...'],['ANALYZING','Finding pain points...'],['ENRICHING','Cross-referencing CRM...'],['SYNTHESIZING','Finalizing research...']];
function startLoader() {
  showStep(2);
  let idx = 0;
  loaderInterval = setInterval(() => {
    document.querySelectorAll('.loader-step-dot').forEach(d => d.classList.remove('active'));
    document.getElementById('ldot-'+idx).classList.add('active');
    document.getElementById('loader-stage').innerText = stages[idx][0];
    document.getElementById('loader-detail').innerText = stages[idx][1];
    idx = (idx + 1) % stages.length;
  }, 2000);
}

async function startResearch() {
  const desc = document.getElementById('biz-description').value.trim();
  if(!desc) return alert("Description required");

  startLoader();

  const systemPrompt = `You are a Senior Market Research Analyst. Return valid JSON only. Structure: {"market_overview": "...", "research_sections": [{"source": "...", "findings": ["..."], "relevance": "..."}], "segment_hypotheses": [{"label": "...", "description": "..."}]}`;
  const userPrompt = `
    Business: ${desc}
    Industry: ${document.getElementById('industry').value}
    Price: ${document.getElementById('price-point').value}
    Hypothesis: ${document.getElementById('buyer-hypothesis').value}
    Geo: ${chipSelections.geo}
    Competitors: ${document.getElementById('competitors').value}
    CRM DATA ENRICHMENT: ${crmContext}
    
    Research this market. If CRM data is present, highlight contradictions between hypothesis and actual data. Look for "Hidden Winners".`;

  try {
    const res = await callClaude(systemPrompt, userPrompt);
    clearInterval(loaderInterval);
    researchData = res;
    renderResearch(res);
    showStep(3);
  } catch(e) {
    clearInterval(loaderInterval);
    alert(e.message);
    showStep(1);
  }
}

function renderResearch(data) {
  const container = document.getElementById('research-panels');
  container.innerHTML = `<div class="card"><div class="card-body"><div class="cell-label">Executive Overview</div>${data.market_overview}</div></div>`;
  data.research_sections.forEach((s, i) => {
    container.innerHTML += `
      <div class="research-panel">
        <div class="research-panel-header" onclick="this.nextElementSibling.classList.toggle('open')">
          <div style="display:flex;gap:12px;align-items:center">
            <span class="research-source-tag">${s.source}</span>
            <span style="font-size:12px;color:var(--muted)">${s.findings.length} findings</span>
          </div>
          <span style="color:var(--muted)">↓</span>
        </div>
        <div class="research-findings">
          ${s.findings.map(f => `<div class="research-finding-item"><div class="finding-dot"></div><div>${f}</div></div>`).join('')}
          <div style="font-size:11px;color:var(--gold);font-family:var(--mono);margin-top:12px">${s.relevance}</div>
        </div>
        <div class="confirm-check"><input type="checkbox" id="check-${i}" checked><label for="check-${i}">Include in Personas</label></div>
      </div>`;
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
    <div class="persona-card">
      <div class="persona-top">
        <div class="persona-avatar">${p.emoji || '👤'}</div>
        <div class="persona-identity">
          <div class="persona-segment" style="color:var(--gold)">${p.segment_name}</div>
          <input class="editable-name" value="${p.name}">
          <input class="editable-role" value="${p.role}">
        </div>
      </div>
      <div class="persona-grid">
        <div class="persona-cell full"><div class="cell-label">Summary</div><textarea class="cell-text">${p.summary}</textarea></div>
        <div class="persona-cell"><div class="cell-label">Job To Be Done</div><textarea class="cell-text">${p.jtbd}</textarea></div>
        <div class="persona-cell"><div class="cell-label">Goals</div><div class="tag-row">${p.goals.map(g=>`<span class="ptag goal">${g}</span>`).join('')}</div></div>
        <div class="persona-cell"><div class="cell-label">Pain Points</div><div class="tag-row">${p.pain_points.map(g=>`<span class="ptag pain">${g}</span>`).join('')}</div></div>
        <div class="persona-cell"><div class="cell-label">Motivations</div><textarea class="cell-text">${p.motivations}</textarea></div>
        <div class="persona-cell"><div class="cell-label">Buying Triggers</div><textarea class="cell-text">${p.buying_triggers}</textarea></div>
        <div class="persona-cell"><div class="cell-label">Objections</div><textarea class="cell-text">${p.objections}</textarea></div>
        <div class="persona-cell"><div class="cell-label">Messaging Angle</div><textarea class="cell-text">${p.messaging_angle}</textarea></div>
        <div class="persona-cell full"><div class="cell-label">Ad Targeting Notes</div><textarea class="cell-text" style="min-height:40px">${p.ad_targeting_notes}</textarea></div>
      </div>
      <div class="persona-quote-block">
        <div class="big-quote">"</div>
        <textarea class="quote-text">${p.voice_quote}</textarea>
      </div>
    </div>
  `).join('');
  document.getElementById('persona-count-display').innerText = `${personas.length} personas ready`;
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