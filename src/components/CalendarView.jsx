import React, { useState, useEffect } from 'react';
import { format, getDaysInMonth, addDays, getDay } from 'date-fns';
import { PlusCircle, Link as LinkIcon, Clock, Video, ListTodo, Save } from 'lucide-react';

export default function CalendarView({ trackerData, updateTrackerData }) {
  // Phase 1 constraints: May 2026
  const may2026 = new Date('2026-05-01T00:00:00');
  const [selectedDate, setSelectedDate] = useState(may2026);
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayData = trackerData[dateStr] || { mood: null, topics: { required: '', optional: '' }, tasks: [] };
  const tasksForDay = dayData.tasks || [];
  
  // Topic Setup State
  const [topicReq, setTopicReq] = useState('');
  const [topicOpt, setTopicOpt] = useState('');

  // Sync local topic state when changing days
  useEffect(() => {
    setTopicReq(dayData.topics?.required || '');
    setTopicOpt(dayData.topics?.optional || '');
  }, [dateStr, trackerData]);

  // Builder State
  const [activeTab, setActiveTab] = useState('task'); // 'task' or 'video'
  const [itemName, setItemName] = useState('');
  const [itemDuration, setItemDuration] = useState('1h');
  const [selectedTopic, setSelectedTopic] = useState('required');

  const moods = [
    { emoji: '🚀', label: 'Highly Motivated' },
    { emoji: '😊', label: 'Good' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😫', label: 'Tired' },
    { emoji: '🌧️', label: 'Struggling' }
  ];

  const handleMoodSelect = (moodLabel) => {
    updateTrackerData(dateStr, { ...dayData, mood: moodLabel });
  };

  const handleSaveTopics = (e) => {
    e.preventDefault();
    updateTrackerData(dateStr, { ...dayData, topics: { required: topicReq, optional: topicOpt } });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName) return;
    
    if (selectedTopic === 'required' && !dayData.topics?.required) {
      alert("Please define and save a Required Topic first.");
      return;
    }
    if (selectedTopic === 'optional' && !dayData.topics?.optional) {
      alert("Please define and save an Optional Topic first.");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      type: activeTab,
      text: activeTab === 'task' ? itemName : '',
      link: activeTab === 'video' ? itemName : '',
      duration: itemDuration,
      topic: selectedTopic,
      completed: false
    };

    updateTrackerData(dateStr, { ...dayData, tasks: [...tasksForDay, newItem] });
    setItemName('');
  };

  const toggleTask = (taskId) => {
    const updated = tasksForDay.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateTrackerData(dateStr, { ...dayData, tasks: updated });
  };

  const removeTask = (taskId) => {
    const updated = tasksForDay.filter(t => t.id !== taskId);
    updateTrackerData(dateStr, { ...dayData, tasks: updated });
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

  // Group tasks for rendering
  const requiredTasks = tasksForDay.filter(t => t.topic === 'required');
  const optionalTasks = tasksForDay.filter(t => t.topic === 'optional');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* LEFT COLUMN: Calendar & Mood */}
      <div className="flex-col gap-6">
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>May 2026</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={`empty-${i}`} />)}
            {calendarDays.map((d, i) => {
              const isSelected = dateStr === d.dateStr;
              const hasTasks = trackerData[d.dateStr]?.tasks?.length > 0;
              const allDone = hasTasks && trackerData[d.dateStr].tasks.every(t => t.completed);
              
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

        {/* MOOD TRACKER */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="text-h3">Today's Mood</h3>
            {dayData.mood && <span style={{ fontSize: '0.8rem', color: 'var(--current-accent)' }}>Saved!</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                title={m.label}
                style={{
                  fontSize: '1.8rem',
                  padding: '8px',
                  background: dayData.mood === m.label ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  border: dayData.mood === m.label ? '1px solid var(--current-accent)' : '1px solid transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: dayData.mood === m.label ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Builder & Tasks */}
      <div className="flex-col gap-6">
        
        {/* TOPIC SETUP */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h3 className="text-h3" style={{ color: 'var(--current-accent)' }}>Topic Definition</h3>
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>{format(selectedDate, 'MMM do')}</span>
          </div>

          <form onSubmit={handleSaveTopics} className="flex-col gap-4">
            <input 
              type="text" 
              placeholder="Required GATE Subject / Topic"
              value={topicReq}
              onChange={(e) => setTopicReq(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
              required
            />
            <input 
              type="text" 
              placeholder="Optional GATE Subject / Topic"
              value={topicOpt}
              onChange={(e) => setTopicOpt(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
            <button type="submit" className="btn" style={{ justifyContent: 'center', border: '1px solid var(--current-accent)', color: 'var(--current-accent)' }}>
              <Save size={18} /> Save Topics
            </button>
          </form>
        </div>

        {/* TASK / VIDEO BUILDER */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button 
              onClick={() => setActiveTab('task')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'task' ? 'var(--current-accent)' : 'rgba(255,255,255,0.05)', color: activeTab === 'task' ? '#000' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              <ListTodo size={18} /> Add Task
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'video' ? 'var(--current-accent)' : 'rgba(255,255,255,0.05)', color: activeTab === 'video' ? '#000' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              <Video size={18} /> Add Video
            </button>
          </div>

          <form onSubmit={handleAddItem} className="flex-col gap-4">
            <input 
              type="text" 
              placeholder={activeTab === 'task' ? "Task Description" : "Video URL (https://...)"}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}
              required
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', appearance: 'none' }}
              >
                <option value="required">Under Required Topic</option>
                <option value="optional">Under Optional Topic</option>
              </select>

              <div style={{ flex: 1, position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <select 
                  value={itemDuration}
                  onChange={(e) => setItemDuration(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', appearance: 'none' }}
                >
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1.5h">1.5 Hours</option>
                  <option value="2h">2 Hours</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
              <PlusCircle size={20} /> Add {activeTab === 'task' ? 'Task' : 'Video'}
            </button>
          </form>
        </div>

        {/* TASK LIST RENDER */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="text-h2" style={{ marginBottom: '24px' }}>Today's Execution</h2>
          
          {tasksForDay.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              No tasks added yet. Define your topics and add items!
            </div>
          ) : (
            <div className="flex-col gap-6">
              
              {/* REQUIRED TOPIC TASKS */}
              {dayData.topics?.required && (
                <div>
                  <h4 style={{ color: 'var(--accent-coding)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    {dayData.topics.required} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Required)</span>
                  </h4>
                  <div className="flex-col gap-3">
                    {requiredTasks.length === 0 ? <p className="text-muted" style={{ fontSize: '0.85rem' }}>No tasks added under this topic.</p> : null}
                    {requiredTasks.map(task => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', opacity: task.completed ? 0.6 : 1 }}>
                        <input type="checkbox" className="custom-checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} style={{ marginTop: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              {task.type === 'task' ? task.text : <a href={task.link} target="_blank" rel="noreferrer" style={{ color: 'var(--current-accent)' }}>🔗 Watch Lecture Video</a>}
                            </span>
                            <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {task.duration}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{task.type === 'video' ? <Video size={12} /> : <ListTodo size={12} />} {task.type === 'video' ? 'Video' : 'Task'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPTIONAL TOPIC TASKS */}
              {dayData.topics?.optional && (
                <div>
                  <h4 style={{ color: 'var(--accent-revision)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    {dayData.topics.optional} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </h4>
                  <div className="flex-col gap-3">
                    {optionalTasks.length === 0 ? <p className="text-muted" style={{ fontSize: '0.85rem' }}>No tasks added under this topic.</p> : null}
                    {optionalTasks.map(task => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', opacity: task.completed ? 0.6 : 1 }}>
                        <input type="checkbox" className="custom-checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} style={{ marginTop: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              {task.type === 'task' ? task.text : <a href={task.link} target="_blank" rel="noreferrer" style={{ color: 'var(--current-accent)' }}>🔗 Watch Lecture Video</a>}
                            </span>
                            <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {task.duration}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{task.type === 'video' ? <Video size={12} /> : <ListTodo size={12} />} {task.type === 'video' ? 'Video' : 'Task'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
