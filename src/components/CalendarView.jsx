import React, { useState, useEffect } from 'react';
import { format, getDaysInMonth, addDays, getDay } from 'date-fns';
import { PlusCircle, Link as LinkIcon, Clock, Video, ListTodo, Save, CheckCircle2, ChevronDown } from 'lucide-react';

export default function CalendarView({ trackerData, updateTrackerData, user, handleLogin }) {
  const may2026 = new Date('2026-05-01T00:00:00');
  const [selectedDate, setSelectedDate] = useState(may2026);
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayData = trackerData[dateStr] || { mood: null, topics: { required: '', optional: '' }, tasks: [] };
  const tasksForDay = dayData.tasks || [];
  
  // Topic Setup State
  const [topicReq, setTopicReq] = useState('');
  const [topicOpt, setTopicOpt] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    setTopicReq(dayData.topics?.required || '');
    setTopicOpt(dayData.topics?.optional || '');
  }, [dateStr, trackerData]);

  // Builder State
  const [activeTab, setActiveTab] = useState('task');
  const [itemName, setItemName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [itemDuration, setItemDuration] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('required');

  // Completion State
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [actualDuration, setActualDuration] = useState('');

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = (callback) => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return callback();
  };

  const moods = [
    { emoji: '🚀', label: 'Highly Motivated' },
    { emoji: '😊', label: 'Good' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😫', label: 'Tired' },
    { emoji: '🌧️', label: 'Struggling' }
  ];

  const handleMoodSelect = (moodLabel) => {
    requireAuth(() => {
      updateTrackerData(dateStr, { ...dayData, mood: moodLabel });
    });
  };

  const handleSaveTopics = (e) => {
    e.preventDefault();
    requireAuth(() => {
      updateTrackerData(dateStr, { ...dayData, topics: { required: topicReq, optional: topicOpt } });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    requireAuth(() => {
      if (!itemName) return;
      if (activeTab === 'video' && !videoUrl) return alert("Please provide a video URL");
      
      if (selectedTopic === 'required' && !dayData.topics?.required) {
        return alert("Please define and save a Required Topic first.");
      }
      if (selectedTopic === 'optional' && !dayData.topics?.optional) {
        return alert("Please define and save an Optional Topic first.");
      }

      const newItem = {
        id: Date.now().toString(),
        type: activeTab,
        text: itemName,
        link: activeTab === 'video' ? videoUrl : '',
        duration: itemDuration || 'N/A',
        topic: selectedTopic,
        completed: false,
        actualDuration: null
      };

      updateTrackerData(dateStr, { ...dayData, tasks: [...tasksForDay, newItem] });
      setItemName('');
      setVideoUrl('');
      setItemDuration('');
    });
  };

  const triggerToggleTask = (task) => {
    requireAuth(() => {
      if (task.completed) {
        // Uncheck
        const updated = tasksForDay.map(t => t.id === task.id ? { ...t, completed: false, actualDuration: null } : t);
        updateTrackerData(dateStr, { ...dayData, tasks: updated });
      } else {
        // Prompt for actual duration inline
        setCompletingTaskId(task.id);
        setActualDuration(task.duration); // Pre-fill with target
      }
    });
  };

  const finalizeCompletion = (taskId) => {
    const updated = tasksForDay.map(t => t.id === taskId ? { ...t, completed: true, actualDuration: actualDuration || t.duration } : t);
    updateTrackerData(dateStr, { ...dayData, tasks: updated });
    setCompletingTaskId(null);
    setActualDuration('');
  };

  const removeTask = (taskId) => {
    requireAuth(() => {
      const updated = tasksForDay.filter(t => t.id !== taskId);
      updateTrackerData(dateStr, { ...dayData, tasks: updated });
    });
  };

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

  const requiredTasks = tasksForDay.filter(t => t.topic === 'required');
  const optionalTasks = tasksForDay.filter(t => t.topic === 'optional');

  return (
    <>
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Sign in to Save Data</h2>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Your tasks and mood trackings are securely saved to the cloud. Please sign in to continue.</p>
            <button 
              onClick={() => {
                handleLogin();
                setShowAuthModal(false);
              }} 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            >
              Sign in with Google
            </button>
            <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '16px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 className="text-h3">Today's Mood</h3>
              {dayData.mood && <span style={{ fontSize: '0.8rem', color: 'var(--current-accent)' }}>Saved!</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              {moods.map((m) => (
                <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleMoodSelect(m.label)}
                    style={{
                      fontSize: '1.8rem',
                      padding: '12px',
                      background: dayData.mood === m.label ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-glass)',
                      border: dayData.mood === m.label ? '1px solid var(--current-accent)' : '1px solid var(--border-glass)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: dayData.mood === m.label ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: dayData.mood === m.label ? '0 0 15px rgba(6, 182, 212, 0.3)' : 'none'
                    }}
                  >
                    {m.emoji}
                  </button>
                  <span style={{ fontSize: '0.65rem', color: dayData.mood === m.label ? 'var(--current-accent)' : 'var(--text-muted)', textAlign: 'center' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Builder & Tasks */}
        <div className="flex-col gap-6">
          
          {/* TOPIC SETUP */}
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            
            {/* Success Banner */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'rgba(16, 185, 129, 0.2)', borderBottom: '1px solid rgba(16, 185, 129, 0.5)',
              color: '#10b981', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem',
              transform: showSaveSuccess ? 'translateY(0)' : 'translateY(-100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              ✓ Topics Saved for Today
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: showSaveSuccess ? '24px' : '0', transition: 'margin 0.3s' }}>
              <h3 className="text-h3" style={{ color: 'var(--current-accent)' }}>Topic Definition</h3>
              <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>{format(selectedDate, 'MMM do')}</span>
            </div>

            <form onSubmit={handleSaveTopics} className="flex-col gap-4">
              <input 
                type="text" 
                placeholder="Required GATE Subject / Topic"
                value={topicReq}
                onChange={(e) => setTopicReq(e.target.value)}
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '1rem' }}
                required
              />
              <input 
                type="text" 
                placeholder="Optional GATE Subject / Topic"
                value={topicOpt}
                onChange={(e) => setTopicOpt(e.target.value)}
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '1rem' }}
              />
              <button type="submit" className="btn" style={{ justifyContent: 'center', border: '1px solid var(--current-accent)', color: 'var(--current-accent)', padding: '12px' }}>
                <Save size={18} /> Save Topics
              </button>
            </form>
          </div>

          {/* TASK / VIDEO BUILDER */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setActiveTab('task')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'task' ? 'var(--current-accent)' : 'transparent', color: activeTab === 'task' ? '#000' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
              >
                <ListTodo size={18} /> Add Task
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'video' ? 'var(--current-accent)' : 'transparent', color: activeTab === 'video' ? '#000' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
              >
                <Video size={18} /> Add Video
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex-col gap-4">
              <input 
                type="text" 
                placeholder={activeTab === 'task' ? "Task Description (e.g. Read Chapter 4)" : "Video Title (e.g. OS Lecture 1)"}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '1rem' }}
                required
              />

              {activeTab === 'video' && (
                <div style={{ position: 'relative' }}>
                  <LinkIcon size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="url" 
                    placeholder="Video URL (https://...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '1rem' }}
                    required
                  />
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={{ width: '100%', padding: '14px 36px 14px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', appearance: 'none', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    <option value="required" disabled={!dayData.topics?.required}>
                      {dayData.topics?.required ? `${dayData.topics.required} (Req)` : "Define Required Topic First"}
                    </option>
                    <option value="optional" disabled={!dayData.topics?.optional}>
                      {dayData.topics?.optional ? `${dayData.topics.optional} (Opt)` : "Define Optional Topic First"}
                    </option>
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '16px', pointerEvents: 'none', color: 'var(--text-muted)' }}><ChevronDown size={16} /></div>
                </div>

                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Duration (e.g. 1.5h)"
                    value={itemDuration}
                    onChange={(e) => setItemDuration(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px', padding: '14px', fontSize: '1rem' }}>
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
                        <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: task.completed ? '3px solid var(--accent-revision)' : '3px solid var(--accent-coding)', opacity: task.completed ? 0.6 : 1, transition: 'all 0.3s' }}>
                          <input type="checkbox" className="custom-checkbox" checked={task.completed} onChange={() => triggerToggleTask(task)} style={{ marginTop: '4px' }} />
                          <div style={{ flex: 1 }}>
                            
                            {completingTaskId === task.id ? (
                              <div className="flex-row items-center gap-2 animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                                <input 
                                  type="text" 
                                  value={actualDuration}
                                  onChange={(e) => setActualDuration(e.target.value)}
                                  placeholder="Actual time taken? (e.g. 45m)"
                                  style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && finalizeCompletion(task.id)}
                                />
                                <button onClick={() => finalizeCompletion(task.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                  <CheckCircle2 size={16} /> Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '1.05rem', fontWeight: '500' }}>
                                      {task.text}
                                    </span>
                                    {task.type === 'video' && task.link && (
                                      <a href={task.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--current-accent)', textDecoration: 'none', fontSize: '0.85rem', marginTop: '4px' }}>
                                        <LinkIcon size={12} /> Watch Video
                                      </a>
                                    )}
                                  </div>
                                  <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>✕</button>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                                    <ListTodo size={12} /> {task.type === 'video' ? 'Video' : 'Task'}
                                  </span>
                                  {task.completed ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px' }}>
                                      <Clock size={12} /> Target: {task.duration} | Actual: {task.actualDuration}
                                    </span>
                                  ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                                      <Clock size={12} /> Target: {task.duration}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
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
                        <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: task.completed ? '3px solid var(--text-muted)' : '3px solid var(--accent-revision)', opacity: task.completed ? 0.6 : 1, transition: 'all 0.3s' }}>
                          <input type="checkbox" className="custom-checkbox" checked={task.completed} onChange={() => triggerToggleTask(task)} style={{ marginTop: '4px' }} />
                          <div style={{ flex: 1 }}>
                            
                            {completingTaskId === task.id ? (
                              <div className="flex-row items-center gap-2 animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                                <input 
                                  type="text" 
                                  value={actualDuration}
                                  onChange={(e) => setActualDuration(e.target.value)}
                                  placeholder="Actual time taken? (e.g. 45m)"
                                  style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && finalizeCompletion(task.id)}
                                />
                                <button onClick={() => finalizeCompletion(task.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                  <CheckCircle2 size={16} /> Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '1.05rem', fontWeight: '500' }}>
                                      {task.text}
                                    </span>
                                    {task.type === 'video' && task.link && (
                                      <a href={task.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--current-accent)', textDecoration: 'none', fontSize: '0.85rem', marginTop: '4px' }}>
                                        <LinkIcon size={12} /> Watch Video
                                      </a>
                                    )}
                                  </div>
                                  <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>✕</button>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                                    <ListTodo size={12} /> {task.type === 'video' ? 'Video' : 'Task'}
                                  </span>
                                  {task.completed ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px' }}>
                                      <Clock size={12} /> Target: {task.duration} | Actual: {task.actualDuration}
                                    </span>
                                  ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                                      <Clock size={12} /> Target: {task.duration}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
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
    </>
  );
}
