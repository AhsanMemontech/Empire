"use client";
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ setView, setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMessage, setAuthMessage] = useState({ text: '', type: '' });
  const loginEmailRef = useRef(null);
  const loginPassRef = useRef(null);

  const handleAuth = async () => {
    const email = loginEmailRef.current?.value;
    const password = loginPassRef.current?.value;
    setAuthMessage({ text: '', type: '' });

    if (!email || !password) {
      return setAuthMessage({ text: "Please fill in all fields.", type: 'error' });
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthMessage({ text: error.message, type: 'error' });
      else {
        setAuthMessage({ text: "✅ Account created! Please check your email to confirm, then sign in below.", type: 'success' });
        setIsSignUp(false);
        loginPassRef.current.value = '';
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthMessage({ text: error.message, type: 'error' });
      else {
        setUser(data.user);
        setView('onboarding');
      }
    }
  };

  return (
    <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div className="header-badge" style={{ marginBottom: '24px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
          Empire Intelligence
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          {isSignUp ? "Create account." : "Sign in."}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '30px', fontSize: '18px' }}>
          {isSignUp ? "Start building your brand engine." : "Enter your credentials to access the engine."}
        </p>

        {authMessage.text && (
          <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.4', textAlign: 'left', background: authMessage.type === 'error' ? '#fff1f0' : '#f6ffed', border: `1px solid ${authMessage.type === 'error' ? '#ffa39e' : '#b7eb8f'}`, color: authMessage.type === 'error' ? '#cf1322' : '#389e0d' }}>
            {authMessage.text}
          </div>
        )}
        
        <div className="field-group" style={{ marginBottom: '15px' }}>
          <input ref={loginEmailRef} className="field-input" placeholder="Email" style={{ background: 'var(--bg-subtle)' }} />
        </div>
        <div className="field-group" style={{ marginBottom: '30px' }}>
          <input ref={loginPassRef} className="field-input" type="password" placeholder="Password" style={{ background: 'var(--bg-subtle)' }} />
        </div>
        
        <button className="btn-gold" style={{ width: '100%', padding: '18px' }} onClick={handleAuth}>
          {isSignUp ? "Sign Up" : "Continue"}
        </button>
        
        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
          {isSignUp ? "Already have an account?" : "New to Empire?"}{" "}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }} onClick={() => { setIsSignUp(!isSignUp); setAuthMessage({ text: '', type: '' }); }}>
            {isSignUp ? "Sign in" : "Create account"}
          </span>
        </p>
      </div>
    </div>
  );
}