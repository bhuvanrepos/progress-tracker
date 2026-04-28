import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, isBefore, isSameDay } from 'date-fns';

export default function DetailedAnalytics({ trackerData }) {
  // Phase 1 constraints: May 2026
  const startDate = new Date('2026-05-01T00:00:00');
  const endDate = new Date('2026-06-01T00:00:00');
  const today = new Date();

  // Generate stats and chart data
  const { chartData, streaks, tableData } = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let currentAttendance = 0;
    let maxAttendance = 0;
    let currentCompletion = 0;
    let maxCompletion = 0;

    const cData = [];
    const tData = [];

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const tasks = trackerData[dateStr] || [];
      const total = tasks.length;
      const completedCount = tasks.filter(t => t.completed).length;
      const notCompletedCount = total - completedCount;
      const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

      // Streak Logic (Only evaluate up to 'today' or days with tasks)
      if (isBefore(day, today) || isSameDay(day, today)) {
        if (total > 0 && completedCount > 0) {
          currentAttendance++;
          maxAttendance = Math.max(maxAttendance, currentAttendance);
        } else {
          currentAttendance = 0; // Reset if no tasks attended
        }

        if (total > 0 && completedCount === total) {
          currentCompletion++;
          maxCompletion = Math.max(maxCompletion, currentCompletion);
        } else {
          currentCompletion = 0;
        }
      }

      cData.push({
        name: format(day, 'MMM dd'),
        completion: percent
      });

      tData.push({
        date: format(day, 'MMM dd'),
        completed: completedCount,
        notCompleted: notCompletedCount,
        percent: percent
      });
    });

    return { 
      chartData: cData, 
      streaks: { currentAttendance, maxAttendance, currentCompletion, maxCompletion },
      tableData: tData 
    };
  }, [trackerData]);

  return (
    <div className="flex-col gap-6 animate-fade-in">
      
      {/* Streaks Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderColor: 'var(--accent-coding)' }}>
          <div className="text-muted">Current Attendance</div>
          <div className="glow-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streaks.currentAttendance} <span style={{fontSize:'1rem'}}>Days</span></div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="text-muted">Best Attendance</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streaks.maxAttendance} <span style={{fontSize:'1rem'}}>Days</span></div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderColor: 'var(--accent-gate)' }}>
          <div className="text-muted">Current 100% Completion</div>
          <div className="glow-text" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gate)' }}>{streaks.currentCompletion} <span style={{fontSize:'1rem'}}>Days</span></div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="text-muted">Best 100% Completion</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streaks.maxCompletion} <span style={{fontSize:'1rem'}}>Days</span></div>
        </div>
      </div>

      {/* Area Chart matching the user's picture */}
      <div className="glass-panel" style={{ padding: '24px', height: '300px' }}>
        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Daily Completion (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-glass)', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="completion" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Data Table matching the user's picture */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Completion Breakdown</h3>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border-glass)', textAlign: 'left', width: '120px' }}>Metric</th>
              {tableData.slice(0, 14).map((d, i) => (
                <th key={i} style={{ padding: '12px', borderBottom: '1px solid var(--border-glass)', fontWeight: 'normal', color: 'var(--text-muted)' }}>{d.date.split(' ')[1]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', fontWeight: 'bold' }}>Completed</td>
              {tableData.slice(0, 14).map((d, i) => (
                <td key={i} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{d.completed}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-muted)' }}>Not Completed</td>
              {tableData.slice(0, 14).map((d, i) => (
                <td key={i} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{d.notCompleted}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>% Completed</td>
              {tableData.slice(0, 14).map((d, i) => (
                <td key={i} style={{ 
                  padding: '12px', 
                  color: d.percent === 100 ? 'var(--accent-revision)' : (d.percent > 0 ? 'var(--accent-coding)' : 'var(--text-main)'),
                  background: d.percent > 0 ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}>{d.percent}%</td>
              ))}
            </tr>
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Showing first 14 days of Phase 1 (Scroll to see more in future updates)
        </div>
      </div>
    </div>
  );
}
