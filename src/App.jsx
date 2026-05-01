import React, { useState, useEffect } from 'react'
import DashboardLayout from './components/DashboardLayout'
import WelcomeScreen from './components/WelcomeScreen'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthResolved(true);
    });
    
    return unsubscribe;
  }, []);

  if (!authResolved) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Initializing...</div>;
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />
  }

  return (
    <DashboardLayout />
  )
}

export default App
