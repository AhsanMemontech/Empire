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
  // We added 'step-strategy', so the list must match exactly
  const sectionIds = ['step-intake', 'loading', 'step-confirm', 'step-personas', 'step-strategy'];
  
  // Hide all sections
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Show the current step
  const targetId = sectionIds[n - 1];
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.classList.remove('hidden');
    // Scroll to top so the user sees the new content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update Progress Track Highlights
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById('prog-' + i);
    if (stepEl) {
      if (i === n) {
        stepEl.classList.add('active');
        stepEl.classList.remove('done');
      } else if (i < n) {
        stepEl.classList.add('done');
        stepEl.classList.remove('active');
      } else {
        stepEl.classList.remove('active', 'done');
      }
    }
  }
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

  const systemPrompt = `You are a Senior Industry Strategist. 
    Your goal is to find "Hidden Winners" based on provided data.
    Return valid JSON only in this format:
    {
      "market_overview": "...",
      "hidden_winners": [
        {"segment": "...", "average_deal_value": "...", "reason": "..."}
      ]
    }`;
  
    const userPrompt = `
    ACT AS: A Lead Consultant for a ${getVal('industry')} firm.
    BUSINESS CONTEXT: ${getVal('biz-description')}
    PRICING STRATEGY: ${getVal('price-point')}
    
    DATASET FOR ANALYSIS: 
    ${crmContext || "No CRM data. Use market research for " + getVal('industry')}
  
    TASK: 
    Analyze this specific business. Find the "Hidden Winner" (the customer that pays the most or has the highest strategic value). 
    Justify why this segment is the best choice for a ${getVal('price-point')} offer.`;

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
  if (!container) return;

  // 1. Universal Data Detector
  const overview = data.market_overview || data.overview || "High-value segments identified within your CRM data.";
  
  // Look for any version of the winners list
  const sections = data.hidden_winners || data.hiddenWinners || data.research_sections || data.sections || [];

  container.innerHTML = `
    <div style="text-align: left; margin-bottom: 60px; padding: 40px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--gold); border-radius: 0 20px 20px 0;">
      <div class="field-label" style="color: var(--gold)">Intelligence Synthesis</div>
      <h2 style="font-family: var(--serif); font-size: 32px; margin-bottom: 20px; text-transform: uppercase;">Empire Executive Overview</h2>
      <p style="font-size: 18px; line-height: 1.6; font-weight: 300; color: rgba(255,255,255,0.8)">${overview}</p>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;" id="research-grid"></div>
  `;

  const grid = document.getElementById('research-grid');
  
  if (sections.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 2; opacity: 0.5; padding: 20px; border: 1px dashed rgba(255,255,255,0.1);">Analysis complete. Proceed to Persona generation.</div>`;
    return;
  }

  sections.forEach((s, i) => {
    // 2. THE FIX: Prioritize 'reason' or 'description' if 'findings' is missing
    const detailText = s.reason || s.description || (Array.isArray(s.findings) ? s.findings[0] : "High-value target identified.");
    const valDisplay = s.average_deal_value ? `<div style="color: var(--gold); font-weight: bold; margin-bottom: 10px; font-size: 18px;">Value: ${s.average_deal_value}</div>` : "";
    
    grid.innerHTML += `
      <div class="research-card" style="text-align: left; padding: 30px; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; background: rgba(255,255,255,0.01); position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <span class="field-label" style="margin: 0;">${s.segment || s.source || 'Segment'}</span>
          <input type="checkbox" id="check-${i}" checked style="accent-color: var(--gold); cursor: pointer; transform: scale(1.3);">
        </div>
        ${valDisplay}
        <p style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.7); font-weight: 300;">
          ${detailText}
        </p>
      </div>
    `;
  });
}

async function buildPersonas() {
  startLoader("BUILDING PERSONAS");
  const count = chipSelections.count ? chipSelections.count[0] : "3";
  
  const systemPrompt = `You are a B2B Growth Strategist for ${getVal('industry')}. 
  Based on the Research, create 3 detailed Professional Personas. 
  Focus ONLY on business decision-makers (CEOs, Founders, Ops Directors). 
  Do not create consumer/lifestyle personas unless the business is B2C. 
  Return valid JSON.`;
  const userPrompt = `Build ${count} vivid personas based on research. Use real titles. JSON only.`;
  
  try {
    const res = await callClaude(systemPrompt, userPrompt);
    clearInterval(loaderInterval);
    const rawList = res.personas || res.profiles || res.decision_makers || (Array.isArray(res) ? res : []);
    personas = rawList;
    if (window.setPersonaState) {
      window.setPersonaState(rawList);
    }
    renderPersonas();
    showStep(4);
  } catch (e) {
    clearInterval(loaderInterval);
    alert("Persona build failed. Check console.");
    showStep(3);
  }
}

