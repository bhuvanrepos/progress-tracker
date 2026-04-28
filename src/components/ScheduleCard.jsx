import React from 'react';
import { Code, Database, Globe, Brain, PenTool, BookOpen } from 'lucide-react';

export default function ScheduleCard({ dayOfWeek, modeName, mode }) {
  const getScheduleContent = () => {
    if (dayOfWeek >= 1 && dayOfWeek <= 3) {
      // Coding
      return [
        { title: 'Language Basics', icon: <Code size={24} />, desc: 'Variables, Loops, Functions, OOP concepts.' },
        { title: 'Data Structures & Algorithms', icon: <Database size={24} />, desc: 'Arrays, Strings, Linked Lists, Trees, Graphs.' },
        { title: 'Web Development Course', icon: <Globe size={24} />, desc: 'HTML, CSS, JavaScript, React Basics.' }
      ];
    } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
      // GATE
      return [
        { title: 'Core CSE Subjects', icon: <Brain size={24} />, desc: 'OS, DBMS, Computer Networks, TOC, Compiler.' },
        { title: 'Engineering Math & Aptitude', icon: <PenTool size={24} />, desc: 'Linear Algebra, Probability, Calculus.' },
        { title: 'Previous Year Questions', icon: <BookOpen size={24} />, desc: 'Solving PYQs from 2010 onwards.' }
      ];
    } else {
      // Revision
      return [
        { title: 'Weekly Summary', icon: <BookOpen size={24} />, desc: 'Review notes from Mon-Sat.' },
        { title: 'Mock Test', icon: <PenTool size={24} />, desc: 'Take a short topic-wise mock test.' }
      ];
    }
  };

  const schedule = getScheduleContent();

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <div className="flex-row justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="text-h2">Today's Focus</h2>
          <p className="text-muted">Your scheduled topics for {modeName}</p>
        </div>
        <button className="btn btn-primary">Start Timer</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {schedule.map((item, index) => (
          <div key={index} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--current-accent)' }}>
              {item.icon}
              <h3 className="text-h3" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{item.title}</h3>
            </div>
            <p className="text-muted" style={{ lineHeight: '1.4' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
