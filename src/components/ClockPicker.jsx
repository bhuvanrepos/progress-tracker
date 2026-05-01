import React, { useState, useEffect } from 'react';

const ClockPicker = ({ isOpen, onClose, initialValue, onComplete }) => {
  const [view, setView] = useState('hours'); // 'hours', 'minutes', 'seconds'
  const [hr, setHr] = useState(0);
  const [min, setMin] = useState(0);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setView('hours');
      const match = initialValue?.match(/^(\d{2})h(\d{2})m(\d{2})s$/);
      if (match) {
        setHr(parseInt(match[1]));
        setMin(parseInt(match[2]));
        setSec(parseInt(match[3]));
      } else {
        setHr(0); setMin(0); setSec(0);
      }
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSelect = (val) => {
    if (view === 'hours') {
      setHr(val);
      setTimeout(() => setView('minutes'), 300);
    } else if (view === 'minutes') {
      setMin(val);
      setTimeout(() => setView('seconds'), 300);
    } else if (view === 'seconds') {
      setSec(val);
      const pad = n => n.toString().padStart(2, '0');
      onComplete(`${pad(hr)}h${pad(min)}m${pad(val)}s`);
      onClose();
    }
  };

  const pad = n => n.toString().padStart(2, '0');

  // Generate Clock Numbers
  const renderNumbers = () => {
    const numbers = [];
    const cx = 125, cy = 125;

    if (view === 'hours') {
      // Outer Ring: 1 to 12 (0 is rendered in inner ring, but usually outer ring has 12, 1,2..11 and inner has 00, 13..23)
      for (let i = 1; i <= 12; i++) {
        const val = i === 12 ? 0 : i; // outer ring is 0-11, wait standard is outer: 1-12, inner: 13-00
        const displayVal = i;
        const actualVal = i === 12 ? 12 : i;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = cx + 90 * Math.cos(angle);
        const y = cy + 90 * Math.sin(angle);
        const isActive = hr === actualVal || (hr === 0 && actualVal === 12 && false); // exact match
        numbers.push(<ClockNumber key={`h-out-${i}`} x={x} y={y} val={displayVal} isActive={hr === actualVal} onClick={() => handleSelect(actualVal)} />);
      }
      // Inner Ring: 13 to 00
      for (let i = 1; i <= 12; i++) {
        const actualVal = i === 12 ? 0 : i + 12;
        const displayVal = i === 12 ? '00' : i + 12;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = cx + 55 * Math.cos(angle);
        const y = cy + 55 * Math.sin(angle);
        numbers.push(<ClockNumber key={`h-in-${i}`} x={x} y={y} val={displayVal} isActive={hr === actualVal} onClick={() => handleSelect(actualVal)} />);
      }
    } else {
      // Minutes and Seconds (0, 5, 10, ... 55)
      const currentVal = view === 'minutes' ? min : sec;
      for (let i = 0; i < 12; i++) {
        const actualVal = i * 5;
        const displayVal = i === 0 ? '00' : actualVal;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = cx + 90 * Math.cos(angle);
        const y = cy + 90 * Math.sin(angle);
        numbers.push(<ClockNumber key={`ms-${i}`} x={x} y={y} val={displayVal} isActive={currentVal === actualVal} onClick={() => handleSelect(actualVal)} />);
      }
    }
    return numbers;
  };

  // Calculate Hand Line
  const getHandStyles = () => {
    let val = view === 'hours' ? hr : (view === 'minutes' ? min : sec);
    let r = 90;
    if (view === 'hours') {
      if (val === 0 || val > 12) {
        r = 55;
      }
      val = val % 12;
    } else {
      val = val / 5; // since 60 mins -> 12 ticks
    }
    const angle = val * 30 - 90;
    
    return {
      position: 'absolute',
      left: '125px',
      top: '125px',
      width: `${r}px`,
      height: '2px',
      background: 'var(--current-accent, #06b6d4)',
      transformOrigin: '0 50%',
      transform: `rotate(${angle}deg)`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1
    };
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="animate-fade-in" style={{ background: '#1a1f2e', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '24px', width: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header Display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', fontSize: '2.5rem', fontWeight: 'bold' }}>
          <span onClick={() => setView('hours')} style={{ color: view === 'hours' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>{pad(hr)}</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span onClick={() => setView('minutes')} style={{ color: view === 'minutes' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>{pad(min)}</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span onClick={() => setView('seconds')} style={{ color: view === 'seconds' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>{pad(sec)}</span>
        </div>

        {/* Clock Face */}
        <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', border: '1px solid var(--border-glass)' }}>
          {/* Center Dot */}
          <div style={{ position: 'absolute', left: '121px', top: '121px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--current-accent, #06b6d4)', zIndex: 2 }} />
          
          {/* Hand */}
          <div style={getHandStyles()} />
          <div style={{ position: 'absolute', left: '125px', top: '125px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--current-accent, #06b6d4)', transform: `translate(${parseFloat(getHandStyles().width) * Math.cos(parseFloat(getHandStyles().transform.replace('rotate(','')) * Math.PI / 180) - 16}px, ${parseFloat(getHandStyles().width) * Math.sin(parseFloat(getHandStyles().transform.replace('rotate(','')) * Math.PI / 180) - 16}px)`, zIndex: 0, opacity: 0.3, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />

          {/* Numbers */}
          {renderNumbers()}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>CANCEL</button>
          <button onClick={() => { onComplete(`${pad(hr)}h${pad(min)}m${pad(sec)}s`); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--current-accent, #06b6d4)', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>OK</button>
        </div>
      </div>
    </div>
  );
};

const ClockNumber = ({ x, y, val, isActive, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      position: 'absolute',
      left: `${x - 16}px`,
      top: `${y - 16}px`,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      color: isActive ? '#000' : 'var(--text-main)',
      background: isActive ? 'var(--current-accent, #06b6d4)' : 'transparent',
      cursor: 'pointer',
      zIndex: 2,
      fontWeight: isActive ? 'bold' : 'normal',
      transition: 'all 0.2s'
    }}
  >
    {val}
  </div>
);

export default ClockPicker;
