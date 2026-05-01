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
  ShieldAlert,
  Menu
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
          loadedData[doc.id] = doc.data() || { tasks: [] };
        });
        
        // MOCK DATA INJECTION FOR MAY 1st BLOCKER (from April 30th)
        if (!loadedData['2026-04-30']) loadedData['2026-04-30'] = { tasks: [] };
        // Check if it already exists to prevent duplicates on multiple loads
        if (!loadedData['2026-04-30'].tasks.find(t => t.id === 'mock-g1')) {
          loadedData['2026-04-30'].tasks.push({
            id: 'mock-g1',
            text: 'g1',
            type: 'task',
            duration: '01h00m00s',
            topic: 'required',
            completed: true,
            completedDate: '2026-05-01',
            originalDate: '2026-04-30'
          });
        }
        
        setTrackerData(loadedData);

      } else {
        // Fallback mock data if logged out
        setTrackerData({
          '2026-04-30': {
             tasks: [
               { id: 'mock-g1', text: 'g1', type: 'task', duration: '01h00m00s', topic: 'required', completed: true, completedDate: '2026-05-01', originalDate: '2026-04-30' }
             ]
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // 2. Function to Update State AND Firebase simultaneously
  const updateTrackerData = async (dateStr, payload) => {
    // Optimistic UI update (feels instant to the user)
    setTrackerData(prev => ({ ...prev, [dateStr]: payload }));

    // Save to Firebase Cloud
    if (user) {
      try {
        const dayDocRef = doc(db, 'users', user.uid, 'days', dateStr);
        await setDoc(dayDocRef, payload, { merge: true });
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
    window.location.reload();
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
        return <CalendarView trackerData={trackerData} updateTrackerData={updateTrackerData} user={user} handleLogin={handleLogin} />;
    }
  };

  return (
    <div className="app-container mode-coding"> {/* Mode class can be dynamic later */}
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
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
              onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }}
              style={{ background: activeView === 'dashboard' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'dashboard' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <CalendarDays size={20} />
              Daily Tracker
            </button>
            <button 
              className="btn"
              onClick={() => { setActiveView('analytics'); setIsSidebarOpen(false); }}
              style={{ background: activeView === 'analytics' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'analytics' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <BarChart3 size={20} />
              Analytics
            </button>
            <button 
              className="btn"
              onClick={() => { setActiveView('blockers'); setIsSidebarOpen(false); }}
              style={{ background: activeView === 'blockers' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', borderColor: activeView === 'blockers' ? 'var(--current-accent)' : 'var(--border-glass)' }}
            >
              <ShieldAlert size={20} />
              Blockers / Pending
            </button>
            <button 
              className="btn"
              onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); }}
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
          <div className="flex-row items-center gap-4">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex-col">
              <h1 className="text-h2">
                {activeView === 'dashboard' && 'Daily Execution'}
                {activeView === 'analytics' && 'Performance Analytics'}
                {activeView === 'blockers' && 'Pending Tasks'}
                {activeView === 'settings' && 'Account Settings'}
              </h1>
              <p className="text-muted">{format(currentDate, 'EEEE, MMMM do, yyyy')}</p>
            </div>
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