function renderPersonas() {
  const container = document.getElementById('persona-grid');
  if (!container) {
    console.error("Could not find persona-grid container");
    return;
  }

  // Handle case where personas might be an object containing an array
  const list = Array.isArray(personas) ? personas : (personas.personas || personas.profiles || []);

  if (list.length === 0) {
    container.innerHTML = `<div style="color: white; opacity: 0.5;">No personas generated. Try again.</div>`;
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="persona-card" style="text-align: left; padding: 30px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;">
      <div class="field-label" style="color: var(--gold)">${p.title || p.role || p.type || 'Decision Maker'}</div>
      <h3 style="font-family: var(--serif); font-size: 24px; margin-bottom: 10px; color: #fff;">${p.name || p.persona_name || 'Executive Profile'}</h3>
      <p style="font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 20px; line-height: 1.5;">${p.bio || p.summary || p.description || ''}</p>
      
      <div style="margin-bottom: 20px;">
        <span class="field-label" style="font-size: 10px; opacity: 0.7;">Pain Points</span>
        <ul style="list-style: none; padding: 0; font-size: 13px; color: rgba(255,255,255,0.7);">
          ${(Array.isArray(p.pain_points || p.challenges) ? (p.pain_points || p.challenges) : []).map(pt => `<li style="margin-bottom: 5px;">• ${pt}</li>`).join('')}
        </ul>
      </div>

      <div style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
        <span class="field-label" style="font-size: 10px; opacity: 0.7;">The Hook</span>
        <p style="font-style: italic; font-size: 13px; color: var(--gold);">"${p.hook || p.messaging_angle || p.quote || 'Strategy pending...'}"</p>
      </div>
    </div>
  `).join('');
}

// --- NEW STRATEGY LOGIC ---
window.generateStrategy = async function() {
  startLoader("SYNTHESIZING STRATEGY");
  
  // 1. DYNAMIC EXTRACTION: Find the winner from the previous research step
  const winnersList = researchData.hidden_winners || researchData.hiddenWinners || [];
  const topWinner = winnersList[0] || { segment: "High-Value Target", average_deal_value: "Premium" };
  
  const winnerName = topWinner.segment;
  const winnerValue = topWinner.average_deal_value || topWinner.value || "Premium";

  const systemPrompt = `You are the Lead Strategist at Empire of Ideas. 
    Return valid JSON. Structure the "content_plan" as an array of objects: 
    {"content_plan": [{"phase": "Authority Building", "task": "..."}, {"phase": "Lead Capture", "task": "..."}, {"phase": "Conversion", "task": "..."}]}`;

  // 2. CONTEXTUAL PROMPT: No more hard-coded "Operations Manager"
  const userPrompt = `
    INDUSTRY: ${getVal('industry')}
    RESEARCH DATA: ${JSON.stringify(researchData)}
    PERSONAS: ${JSON.stringify(personas)}

    STRATEGY GOAL:
    Based on the "${winnerName}" being the ${winnerValue} Hidden Winner:
    1. Identify a 'Messaging Hook' that justifies a ${winnerValue} price point for this specific industry.
    2. Create a 30-day content plan to attract more of these ${winnerName} leads.
    3. Return the results in the requested JSON format.`;
  
  try {
    const res = await callClaude(systemPrompt, userPrompt);
    clearInterval(loaderInterval);
    
    // This ensures the React UI in page.tsx gets the fresh SaaS/Accounting data
    if (window.setStrategyState) {
      window.setStrategyState(res);
    }
    
    showStep(5);
  } catch (e) {
    clearInterval(loaderInterval);
    alert("Strategy generation failed.");
    showStep(4);
  }
};

window.copyStrategy = function() {
  const winner = document.querySelector('#strategy-module h2 span')?.innerText || "Operations Manager";
  const hook = document.querySelector('.persona-item div i')?.innerText || "";
  const roadmap = Array.from(document.querySelectorAll('.strategy-step'))
    .map((step, i) => {
      const title = step.querySelector('.step-title').innerText;
      const body = step.querySelector('.step-body').innerText;
      return `${i + 1}. ${title}: ${body}`;
    })
    .join('\n\n');

  const fullText = `EMPIRE STRATEGY: ${winner}\n\n` +
                   `MESSAGING HOOK: ${hook}\n\n` +
                   `30-DAY ROADMAP:\n${roadmap}`;

  navigator.clipboard.writeText(fullText).then(() => {
    alert("Strategy formatted and copied to clipboard.");
  });
};

// Global Claude Fetcher
async function callClaude(sys, user) {
  const res = await fetch('/api/claude', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ system: sys, user }) 
  });
  if(!res.ok) throw new Error("API Connection Failed");
  const data = await res.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
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