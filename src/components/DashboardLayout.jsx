import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  CheckCircle, 
  Settings, 
  LogOut,
  LogIn,
  CalendarDays,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { auth, db, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

import CalendarView from './CalendarView';
import DetailedAnalytics from './DetailedAnalytics';
import Blockers from './Blockers';
import SettingsView from './Settings';

const TARGET_DATE = new Date('2026-06-01T00:00:00');

export default function DashboardLayout() {
  const [currentDate] = useState(new Date()); 
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState(null);
  
  // Real State Engine (Syncs with Firebase)
  const [trackerData, setTrackerData] = useState({});

  // 1. Listen for Authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load all tasks from Firestore for this user
        const daysRef = collection(db, 'users', currentUser.uid, 'days');
        const snapshot = await getDocs(daysRef);
        
        const loadedData = {};
        snapshot.forEach(doc => {
          loadedData[doc.id] = doc.data().tasks || [];
        });
        
        setTrackerData(loadedData);

        // Sync local attendance to cloud
        const today = format(new Date(), 'yyyy-MM-dd');
        const localAttendance = localStorage.getItem(`attendance_${today}`);
        const attendanceRef = doc(db, 'users', currentUser.uid, 'attendance', today);
        
        if (localAttendance) {
          // Push local mood to cloud
          await setDoc(attendanceRef, { mood: localAttendance, date: today }, { merge: true });
        } else {
          // Pull cloud mood to local (for cross-device sync)
          const attSnap = await getDoc(attendanceRef);
          if (attSnap.exists() && attSnap.data().mood) {
            localStorage.setItem(`attendance_${today}`, attSnap.data().mood);
          }
        }
      } else {
        // Fallback to empty if logged out
        setTrackerData({});
      }
    });
    return unsubscribe;
  }, []);

  // 2. Function to Update State AND Firebase simultaneously
  const updateTrackerData = async (dateStr, tasks) => {
    // Optimistic UI update (feels instant to the user)
    setTrackerData(prev => ({ ...prev, [dateStr]: tasks }));

    // Save to Firebase Cloud
    if (user) {
      try {
        const dayDocRef = doc(db, 'users', user.uid, 'days', dateStr);
        await setDoc(dayDocRef, { tasks }, { merge: true });
      } catch (error) {
        console.error("Error saving tasks to cloud:", error);
      }
    }
  };

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

  const daysLeft = differenceInDays(TARGET_DATE, currentDate);

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <DetailedAnalytics trackerData={trackerData} />;
      case 'blockers':
        return <Blockers trackerData={trackerData} updateTrackerData={updateTrackerData} currentDate={currentDate} />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return <CalendarView trackerData={trackerData} updateTrackerData={updateTrackerData} />;
    }
  };

  return (
    <div className="app-container mode-coding"> {/* Mode class can be dynamic later */}
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="flex-col gap-6">
          <div className="flex-row items-center gap-2">
            <div className="flex-row items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--current-accent)' }}>
              <Code2 color="#fff" size={24} />
            </div>
            <div>
              <h2 className="text-h3" style={{ margin: 0 }}>Prep<span className="glow-text">Dash</span></h2>
            </div>
          </div>
          
          <nav className="flex-col gap-2" style={{ marginTop: '32px' }}>
            <button 
              className="btn" 
              onClick={() => setActiveView('dashboard')}
              style={{ background: activeView === 'dashboard' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'dashboard' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <CalendarDays size={20} />
              Daily Tracker
            </button>
            <button 
              className="btn"
              onClick={() => setActiveView('analytics')}
              style={{ background: activeView === 'analytics' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'analytics' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <BarChart3 size={20} />
              Analytics
            </button>
            <button 
              className="btn"
              onClick={() => setActiveView('blockers')}
              style={{ background: activeView === 'blockers' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'blockers' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <ShieldAlert size={20} />
              Blockers / Pending
            </button>
            <button 
              className="btn"
              onClick={() => setActiveView('settings')}
              style={{ background: activeView === 'settings' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'settings' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <Settings size={20} />
              Settings
            </button>
          </nav>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', marginBottom: '16px', background: 'rgba(0,0,0,0.3)' }}>
            <div className="text-small">Days until Target (01/06/26)</div>
            <div className="glow-text" style={{ fontSize: '2rem', fontWeight: '700' }}>
              {daysLeft > 0 ? daysLeft : 0}
            </div>
          </div>
          {!user ? (
            <button onClick={handleLogin} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <LogIn size={20} />
              Sign In
            </button>
          ) : (
            <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              <LogOut size={20} />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex-row justify-between items-center glass-panel" style={{ padding: '16px 24px' }}>
          <div className="flex-col">
            <h1 className="text-h2">
              {activeView === 'dashboard' && 'Daily Execution'}
              {activeView === 'analytics' && 'Performance Analytics'}
              {activeView === 'blockers' && 'Pending Tasks'}
              {activeView === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-muted">{format(currentDate, 'EEEE, MMMM do, yyyy')}</p>
          </div>
          <div className="flex-row items-center gap-4">
            <button 
              onClick={() => setActiveView('settings')}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic View Injection */}
        {renderView()}

      </main>
    </div>
  );
}
