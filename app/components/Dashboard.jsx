"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ user, appData, researchData, personas, setPersonas, strategy, setStrategy, startLoader, stopLoader, callClaude, dashboardStep, setDashboardStep }) {
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);

  const safeText = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return JSON.stringify(val); 
  };

  const buildPersonas = async () => {
    startLoader("BUILDING PERSONAS", "Synthesizing psychographics...");
    const sys = `You are a B2B Growth Strategist for ${appData.industry}. Based on the Research, create 3 detailed Professional Personas. Return valid JSON.`;
    const userPrompt = `Research Data: ${JSON.stringify(researchData)}. Build 3 vivid personas. JSON only.`;
    
    try {
      const res = await callClaude(sys, userPrompt);
      const rawList = res.personas || res.profiles || res.decision_makers || (Array.isArray(res) ? res : []);
      setPersonas(rawList);
      setDashboardStep(4);
    } catch (e) {
      alert("Persona build failed.");
    } finally {
      stopLoader();
    }
  };

  const generateStrategy = async () => {
    startLoader("SYNTHESIZING STRATEGY", "Mapping 30-day activation...");
    const winnersList = researchData?.hidden_winners || researchData?.hiddenWinners || [];
    const topWinner = winnersList[0] || { segment: "High-Value Target", average_deal_value: "Premium" };
    const winnerName = safeText(topWinner.segment);

    const sys = `You are the Lead Strategist at Empire of Ideas. Return ONLY valid JSON in this exact structure:
    { "messaging_hook": "Write a punchy hook", "ad_targeting": "Write targeting criteria", "content_plan": [ {"phase": "Days 1-5", "task": "..."} ] }`;
    const userPrompt = `INDUSTRY: ${appData.industry}. WINNER: "${winnerName}". TASK: Create strategy to target this winner. Return JSON.`;
    
    try {
      const res = await callClaude(sys, userPrompt);
      const finalStrategy = { ...res, hidden_winner: winnerName, focus_segment: winnerName };
      setStrategy(finalStrategy);
      
      if(user) {
        await supabase.from('strategies').insert({
          user_id: user.id, hidden_winner: winnerName, messaging_hook: res.messaging_hook || res.hook, roadmap: res.content_plan
        });
      }
      setDashboardStep(5);
    } catch (e) {
      alert("Strategy generation failed.");
    } finally {
      stopLoader();
    }
  };

  const downloadFile = (filename, text, type) => {
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(new Blob([text], {type})); 
    a.download = filename; 
    a.click(); 
  };

  const copyJSON = () => { navigator.clipboard.writeText(JSON.stringify(personas, null, 2)); alert("Copied to clipboard"); };
  const exportJSON = () => downloadFile('personas.json', JSON.stringify(personas, null, 2), 'application/json'); 
  const exportCSV = () => {
    const headers = "Name,Role,Summary,Hook\n";
    const rows = personas.map(p => `"${safeText(p.name)}","${safeText(p.title)}","${safeText(p.summary || p.bio).substring(0,50)}...","${safeText(p.hook)}"`).join('\n');
    downloadFile('personas.csv', headers + rows, 'text/csv');
  };
  const exportMarkdown = () => { 
    let md = "# Personas\n\n"; 
    personas.forEach(p => { md += `## ${safeText(p.name || p.persona_name)}\n${safeText(p.summary || p.bio)}\n\n**Hook:** ${safeText(p.hook || p.messaging_angle)}\n\n---\n\n`; });
    downloadFile('personas.md', md, 'text/markdown');
  };
  const copyStrategy = () => {
    if(!strategy) return;
    const roadmap = (strategy.content_plan || []).map((step, i) => `${i + 1}. ${safeText(step.phase)}: ${safeText(step.task || step.tasks)}`).join('\n\n');
    const fullText = `EMPIRE STRATEGY: ${safeText(strategy.hidden_winner)}\n\nMESSAGING HOOK: ${safeText(strategy.messaging_hook || strategy.hook)}\n\n30-DAY ROADMAP:\n${roadmap}`;
    navigator.clipboard.writeText(fullText).then(() => alert("Strategy copied to clipboard."));
  };

  return (
    <div style={{ width: '100%' }}>
      {dashboardStep === 3 && researchData && (
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'left', marginBottom: '60px', padding: '40px', background: 'var(--bg-subtle)', borderLeft: '2px solid var(--gold)', borderRadius: '0 20px 20px 0' }}>
            <div className="field-label" style={{ color: 'var(--gold)' }}>Intelligence Synthesis</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '32px', marginBottom: '20px', textTransform: 'uppercase' }}>Empire Executive Overview</h2>
            <div style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: '300', color: 'var(--text)' }}>
              {(() => {
                const overview = researchData.market_overview || researchData.overview;
                if (!overview) return "High-value segments identified within your CRM data.";
                if (typeof overview === 'string') return overview;
                return (
                  <div style={{ fontSize: '16px', background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {Object.entries(overview).map(([key, val]) => (
                      <div key={key} style={{ marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--gold)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}: </strong> 
                        <span style={{ marginLeft: '8px' }}>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {(researchData.hidden_winners || researchData.hiddenWinners || researchData.research_sections || []).map((s, i) => (
              <div key={i} className="research-card" style={{ textAlign: 'left', padding: '30px', border: '1px solid var(--border)', borderRadius: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span className="field-label" style={{ margin: '0' }}>{safeText(s.segment || s.source || 'Segment')}</span>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold)', cursor: 'pointer', transform: 'scale(1.3)' }} />
                </div>
                {s.average_deal_value && <div style={{ color: 'var(--gold)', fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>Value: {safeText(s.average_deal_value)}</div>}
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', fontWeight: '300' }}>
                  {safeText(s.reason || s.description || (Array.isArray(s.findings) ? s.findings[0] : "Target identified."))}
                </p>
              </div>
            ))}
          </div>
          <button className="btn-gold" style={{ marginTop: '40px' }} onClick={buildPersonas}>Build Personas</button>
        </div>
      )}

      {dashboardStep === 4 && personas.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '0', display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsExportDrawerOpen(!isExportDrawerOpen)} style={{ background: 'var(--bg-subtle)', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Export Data ⬇
              </button>
              {isExportDrawerOpen && (
                <div style={{ position: 'absolute', top: '40px', right: '0', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 10 }}>
                  <button onClick={exportJSON} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}>Download JSON</button>
                  <button onClick={exportCSV} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}>Download CSV</button>
                  <button onClick={exportMarkdown} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}>Download Markdown</button>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {personas.map((p, i) => (
                <div key={i} className="persona-card" style={{ textAlign: 'left', padding: '30px', background: 'var(--bg-subtle)', borderRadius: '16px' }}>
                  <div className="field-label" style={{ color: 'var(--gold)' }}>{safeText(p.title || p.role || p.type || 'Decision Maker')}</div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '10px', color: 'var(--text)' }}>{safeText(p.name || p.persona_name || 'Executive Profile')}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '20px', lineHeight: '1.5' }}>{safeText(p.bio || p.summary || p.description || '')}</p>
                  <div style={{ marginBottom: '20px' }}>
                    <span className="field-label" style={{ fontSize: '10px', opacity: 0.7 }}>Pain Points</span>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text)' }}>
                      {(Array.isArray(p.pain_points || p.challenges) ? (p.pain_points || p.challenges) : []).map((pt, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>• {safeText(pt)}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ paddingTop: '20px', borderTop: '1px solid #d2d2d7' }}>
                    <span className="field-label" style={{ fontSize: '10px', opacity: 0.7 }}>The Hook</span>
                    <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--gold)' }}>"{safeText(p.hook || p.messaging_angle || p.quote || 'Strategy pending...')}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-gold" style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }} onClick={copyJSON}>Copy JSON</button>
            <button className="btn-gold" onClick={generateStrategy}>Generate Empire Strategy →</button>
          </div>
        </div>
      )}

      {dashboardStep === 5 && strategy && (
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'left', padding: '50px', borderRadius: '28px', background: '#fff', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
              <div className="field-label" style={{ color: 'var(--gold)' }}>The Empire Angle</div>
              <h2 style={{ fontSize: '48px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)' }}>{safeText(strategy.hidden_winner)}</h2>
              <p style={{ fontSize: '19px', color: 'var(--muted)', marginTop: '12px' }}>Target Segment: {safeText(strategy.focus_segment)}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div>
                <label className="field-label">Messaging Hook</label>
                <div style={{ fontSize: '18px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.4' }}>“{safeText(strategy.messaging_hook || strategy.hook)}”</div>
              </div>
              <div>
                <label className="field-label">Ad Targeting</label>
                <div style={{ fontSize: '16px', color: 'var(--muted)' }}>{safeText(strategy.ad_targeting)}</div>
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                <label className="field-label">30-Day Activation Roadmap</label>
                <div style={{ marginTop: '24px' }}>
                  {(strategy.content_plan || []).map((item, idx) => (
                    <div key={idx} style={{ borderLeft: '2px solid var(--bg-subtle)', paddingLeft: '24px', marginBottom: '24px' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>{safeText(item.phase)}</span>
                      <div style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.5' }}>{safeText(item.task || item.tasks)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button className="btn-gold" style={{ marginTop: '40px' }} onClick={copyStrategy}>Copy Activation Plan</button>
        </div>
      )}
    </div>
  );
}