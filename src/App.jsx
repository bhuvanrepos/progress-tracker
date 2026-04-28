import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import DashboardLayout from './components/DashboardLayout'
import WelcomeScreen from './components/WelcomeScreen'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasAttended, setHasAttended] = useState(false);
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const attendance = localStorage.getItem(`attendance_${today}`);
    if (attendance) {
      setHasAttended(true);
    }
  }, []);

  if (!authResolved) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Initializing...</div>;
  }

  if (showWelcome) {
    return <WelcomeScreen hasAttended={hasAttended} user={user} onComplete={() => setShowWelcome(false)} />
  }

  return (
    <DashboardLayout />
  )
}

export default App
