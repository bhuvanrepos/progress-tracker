import React from 'react';

export default function WelcomeScreen({ onComplete }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }} className="animate-fade-in">
      <h1 className="welcome-title" style={{ 
        fontFamily: "'Dancing Script', cursive", 
        fontSize: '3.5rem', 
        lineHeight: '1.4',
        maxWidth: '800px',
        marginBottom: '16px',
        color: 'var(--text-main)',
        textShadow: '0 0 20px rgba(255,255,255,0.2)'
      }}>
        "I fail sometimes, I succeed sometimes, so that's fair enough. It's a package deal"
      </h1>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '1.2rem',
        color: 'var(--text-muted)',
        marginBottom: '48px',
        fontStyle: 'italic'
      }}>
        — Sachin Ramesh Tendulkar
      </div>
      
      <button 
        onClick={onComplete}
        className="btn btn-primary"
        style={{ fontSize: '1.2rem', padding: '16px 32px', borderRadius: '30px' }}
      >
        Enter Dashboard
      </button>
    </div>
  );
}
