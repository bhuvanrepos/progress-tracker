import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, ExternalLink, Key, FileText, Plus } from 'lucide-react';

export default function ImportantNotes({ trackerData, updateTrackerData, currentDate }) {
  const [selectedDate, setSelectedDate] = useState(format(currentDate, 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [type, setType] = useState('link'); // 'link', 'password', 'text'
  const [value, setValue] = useState('');

  const todayNotes = trackerData[selectedDate]?.important || [];

  const handleSave = () => {
    if (!title.trim() || !value.trim()) return;

    const newNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type,
      value: value.trim(),
      createdAt: new Date().toISOString()
    };

    const dayData = trackerData[selectedDate] || { tasks: [], topics: { required: '', optional: '' } };
    const updatedNotes = [...(dayData.important || []), newNote];

    updateTrackerData(selectedDate, { ...dayData, important: updatedNotes });
    setTitle('');
    setValue('');
  };

  const handleDelete = (id) => {
    const dayData = trackerData[selectedDate];
    if (!dayData) return;
    const updatedNotes = (dayData.important || []).filter(n => n.id !== id);
    updateTrackerData(selectedDate, { ...dayData, important: updatedNotes });
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case 'link': return <ExternalLink size={16} />;
      case 'password': return <Key size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      
      {/* Form Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Add Important Note</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="form-input w-full"
              style={{ appearance: 'none' }}
            >
              <option value="link">URL / Link</option>
              <option value="password">Password / Secret</option>
              <option value="text">General Text</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Title</label>
          <input 
            type="text" 
            placeholder="e.g., AWS Login, Reference Article..."
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="form-input w-full"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Value</label>
          {type === 'text' ? (
            <textarea 
              rows={4}
              placeholder="Enter your important notes here..."
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="form-input w-full"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          ) : (
            <input 
              type={type === 'password' ? "password" : "text"}
              placeholder={type === 'link' ? "https://..." : "Enter secret..."}
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="form-input w-full"
            />
          )}
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Plus size={20} />
          Save Note
        </button>
      </div>

      {/* Display Section */}
      <h2 className="text-h2" style={{ marginTop: '16px' }}>Notes for {selectedDate ? format(parseISO(selectedDate), 'MMMM do, yyyy') : ''}</h2>
      
      {todayNotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No important notes saved for this date.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {todayNotes.map(note => (
            <div key={note.id} className="glass-panel flex-row justify-between items-start hover-glow" style={{ padding: '20px', borderLeft: '4px solid var(--accent-coding)' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="flex-row items-center gap-2" style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--accent-coding)' }}>{getTypeIcon(note.type)}</span>
                  <h3 style={{ margin: 0, fontWeight: 'bold' }}>{note.title}</h3>
                </div>
                
                {note.type === 'link' && (
                  <a href={note.value.startsWith('http') ? note.value : `https://${note.value}`} target="_blank" rel="noreferrer" style={{ color: 'var(--current-accent)', wordBreak: 'break-all' }}>
                    {note.value}
                  </a>
                )}
                {note.type === 'password' && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', color: '#f87171', display: 'inline-block' }}>
                    {note.value}
                  </div>
                )}
                {note.type === 'text' && (
                  <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>{note.value}</p>
                )}
              </div>
              <button onClick={() => handleDelete(note.id)} className="btn" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent', marginLeft: '16px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
