import React from 'react';
import { isBefore, startOfDay, parseISO, format } from 'date-fns';
import { AlertCircle, Clock, Link as LinkIcon } from 'lucide-react';

export default function Blockers({ trackerData, updateTrackerData, currentDate }) {
  
  // Extract all pending tasks from dates BEFORE today
  const pendingTasks = [];
  
  Object.keys(trackerData).forEach(dateStr => {
    const dateObj = parseISO(dateStr);
    // If the task date is strictly before today
    if (isBefore(startOfDay(dateObj), startOfDay(currentDate))) {
      const tasks = trackerData[dateStr];
      tasks.forEach(task => {
        if (!task.completed) {
          pendingTasks.push({
            ...task,
            originalDateStr: dateStr,
            displayDate: format(dateObj, 'MMM do, yyyy')
          });
        }
      });
    }
  });

  // Sort by oldest first
  pendingTasks.sort((a, b) => parseISO(a.originalDateStr).getTime() - parseISO(b.originalDateStr).getTime());

  const markComplete = (taskId, dateStr) => {
    const dayTasks = trackerData[dateStr];
    const updated = dayTasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
    updateTrackerData(dateStr, updated);
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle color="#ef4444" size={28} />
          <div>
            <h2 className="text-h2" style={{ color: '#ef4444' }}>Blockers & Pending Tasks</h2>
            <p className="text-muted">These tasks were scheduled for previous days but were not completed. They will remain here until you mark them done.</p>
          </div>
        </div>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h2 className="text-h2">You're all caught up!</h2>
          <p className="text-muted">No pending blockers from previous days.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {pendingTasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    MISSED: {task.displayDate}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.type}</span>
                </div>
                
                <h3 className="text-h3" style={{ marginBottom: '8px' }}>{task.text}</h3>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {task.duration}</span>
                  {task.link && (
                    <a href={task.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-coding)', textDecoration: 'none' }}>
                      <LinkIcon size={14} /> Watch Lecture
                    </a>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => markComplete(task.id, task.originalDateStr)}
              >
                Mark Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
