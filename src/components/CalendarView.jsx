import React, { useState, useEffect } from 'react';
import { format, getDaysInMonth, addDays, getDay } from 'date-fns';
import { PlusCircle, Link as LinkIcon, Clock, Video, ListTodo, Save, CheckCircle2, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';

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
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);

  // Completion State
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [actualDuration, setActualDuration] = useState('');

  // Modals & Toasts
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

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
      if (activeTab === 'video' && !videoUrl) {
        showToastMsg("Please provide a video URL", "error");
        return;
      }
      
      if (selectedTopic === 'required' && !dayData.topics?.required) {
        showToastMsg("Please define and save a Required Topic first.", "error");
        return;
      }
      if (selectedTopic === 'optional' && !dayData.topics?.optional) {
        showToastMsg("Please define and save an Optional Topic first.", "error");
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        type: activeTab,
        text: itemName,
        link: activeTab === 'video' ? videoUrl : '',
        duration: itemDuration || '00h00m00s',
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
        const updated = tasksForDay.map(t => t.id === task.id ? { ...t, completed: false, actualDuration: null } : t);
        updateTrackerData(dateStr, { ...dayData, tasks: updated });
      } else {
        setCompletingTaskId(task.id);
        setActualDuration(task.duration);
      }
    });
  };

  const finalizeCompletion = (taskId, textName) => {
    const updated = tasksForDay.map(t => t.id === taskId ? { ...t, completed: true, actualDuration: actualDuration || t.duration } : t);
    updateTrackerData(dateStr, { ...dayData, tasks: updated });
    setCompletingTaskId(null);
    setActualDuration('');
    showToastMsg(`${textName} completed successfully!`, 'success');
  };

  const confirmDeleteTask = () => {
    requireAuth(() => {
      if (!taskToDelete) return;
      const updated = tasksForDay.filter(t => t.id !== taskToDelete);
      updateTrackerData(dateStr, { ...dayData, tasks: updated });
      setTaskToDelete(null);
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

  // Hybrid Duration Input Component
  const DurationInput = ({ value, onChange, placeholder }) => (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Clock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={placeholder || "00h00m00s"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
          required
        />
      </div>
      <div style={{ position: 'relative', width: '60px' }}>
        <select 
          onChange={(e) => {
            const presets = { '30mins': '00h30m00s', '45mins': '00h45m00s', '1hr': '01h00m00s', '2hrs': '02h00m00s' };
            if(e.target.value) onChange(presets[e.target.value]);
            e.target.value = ''; 
          }}
          style={{ width: '100%', height: '100%', appearance: 'none', background: 'var(--current-accent)', border: 'none', borderRadius: '8px', color: 'transparent', cursor: 'pointer', outline: 'none', zIndex: 2, position: 'absolute', opacity: 0 }}
        >
          <option value=""></option>
          <option value="30mins">30 Mins</option>
          <option value="45mins">45 Mins</option>
          <option value="1hr">1 Hour</option>
          <option value="2hrs">2 Hours</option>
        </select>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--current-accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, color: '#000' }}>
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* GLOBAL TOAST ALERTS */}
      <div style={{
        position: 'fixed', top: toast.show ? '24px' : '-100px', left: '50%', transform: 'translateX(-50%)',
        background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
        color: '#fff', padding: '16px 32px', borderRadius: '12px', zIndex: 10000, fontWeight: 'bold',
        display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', backdropFilter: 'blur(10px)'
      }}>
        {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
        {toast.message}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <Trash2 size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Delete Task permanently?</h2>
            <p className="text-muted" style={{ marginBottom: '32px' }}>This action cannot be undone. Are you sure you want to permanently delete this execution item?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setTaskToDelete(null)} className="btn" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={confirmDeleteTask} className="btn" style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: '#fff', border: 'none' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Sign in to Save Data</h2>
            <p className="text-muted" style={{ marginBottom: '32px' }}>
              hey user welcome to dasboard if you want to accesss features and save data please sign in
            </p>
            <button 
              onClick={() => { handleLogin(); setShowAuthModal(false); }} 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', background: '#ffffff', color: '#3c4043', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '20px', cursor: 'pointer' }}>Cancel</button>
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
              
              {/* Positioned below the button */}
              <div style={{
                height: showSaveSuccess ? '40px' : '0px',
                opacity: showSaveSuccess ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  <CheckCircle2 size={16} /> Topics Saved for Today
                </div>
              </div>
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
                
                {/* CUSTOM REACT DROPDOWN FOR TOPICS */}
                <div className="custom-dropdown-container" style={{ position: 'relative', width: '100%', zIndex: 10 }}>
                  <div 
                    onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}
                  >
                    <span>
                      {selectedTopic === 'required' ? (dayData.topics?.required ? `${dayData.topics.required} (Req)` : 'Define Required Topic First') : ''}
                      {selectedTopic === 'optional' ? (dayData.topics?.optional ? `${dayData.topics.optional} (Opt)` : 'Define Optional Topic First') : ''}
                    </span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </div>
                  
                  {topicDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#1a1f2e', border: '1px solid var(--border-glass)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      <div 
                        onClick={() => { if(dayData.topics?.required) { setSelectedTopic('required'); setTopicDropdownOpen(false); } }}
                        style={{ padding: '14px', cursor: dayData.topics?.required ? 'pointer' : 'not-allowed', color: dayData.topics?.required ? '#fff' : 'var(--text-muted)', borderBottom: '1px solid var(--border-glass)', background: selectedTopic === 'required' ? 'rgba(6,182,212,0.1)' : 'transparent', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => dayData.topics?.required && (e.currentTarget.style.background = 'rgba(6,182,212,0.15)')}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedTopic === 'required' ? 'rgba(6,182,212,0.1)' : 'transparent'}
                      >
                        {dayData.topics?.required ? `${dayData.topics.required} (Req)` : 'Define Required Topic First'}
                      </div>
                      <div 
                        onClick={() => { if(dayData.topics?.optional) { setSelectedTopic('optional'); setTopicDropdownOpen(false); } }}
                        style={{ padding: '14px', cursor: dayData.topics?.optional ? 'pointer' : 'not-allowed', color: dayData.topics?.optional ? '#fff' : 'var(--text-muted)', background: selectedTopic === 'optional' ? 'rgba(6,182,212,0.1)' : 'transparent', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => dayData.topics?.optional && (e.currentTarget.style.background = 'rgba(6,182,212,0.15)')}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedTopic === 'optional' ? 'rgba(6,182,212,0.1)' : 'transparent'}
                      >
                        {dayData.topics?.optional ? `${dayData.topics.optional} (Opt)` : 'Define Optional Topic First'}
                      </div>
                    </div>
                  )}
                </div>

                {/* DURATION INPUT HYBRID */}
                <DurationInput value={itemDuration} onChange={setItemDuration} placeholder="00h00m00s" />

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
                              <div className="flex-col gap-3 animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter Actual Time Taken (00h00m00s)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <DurationInput value={actualDuration} onChange={setActualDuration} placeholder="00h00m00s" />
                                  <button onClick={() => finalizeCompletion(task.id, task.text)} className="btn btn-primary" style={{ padding: '0 16px' }}>
                                    <CheckCircle2 size={18} /> Save
                                  </button>
                                </div>
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
                                  <button onClick={() => setTaskToDelete(task.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.8}>
                                    <Trash2 size={16} />
                                  </button>
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
                              <div className="flex-col gap-3 animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter Actual Time Taken (00h00m00s)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <DurationInput value={actualDuration} onChange={setActualDuration} placeholder="00h00m00s" />
                                  <button onClick={() => finalizeCompletion(task.id, task.text)} className="btn btn-primary" style={{ padding: '0 16px' }}>
                                    <CheckCircle2 size={18} /> Save
                                  </button>
                                </div>
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
                                  <button onClick={() => setTaskToDelete(task.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.8}>
                                    <Trash2 size={16} />
                                  </button>
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
