import React, { useMemo, useState, useRef } from 'react';
import { ComposedChart, Area, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      const tasks = trackerData[dateStr]?.tasks || [];
      const total = tasks.length;
      const completedCount = tasks.filter(t => t.completed).length;
      const notCompletedCount = total - completedCount;
      const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

      // Streak Logic (Only evaluate up to 'today' or days with tasks)
      if (isBefore(day, today) || isSameDay(day, today)) {
        if (total > 0) {
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

      // Calculate Blockers (Tasks created before 'day' but completed ON 'day')
      const blockersCompletedToday = [];
      Object.entries(trackerData).forEach(([dateKey, data]) => {
        if (new Date(dateKey) < day && dateKey !== dateStr) {
          data.tasks?.forEach(t => {
            if (t.completed && t.completedDate === dateStr) {
              blockersCompletedToday.push({ ...t, originalDate: dateKey });
            }
          });
        }
      });

      const todayTasksCompleted = tasks.filter(t => t.completed);
      const allCompleted = [...todayTasksCompleted, ...blockersCompletedToday];
      const topics = trackerData[dateStr]?.topics || { required: '', optional: '' };

      cData.push({
        name: format(day, 'MMM dd'),
        completion: percent,
        blockerY: blockersCompletedToday.length > 0 ? 100 : null,
        blockers: blockersCompletedToday,
        allTasks: allCompleted,
        topics: topics
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

  const CustomTooltip = ({ active, payload, label }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [cachedPayload, setCachedPayload] = useState(null);
    const [cachedLabel, setCachedLabel] = useState(null);
    const hoverTimeoutRef = useRef(null);

    React.useEffect(() => {
      if (active && payload && payload.length) {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsVisible(true);
        setCachedPayload(payload);
        setCachedLabel(label);
      } else {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
      return () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); };
    }, [active, payload, label]);

    if (!isVisible || !cachedPayload || !cachedPayload.length) return null;

    const data = cachedPayload[0].payload;
    return (
      <div 
        onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
        onMouseLeave={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setIsVisible(false), 2000);
        }}
        className="animate-fade-in"
        style={{ 
          padding: '16px', background: 'rgba(10, 14, 20, 0.98)', border: '1px solid var(--border-glass)', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', width: '300px', maxHeight: '350px', overflowY: 'auto', pointerEvents: 'auto'
        }}
      >
        <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '1.2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', position: 'sticky', top: '-16px', background: 'rgba(10, 14, 20, 0.98)', zIndex: 2, paddingTop: '16px' }}>{cachedLabel}</p>
        <p style={{ color: '#10b981', margin: '0 0 12px 0', fontWeight: '500' }}>Completion: {data.completion}%</p>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '6px' }}>Topics:</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Required: {data.topics?.required || 'None'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Optional: {data.topics?.optional || 'None'}</div>
        </div>

        {data.allTasks?.length > 0 ? (
          <div>
            <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '8px' }}>Tasks Completed:</div>
            {data.allTasks.map(t => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: t.originalDate ? '3px solid #3b82f6' : '3px solid #10b981' }}>
                {t.type === 'video' ? (
                  <div style={{ color: 'var(--text-main)', fontWeight: '500', marginBottom: '4px' }}>Video Title: {t.text}</div>
                ) : (
                  <div style={{ color: 'var(--text-main)', fontWeight: '500', marginBottom: '4px' }}>Task: {t.text}</div>
                )}
                
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2px' }}>Topic: {t.topic || 'N/A'}</div>
                
                {t.type === 'video' && t.link && (
                  <div style={{ color: 'var(--current-accent)', fontSize: '0.85rem', marginBottom: '2px', wordBreak: 'break-all' }}>Video URL: <a href={t.link} target="_blank" rel="noreferrer" style={{color:'inherit'}}>{t.link}</a></div>
                )}
                
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2px' }}>Time Taken: {t.actualDuration || t.duration}</div>
                <div style={{ color: '#eab308', fontSize: '0.85rem' }}>Status: Completed</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No tasks completed this day.</div>
        )}
      </div>
    );
  };

  const CustomBlockerDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.blockerY) return null;
    return (
      <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' }} />
    );
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      
      {/* Streaks Header */}
      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
      <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Daily Completion (%) & Blockers</h3>
        
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={chartData} 
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                wrapperStyle={{ visibility: 'visible', pointerEvents: 'auto', zIndex: 100 }}
              />
              
              <Area type="monotone" dataKey="completion" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
              <Line type="monotone" dataKey="blockerY" stroke="none" dot={<CustomBlockerDot />} activeDot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
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
