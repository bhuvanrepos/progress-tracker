import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

export default function CheckActivities({ trackerData }) {
  const activityDays = useMemo(() => {
    const days = [];
    Object.entries(trackerData).forEach(([dateStr, data]) => {
      // Find all completed tasks exactly on this date
      const completedToday = (data.tasks || []).filter(t => t.completed);
      
      // Find blockers completed on this date
      const blockersCompletedToday = [];
      Object.entries(trackerData).forEach(([bDateStr, bData]) => {
        if (bDateStr < dateStr) {
          (bData.tasks || []).forEach(t => {
            if (t.completed && t.completedDate === dateStr) {
              blockersCompletedToday.push({ ...t, originalDate: bDateStr });
            }
          });
        }
      });

      const allCompleted = [...completedToday, ...blockersCompletedToday];
      const percent = data.tasks?.length ? Math.round((completedToday.length / data.tasks.length) * 100) : 0;

      if (allCompleted.length > 0 || (data.topics && (data.topics.required || data.topics.optional))) {
        days.push({
          dateStr,
          displayDate: format(parseISO(dateStr), 'MMM dd, yyyy'),
          completion: percent,
          allTasks: allCompleted,
          topics: data.topics || { required: '', optional: '' }
        });
      }
    });

    // Sort by date descending
    return days.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [trackerData]);

  if (activityDays.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No activities found. Complete some tasks to see your history!
      </div>
    );
  }

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <h2 className="text-h2">Activity Log</h2>
      <p className="text-muted">A chronological timeline of your completed daily targets and topics.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {activityDays.map((day) => (
          <div key={day.dateStr} className="glass-panel hover-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-coding)' }}>{day.displayDate}</h3>
              <p style={{ color: '#10b981', margin: '4px 0 0 0', fontWeight: '500' }}>Completion: {day.completion}%</p>
            </div>
            
            <div>
              <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '6px' }}>Topics:</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Required: {day.topics.required || 'None'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Optional: {day.topics.optional || 'None'}</div>
            </div>

            {day.allTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Tasks Completed:</div>
                {day.allTasks.map(t => (
                  <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', borderLeft: t.originalDate ? '3px solid #3b82f6' : '3px solid #10b981' }}>
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
        ))}
      </div>
    </div>
  );
}
