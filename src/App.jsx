import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import DashboardLayout from './components/DashboardLayout'
import WelcomeScreen from './components/WelcomeScreen'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasAttended, setHasAttended] = useState(false);
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check local memory first
    const localAttendance = localStorage.getItem(`attendance_${today}`);
    if (localAttendance) {
      setHasAttended(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If logged in but local memory is empty, fetch from cloud for cross-device sync
      if (currentUser && !localAttendance) {
        try {
          const attendanceRef = doc(db, 'users', currentUser.uid, 'attendance', today);
          const attSnap = await getDoc(attendanceRef);
          if (attSnap.exists() && attSnap.data().mood) {
            localStorage.setItem(`attendance_${today}`, attSnap.data().mood);
            setHasAttended(true);
          }
        } catch (error) {
          console.error("Failed to sync attendance:", error);
        }
      }
      
      setAuthResolved(true);
    });
    
    return unsubscribe;
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
