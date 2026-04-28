import React, { useState } from 'react';
import { format } from 'date-fns';
import { auth, provider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function WelcomeScreen({ hasAttended, user, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleBegin = () => {
    if (hasAttended) {
      onComplete();
    } else {
      if (user) {
        setStep(2); // Skip login if already logged in
      } else {
        setStep(1.5); // Ask for login
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
      setStep(2); // Proceed to mood after login
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Save locally
    localStorage.setItem(`attendance_${today}`, mood);
    
    // Save to Firestore if logged in
    if (auth.currentUser) {
      const attendanceRef = doc(db, 'users', auth.currentUser.uid, 'attendance', today);
      await setDoc(attendanceRef, { mood: mood, date: today }, { merge: true });
    }
    
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  if (step === 1) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }} className="animate-fade-in">
        <h1 style={{ 
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
          onClick={handleBegin}
          className="btn btn-primary"
          style={{ fontSize: '1.2rem', padding: '16px 32px', borderRadius: '30px' }}
        >
          {hasAttended ? 'Resume your work' : 'Begin your day'}
        </button>
      </div>
    );
  }

  if (step === 1.5) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }} className="animate-fade-in">
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Secure Your Progress</h2>
        <p className="text-muted" style={{ marginBottom: '40px', maxWidth: '400px' }}>Sign in to ensure your daily attendance and tasks are saved to the cloud.</p>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="btn btn-primary"
          style={{ fontSize: '1.1rem', padding: '12px 24px', borderRadius: '8px' }}
        >
          {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }} className="animate-fade-in">
      <h2 className="text-h1" style={{ marginBottom: '16px' }}>What is your mood today?</h2>
      <p className="text-muted" style={{ marginBottom: '40px' }}>Select how you're feeling to mark today's attendance.</p>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '🚀', label: 'Highly Motivated' },
          { emoji: '😊', label: 'Good' },
          { emoji: '😐', label: 'Neutral' },
          { emoji: '😫', label: 'Tired' },
          { emoji: '🌧️', label: 'Struggling' },
        ].map((m) => (
          <button
            key={m.label}
            onClick={() => handleMoodSelect(m.label)}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: selectedMood === m.label ? '2px solid var(--accent-coding)' : '1px solid var(--border-glass)',
              background: selectedMood === m.label ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-glass)',
              transform: selectedMood === m.label ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <span style={{ fontSize: '3rem' }}>{m.emoji}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
