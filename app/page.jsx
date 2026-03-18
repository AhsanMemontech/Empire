"use client";
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  
  // --- LIFTED STATE: Now the Master Page knows what step we are on! ---
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [dashboardStep, setDashboardStep] = useState(3);
  
  // Global App Data
  const [appData, setAppData] = useState({
    businessModel: 'B2B', bizDesc: '', industry: '', pricePoint: '', websiteUrl: '', crmContext: '', crmFileName: ''
  });
  
  // AI Results Data
  const [researchData, setResearchData] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [strategy, setStrategy] = useState(null);

  // Global Loader State
  const [isLoading, setIsLoading] = useState(false);
  const [loaderStage, setLoaderStage] = useState('');
  const [loaderDetail, setLoaderDetail] = useState('');

  // Setup Session
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setView('onboarding');
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('login');
    // Optional: Reset steps so it starts fresh next time
    setOnboardingStep(1); 
    setDashboardStep(3);
  };

  // Universal Claude Call
  const callClaude = async (sys, userPrompt) => {
    const res = await fetch('/api/claude', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ system: sys, user: userPrompt }) 
    });
    
    if(!res.ok) throw new Error("API Connection Failed");
    
    const data = await res.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    try {
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (err) {
      console.error("Claude did not return valid JSON. Claude's response was:", text);
      throw new Error("Invalid JSON from AI");
    }
  };

  const startLoader = (stage, detail) => {
    setLoaderStage(stage);
    setLoaderDetail(detail);
    setIsLoading(true);
  };
  const stopLoader = () => setIsLoading(false);

  // --- RENDER ---
  if (view === 'login') return <Auth setView={setView} setUser={setUser} />;

  return (
    <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      
      {/* GLOBAL HEADER */}
      <div className="header" style={{ marginBottom: '40px' }}>
        {/* LOGOUT BUTTON */}
        {/* {user && (
          <button 
            onClick={handleLogout} 
            style={{ position: 'absolute', top: '10', right: '0', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Log out
          </button>
        )} */}
        <div className="header-badge" style={{ marginBottom: '24px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
          Empire — Persona Engine
        </div>
        <h1 style={{ fontSize: '64px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: '1.1', color: 'var(--text)' }}>
          {view === 'onboarding' ? "Setup Engine." : "Know your Buyer."}
        </h1>
      </div>

      {/* GLOBAL PROGRESS TRACKER (Dynamic!) */}
      <div className="progress-track" style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        {['Intake', 'Research', 'Confirm', 'Personas', 'Strategy'].map((step, i) => {
          let currentIndex = 0;
          if (view === 'onboarding') {
            if (onboardingStep === 1) currentIndex = 0; 
            if (onboardingStep === 2 || onboardingStep === 3) currentIndex = 1; 
          } else if (view === 'dashboard') {
            if (isLoading) currentIndex = 1; 
            else if (dashboardStep === 3) currentIndex = 2; 
            else if (dashboardStep === 4) currentIndex = 3; 
            else if (dashboardStep === 5) currentIndex = 4; 
          }

          let className = "prog-step";
          if (i === currentIndex) className += " active";
          else if (i < currentIndex) className += " done";

          return (
            <div 
              key={i} 
              className={className} 
              style={{ 
                fontSize: '13px', 
                fontWeight: '500', 
                color: i === currentIndex ? 'var(--text)' : 'var(--muted)',
                borderBottom: i === currentIndex ? '2px solid var(--gold)' : '2px solid transparent',
                paddingBottom: '8px',
                transition: 'all 0.3s ease' 
              }}
            >
              {step}
            </div>
          );
        })}
      </div>

      {/* GLOBAL LOADER */}
      {isLoading && (
        <div id="loading" style={{ padding: '100px 0', width: '100%' }}>
          <div className="loader-ring" style={{ width: '40px', height: '40px', border: '3px solid var(--bg-subtle)', borderTopColor: 'var(--gold)', margin: '0 auto 24px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div id="loader-stage" style={{ fontWeight: '600', color: 'var(--text)', textTransform: 'uppercase' }}>{loaderStage}</div>
          <div id="loader-detail" style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>{loaderDetail}</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ROUTING CONTROL */}
      {view === 'onboarding' && (
        <div style={{ display: isLoading ? 'none' : 'flex', width: '100%', justifyContent: 'center' }}>
          <Onboarding 
            setView={setView} user={user} 
            appData={appData} setAppData={setAppData} setResearchData={setResearchData} 
            startLoader={startLoader} stopLoader={stopLoader} callClaude={callClaude}
            onboardingStep={onboardingStep} setOnboardingStep={setOnboardingStep}
          />
        </div>
      )}

      {view === 'dashboard' && (
        <div style={{ display: isLoading ? 'none' : 'flex', width: '100%', justifyContent: 'center' }}>
          <Dashboard 
            user={user} appData={appData} 
            researchData={researchData} 
            personas={personas} setPersonas={setPersonas} 
            strategy={strategy} setStrategy={setStrategy} 
            startLoader={startLoader} stopLoader={stopLoader} callClaude={callClaude}
            dashboardStep={dashboardStep} setDashboardStep={setDashboardStep}
          />
        </div>
      )}
    </div>
  );
}