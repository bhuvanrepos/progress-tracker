import React, { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, Mail, Save, LogOut } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [targetScore, setTargetScore] = useState('');
  const [college, setCollege] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load profile from firestore
        const docRef = doc(db, 'users', currentUser.uid, 'profile', 'details');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTargetScore(data.targetScore || '');
          setCollege(data.college || '');
          setPassingYear(data.passingYear || '');
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaveStatus('Saving...');
    try {
      await setDoc(doc(db, 'users', user.uid, 'profile', 'details'), {
        targetScore,
        college,
        passingYear,
        updatedAt: new Date()
      }, { merge: true });
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving profile', error);
      setSaveStatus('Error saving');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading settings...</div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '800px' }}>
      <h2 className="text-h2">Account Settings</h2>
      
      {!user ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <User size={32} color="var(--text-muted)" />
          </div>
          <h3 className="text-h3" style={{ marginBottom: '8px' }}>Sign in to sync your data</h3>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Connecting to Firebase allows you to access your dashboard from anywhere.</p>
          <button onClick={handleLogin} className="btn btn-primary" style={{ margin: '0 auto' }}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          <div className="glass-panel flex-row items-center justify-between" style={{ padding: '24px' }}>
            <div className="flex-row items-center gap-4">
              {!imageError && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  onError={() => setImageError(true)}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--border-glass)', objectFit: 'cover', background: '#334155' }} 
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-glass)' }}>
                  <User size={32} color="#fff" />
                </div>
              )}
              <div>
                <h3 className="text-h3">{user.displayName}</h3>
                <div className="text-muted flex-row items-center gap-2" style={{ marginTop: '4px' }}>
                  <Mail size={14} /> {user.email}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
              <LogOut size={16} /> Sign out
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 className="text-h3" style={{ marginBottom: '24px' }}>Preparation Profile</h3>
            
            <form onSubmit={handleSaveProfile} className="flex-col gap-4">
              <div className="flex-col gap-2">
                <label className="text-muted text-small">Target GATE Score / Rank</label>
                <input 
                  type="text" 
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  placeholder="e.g., Under 100 Rank"
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="flex-col gap-2">
                  <label className="text-muted text-small">Current College</label>
                  <input 
                    type="text" 
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Enter college name"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div className="flex-col gap-2">
                  <label className="text-muted text-small">Year of Passing</label>
                  <input 
                    type="text" 
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    placeholder="e.g., 2026"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <span style={{ color: saveStatus.includes('Error') ? '#ef4444' : 'var(--accent-revision)', fontSize: '0.9rem' }}>
                  {saveStatus}
                </span>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
