import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function TaskTracker({ dayOfWeek, mode }) {
  const [tasks, setTasks] = useState([]);
  const dateKey = format(new Date(), 'yyyy-MM-dd'); // Unique key for today

  // Load tasks dynamically based on the day
  useEffect(() => {
    let dailyTasks = [];
    if (dayOfWeek >= 1 && dayOfWeek <= 3) {
      dailyTasks = [
        { id: 't1', text: 'Complete 1 chapter of language basics', completed: false },
        { id: 't2', text: 'Solve 2 easy & 1 medium DSA problems', completed: false },
        { id: 't3', text: 'Watch 1 hour of Web Dev course', completed: false },
        { id: 't4', text: 'Build a small UI component', completed: false }
      ];
    } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
      dailyTasks = [
        { id: 't1', text: 'Study 2 hours of core CSE subject', completed: false },
        { id: 't2', text: 'Practice 30 mins Engg Math/Aptitude', completed: false },
        { id: 't3', text: 'Solve 15 PYQs', completed: false },
        { id: 't4', text: 'Make short notes for the day', completed: false }
      ];
    } else {
      dailyTasks = [
        { id: 't1', text: 'Review short notes of Mon-Wed', completed: false },
        { id: 't2', text: 'Review short notes of Thu-Sat', completed: false },
        { id: 't3', text: 'Attempt a 1-hour topic mock test', completed: false },
        { id: 't4', text: 'Analyze mock test mistakes', completed: false }
      ];
    }

    // Check localStorage
    const saved = localStorage.getItem(`tasks_${dateKey}`);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(dailyTasks);
    }
  }, [dayOfWeek, dateKey]);

  // Handle toggle
  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    localStorage.setItem(`tasks_${dateKey}`, JSON.stringify(updated));
    
    // Also update a general progress counter for the charts
    const totalCompleted = updated.filter(t => t.completed).length;
    localStorage.setItem(`progress_${dateKey}`, (totalCompleted / updated.length) * 100);
    
    // Dispatch custom event to update charts if needed
    window.dispatchEvent(new Event('progressUpdate'));
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', animationDelay: '0.1s' }}>
      <div className="flex-row justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 className="text-h2">Daily Checklist</h2>
        <div style={{ fontWeight: '600', color: 'var(--current-accent)' }}>{progress}% Complete</div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${progress}%`, 
          height: '100%', 
          background: 'var(--current-accent)', 
          boxShadow: '0 0 10px var(--current-glow)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}></div>
      </div>

      <div className="flex-col gap-4">
        {tasks.map(task => (
          <label key={task.id} className="glass-panel flex-row items-center gap-4" style={{ padding: '16px', cursor: 'pointer', background: task.completed ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: task.completed ? 0.7 : 1 }}>
            <input 
              type="checkbox" 
              className="custom-checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)} 
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', transition: 'all 0.2s', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
              {task.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
