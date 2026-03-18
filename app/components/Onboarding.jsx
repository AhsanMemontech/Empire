"use client";
import { useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Onboarding({ setView, user, appData, setAppData, setResearchData, startLoader, stopLoader, callClaude, onboardingStep, setOnboardingStep }) {
  const fileInputRef = useRef(null);
  const [targetFeedback, setTargetFeedback] = useState(null);

  const updateData = (key, value) => setAppData(prev => ({ ...prev, [key]: value }));

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    updateData('crmFileName', file.name);
    const reader = new FileReader();
    reader.onload = (e) => updateData('crmContext', e.target.result.split('\n').slice(0, 100).join('\n'));
    reader.readAsText(file);
  };

  const scanWebsite = async () => {
    if (!appData.websiteUrl) return alert("Please enter your URL");
    startLoader("SCANNING BRAND ASSETS", "Extracting colors and fonts...");
    try {
      // 1. TIGHTER SKELETON: Tell Claude exactly how many words to use
      const sysPrompt = `You are a Brand Auditor. Return ONLY valid JSON in this exact format, with no markdown formatting or extra text: 
      { 
        "brand": { "logoUrl": "", "primaryColor": "", "fontFamily": "" }, 
        "analysis": { "target": "Short, 2-5 word description of the exact target audience (e.g. 'Enterprise CFOs')" } 
      }`;

      // 2. TIGHTER PROMPT
      const res = await callClaude(
        sysPrompt, 
        `WEBSITE URL: ${appData.websiteUrl}. Analyze their messaging and tell me exactly WHO they are targeting in 5 words or less.`
      );
      
      if (user) {
        await supabase.from('brands').upsert({
          id: user.id, website_url: appData.websiteUrl, logo_url: res.brand?.logoUrl || null,
          primary_font: res.brand?.fontFamily || null, target_audience_web: res.analysis?.target || "Assumed Target",
          updated_at: new Date()
        });
      }
      
      updateData('websiteTarget', res.analysis?.target); 
      setOnboardingStep(3);
    } catch (e) {
      alert("Website scan failed.");
    } finally {
      stopLoader();
    }
  };

  const startResearch = async () => {
    if (!appData.bizDesc) return alert("Audience definition required");
    
    if (user) {
      await supabase.from('brands').update({ target_audience_crm: "Sales Heads (CRM Reality)", updated_at: new Date() }).eq('id', user.id);
    }

    startLoader(`ANALYZING ${appData.businessModel} MARKET`, "Mapping landscape...");
    setView('dashboard'); 

    const sys = `You are a Strategist for ${appData.businessModel}. Find "Hidden Winners". Return valid JSON with "market_overview" and "hidden_winners" array (segment, average_deal_value, reason).`;
    const userPrompt = `Industry: ${appData.industry}. Context: ${appData.bizDesc}. Price: ${appData.pricePoint}. CRM: ${appData.crmContext}`;

    try {
      const res = await callClaude(sys, userPrompt);
      setResearchData(res);
    } catch (e) {
      alert("Research failed.");
      setView('onboarding');
    } finally {
      stopLoader();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '720px' }}>
      {onboardingStep === 1 && (
        <div>
          <div style={{ marginBottom: '40px' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '15px' }}>Business Model</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['B2B', 'B2C'].map((type) => (
                <div key={type} className={`chip model-chip ${appData.businessModel === type ? 'selected' : ''}`} onClick={() => updateData('businessModel', type)} style={{ flex: 1, padding: '20px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', border: appData.businessModel === type ? '2px solid var(--gold)' : '1px solid var(--border)' }}>
                  {type === 'B2B' ? '🏢 Business (B2B)' : '🛍️ Consumer (B2C)'}
                </div>
              ))}
            </div>
          </div>
          <div className="field-group" style={{ marginBottom: '40px' }}>
            <label className="field-label">Audience Definition</label>
            <textarea value={appData.bizDesc} onChange={e => updateData('bizDesc', e.target.value)} className="field-textarea" rows={2} placeholder="Who are you trying to reach?" style={{ textAlign: 'center', fontSize: '24px', background: 'var(--bg-subtle)', borderRadius: '18px', border: 'none', padding: '20px', marginTop: '5px', width: '100%' }} />
          </div>
          <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div className="field-group">
              <label className="field-label">Industry</label>
              <input value={appData.industry} onChange={e => updateData('industry', e.target.value)} className="field-input" placeholder="e.g. SaaS" style={{ textAlign: 'center', background: 'var(--bg-subtle)' }} />
            </div>
            <div className="field-group">
              <label className="field-label">Price Point</label>
              <input value={appData.pricePoint} onChange={e => updateData('pricePoint', e.target.value)} className="field-input" placeholder="e.g. $5k+" style={{ textAlign: 'center', background: 'var(--bg-subtle)' }} />
            </div>
          </div>
          <button className="btn-gold" style={{ width: '100%', padding: '20px' }} onClick={() => setOnboardingStep(2)}>Continue to Brand Sync</button>
        </div>
      )}

      {onboardingStep === 2 && (
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '20px', marginBottom: '40px', lineHeight: '1.5' }}>We'll scan your website to extract your brand identity, messaging, and current target positioning.</p>
          <div className="field-group" style={{ marginBottom: '40px' }}>
            <label className="field-label">Your Website URL</label>
            <input value={appData.websiteUrl} onChange={e => updateData('websiteUrl', e.target.value)} className="field-input" placeholder="https://yourcompany.com" style={{ textAlign: 'center', fontSize: '24px', background: 'var(--bg-subtle)', borderRadius: '18px', padding: '20px' }} />
          </div>
          <button className="btn-gold" style={{ width: '100%', padding: '20px' }} onClick={scanWebsite}>Scan Website & Sync Assets</button>
        </div>
      )}

      {onboardingStep === 3 && (
        <div style={{ textAlign: 'left' }}>
          <div className="research-card" style={{ background: '#fff', border: '1px solid var(--border)', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            
            <div className="field-label" style={{ color: 'var(--accent)' }}>Brand Audit Complete</div>
            <h3 style={{ fontSize: '28px', fontWeight: '700', margin: '15px 0', color: 'var(--text)' }}>
              We think your target audience is:
            </h3>
            
            <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: '12px', marginBottom: '20px', fontSize: '18px', fontWeight: '500', lineHeight: '1.5' }}>
              {appData.websiteTarget || "Enterprise CFOs"}
            </div>

            {/* THE FEEDBACK QUESTION */}
            {!targetFeedback && (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '15px' }}>Is this what you expected?</p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button className="btn-gold" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 20px' }} onClick={() => setTargetFeedback('no')}>
                    No, suggest changes
                  </button>
                  <button className="btn-gold" style={{ padding: '10px 20px' }} onClick={() => setTargetFeedback('yes')}>
                    Yes, this is accurate
                  </button>
                </div>
              </div>
            )}

            {/* IF THEY CLICK NO */}
            {targetFeedback === 'no' && (
              <div style={{ padding: '20px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '12px', marginBottom: '20px' }}>
                <p style={{ color: '#cf1322', fontWeight: '600', marginBottom: '10px' }}>Let's fix that. Who are you actually trying to target?</p>
                <input 
                  className="field-input" 
                  style={{ background: '#fff', borderColor: '#ffa39e' }}
                  placeholder="e.g., Enterprise CTOs" 
                  onChange={(e) => updateData('websiteTarget', e.target.value)} 
                />
              </div>
            )}

            {/* REVEAL CRM STEP ONLY AFTER THEY ANSWER */}
            {targetFeedback && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '30px 0' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '15px 0', color: 'var(--text)' }}>
                  Great. Now let's compare that to your CRM.
                </h3>
                <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                  Upload your historical closed-won deals to see who is *actually* buying.
                </p>

                <div className="dropzone-area" style={{ background: 'rgba(0,113,227,0.05)', border: '1px dashed var(--accent)', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: appData.crmContext ? 'var(--gold)' : 'var(--accent)' }}>
                    {appData.crmContext ? `✅ ${appData.crmFileName} Loaded` : "CONNECT CRM TO ENRICH DATA (.csv)"}
                  </span>
                  <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleCSVUpload} />
                </div>
                
                <button className="btn-gold" style={{ width: '100%', marginTop: '30px', padding: '20px' }} onClick={startResearch}>
                  Find the Intelligence Gap →
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}