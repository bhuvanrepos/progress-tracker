import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

export default function ProgressAnalytics() {
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateKey = format(d, 'yyyy-MM-dd');
      const prog = localStorage.getItem(`progress_${dateKey}`);
      data.push({
        day: format(d, 'EEE'), // Mon, Tue, etc
        progress: prog ? parseFloat(prog) : 0
      });
    }
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
    // Listen for progress updates from TaskTracker
    window.addEventListener('progressUpdate', loadHistory);
    return () => window.removeEventListener('progressUpdate', loadHistory);
  }, []);

  const overallAvg = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.progress, 0) / history.length) 
    : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', animationDelay: '0.2s' }}>
      <h2 className="text-h2" style={{ marginBottom: '8px' }}>Analytics</h2>
      <p className="text-muted" style={{ marginBottom: '24px' }}>Your consistency over the last 7 days</p>

      <div className="flex-row items-center gap-6" style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          {/* Simple CSS Circular Progress */}
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--current-accent)" strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * overallAvg) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {overallAvg}%
          </div>
        </div>
        <div>
          <h3 className="text-h3">Weekly Average</h3>
          <p className="text-muted">Keep up the momentum!</p>
        </div>
      </div>

      <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px', borderBottom: '1px solid var(--border-glass)' }}>
        {history.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '100%', 
              background: 'var(--current-accent)', 
              height: `${h.progress}%`,
              minHeight: '4px',
              borderRadius: '4px 4px 0 0',
              opacity: h.progress === 0 ? 0.3 : 1,
              transition: 'height 0.5s ease',
              boxShadow: h.progress > 0 ? '0 0 10px var(--current-glow)' : 'none'
            }}></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
        {history.map((h, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {h.day}
          </div>
        ))}
      </div>
    </div>
  );
}
