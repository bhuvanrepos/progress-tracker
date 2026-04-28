import React, { useState } from 'react';
import { format, startOfMonth, getDaysInMonth, addDays, getDay } from 'date-fns';
import { PlusCircle, Link as LinkIcon, Clock } from 'lucide-react';

export default function CalendarView({ trackerData, updateTrackerData }) {
  // Phase 1 constraints: May 2026
  const may2026 = new Date('2026-05-01T00:00:00');
  const [selectedDate, setSelectedDate] = useState(may2026);
  
  // Form State
  const [subject1, setSubject1] = useState('');
  const [subject2, setSubject2] = useState('');
  const [taskDuration, setTaskDuration] = useState('1h');
  const [taskLink, setTaskLink] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = getDay(selectedDate);
  const tasksForDay = trackerData[dateStr] || [];

  // Logic for Dynamic Form labels based on day
  let modeLabel = 'Revision Day';
  let headerLabel = "Today's Revision";
  let sub1Placeholder = 'Primary Revision Topic (Required)';
  let sub2Placeholder = 'Secondary Revision Topic (Optional)';

  if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    modeLabel = 'Coding & Web Dev';
    headerLabel = "Today's Learning Language";
    sub1Placeholder = 'Primary Language / Topic (Required)';
    sub2Placeholder = 'Secondary Language / Topic (Optional)';
  } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
    modeLabel = 'GATE Prep';
    headerLabel = "Today's GATE Prep";
    sub1Placeholder = 'Required GATE Subject / Topic';
    sub2Placeholder = 'Optional GATE Subject / Topic';
  }

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!subject1) return; // Subject 1 is required

    const newTasks = [];
    const baseId = Date.now().toString();

    // Create task for Subject 1
    newTasks.push({
      id: baseId + '-1',
      text: subject1,
      duration: taskDuration,
      link: taskLink,
      completed: false,
      type: modeLabel,
      isOptional: false
    });

    // Create task for Subject 2 if provided
    if (subject2.trim() !== '') {
      newTasks.push({
        id: baseId + '-2',
        text: subject2,
        duration: taskDuration,
        link: taskLink,
        completed: false,
        type: modeLabel,
        isOptional: true
      });
    }

    updateTrackerData(dateStr, [...tasksForDay, ...newTasks]);
    setSubject1('');
    setSubject2('');
    setTaskLink('');
  };

  const toggleTask = (taskId) => {
    const updated = tasksForDay.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateTrackerData(dateStr, updated);
  };

  const removeTask = (taskId) => {
    const updated = tasksForDay.filter(t => t.id !== taskId);
    updateTrackerData(dateStr, updated);
  };

  // Generate Calendar Days
  const daysInMonth = getDaysInMonth(may2026);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = addDays(may2026, i);
    return {
      dateObj: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      dayNum: i + 1,
      isWeekend: getDay(d) === 0 || getDay(d) === 6
    };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Calendar Grid & Selected Day Info */}
      <div className="flex-col gap-6">
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>May 2026</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {/* Empty slots for offset (May 1 2026 is a Friday = index 5) */}
            {Array.from({ length: 5 }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {calendarDays.map((d, i) => {
              const isSelected = dateStr === d.dateStr;
              const hasTasks = trackerData[d.dateStr]?.length > 0;
              const allDone = hasTasks && trackerData[d.dateStr].every(t => t.completed);
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d.dateObj)}
                  style={{
                    padding: '12px 0',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-coding)' : 'var(--border-glass)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {d.dayNum}
                  {hasTasks && (
                    <div style={{ 
                      width: '6px', height: '6px', borderRadius: '50%', 
                      background: allDone ? 'var(--accent-revision)' : 'var(--accent-gate)', 
                      margin: '4px auto 0' 
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h3 className="text-h3" style={{ color: 'var(--current-accent)' }}>{headerLabel}</h3>
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>{format(selectedDate, 'MMM do')}</span>
          </div>

          <form onSubmit={handleAddTask} className="flex-col gap-4">
            <input 
              type="text" 
              placeholder={sub1Placeholder}
              value={subject1}
              onChange={(e) => setSubject1(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
              required
            />

            <input 
              type="text" 
              placeholder={sub2Placeholder}
              value={subject2}
              onChange={(e) => setSubject2(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <select 
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', appearance: 'none' }}
                >
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1.5h">1.5 Hours</option>
                  <option value="2h">2 Hours</option>
                </select>
              </div>
              
              <div style={{ flex: 2, position: 'relative' }}>
                <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Video URL (Optional)"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
              <PlusCircle size={20} /> Add Tasks
            </button>
          </form>
        </div>
      </div>

      {/* Task List for Selected Day */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px', animationDelay: '0.1s' }}>
        <div className="flex-row justify-between items-center" style={{ marginBottom: '24px' }}>
          <h2 className="text-h2">Schedule for {format(selectedDate, 'MMM do')}</h2>
          <div className="text-muted">{tasksForDay.length} Tasks</div>
        </div>

        {tasksForDay.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No tasks scheduled for this day yet.<br />Use the form to add your learning targets.
          </div>
        ) : (
          <div className="flex-col gap-4">
            {tasksForDay.map(task => (
              <div key={task.id} className="glass-panel" style={{ padding: '16px', borderLeft: task.completed ? '4px solid var(--accent-revision)' : (task.isOptional ? '4px solid var(--text-muted)' : '4px solid var(--accent-gate)') }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    className="custom-checkbox" 
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginTop: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '500', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                          {task.text}
                        </span>
                        {task.isOptional && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-muted)' }}>Optional</span>
                        )}
                      </div>
                      <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {task.duration}</span>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-coding)', textDecoration: 'none' }}>
                          <LinkIcon size={14} /> Watch Lecture
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
