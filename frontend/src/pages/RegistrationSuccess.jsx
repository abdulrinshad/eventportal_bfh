import React, { useMemo } from 'react';
import './RegistrationSuccess.css';

/* ─── Inline SVG Icons ─── */
const Svg = ({ children, size = 18, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IcoCheck      = ({ size = 18 }) => <Svg size={size}><polyline points="20 6 9 17 4 12"/></Svg>;
const IcoCalendar   = ({ size = 18 }) => <Svg size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>;
const IcoMapPin     = ({ size = 18 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoArrowLeft  = ({ size = 18 }) => <Svg size={size}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>;
const IcoBadgeCheck = ({ size = 18 }) => <Svg size={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></Svg>;
const IcoTicket     = ({ size = 18 }) => <Svg size={size}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="9" x2="9" y2="15"/></Svg>;
const IcoRegistrations = ({ size = 18 }) => <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;

/* ─── Dummy Event Data ─── */
const EVENT = {
  image:    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  badge:    'CONFERENCE',
  ref:      'CV-99210',
  title:    'CompilVision Global Summit 2024',
  date:     'October 24, 2024',
  time:     '09:00 AM',
  location: 'Innovation Hub, San Francisco',
};

/* ─── Confetti pieces (static decorative squares) ─── */
const CONFETTI_DEF = [
  /* top, left, color, size(px), rotate(deg) */
  [  6,  4, '#f4b400', 14,  15 ], [ 12, 10, '#1f2937', 10, -22 ],
  [  4, 22, '#10b981',  8,  45 ], [  9, 33, '#f4b400', 12, -10 ],
  [  3, 48, '#6366f1',  7,  30 ], [  7, 57, '#f4b400', 11,  55 ],
  [  2, 70, '#10b981',  9, -35 ], [  5, 82, '#1f2937', 13,  18 ],
  [ 11, 91, '#f4b400',  8, -50 ], [ 15, 96, '#10b981', 10,  40 ],
  [ 20,  8, '#10b981',  7, -12 ], [ 23, 18, '#f4b400', 11,  28 ],
  [ 17, 28, '#6366f1',  9, -40 ], [ 25, 41, '#1f2937',  8,  60 ],
  [ 19, 63, '#f4b400', 13, -18 ], [ 22, 75, '#10b981',  7,  35 ],
  [ 18, 87, '#1f2937', 10, -25 ], [ 26, 93, '#f4b400',  9,  48 ],
  [ 30,  3, '#10b981', 12,  20 ], [ 35, 15, '#f4b400',  8, -42 ],
  [ 32, 55, '#1f2937', 11,  15 ], [ 38, 68, '#6366f1',  7, -30 ],
  [ 36, 78, '#f4b400', 14,  52 ], [ 31, 90, '#10b981',  9,  -8 ],
  [ 42,  7, '#6366f1',  8,  38 ], [ 45, 25, '#f4b400', 10, -20 ],
  [ 48, 72, '#1f2937',  9,  25 ], [ 44, 85, '#10b981', 12, -55 ],
  [ 55, 12, '#f4b400',  7,  42 ], [ 60, 88, '#6366f1', 11, -15 ],
];

/* ─── Main Component ─── */
const RegistrationSuccess = ({ onBackToEvents, onViewRegistrations }) => {

  const handleAddToCalendar = () => {
    /* Build a Google Calendar URL with dummy data */
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text:   EVENT.title,
      dates:  '20241024T090000/20241024T170000',
      location: EVENT.location,
      details: `Reference: ${EVENT.ref}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
  };

  return (
    <div className="rs-root">

      {/* ── Confetti ── */}
      <div className="rs-confetti" aria-hidden="true">
        {CONFETTI_DEF.map(([top, left, color, size, rotate], i) => (
          <span
            key={i}
            className="rs-confetti__piece"
            style={{ top: `${top}%`, left: `${left}%`, background: color,
                     width: size, height: size, transform: `rotate(${rotate}deg)` }}
          />
        ))}
      </div>

      {/* ── Central Content ── */}
      <div className="rs-center">

        {/* Check icon */}
        <div className="rs-check-ring">
          <div className="rs-check-circle">
            <IcoCheck size={32} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="rs-title">You're registered!</h1>
        <p className="rs-subtitle">A confirmation email has been sent to your inbox.</p>

        {/* Event card */}
        <div className="rs-card">
          <img src={EVENT.image} alt={EVENT.title} className="rs-card__img" />
          <div className="rs-card__body">
            <div className="rs-card__top-row">
              <span className="rs-badge">{EVENT.badge}</span>
              <span className="rs-ref">Ref: {EVENT.ref}</span>
            </div>
            <h2 className="rs-card__title">{EVENT.title}</h2>
            <div className="rs-card__meta">
              <span className="rs-meta-icon"><IcoCalendar size={15} /></span>
              {EVENT.date} &bull; {EVENT.time}
            </div>
            <div className="rs-card__meta">
              <span className="rs-meta-icon"><IcoMapPin size={15} /></span>
              {EVENT.location}
            </div>
            <div className="rs-card__divider" />
            <div className="rs-pass-row">
              <span className="rs-pass-icon"><IcoTicket size={16} /></span>
              <div className="rs-pass-info">
                <span className="rs-pass-name">Digital Entry Pass</span>
                <span className="rs-pass-status">Ready in Dashboard</span>
              </div>
              <span className="rs-pass-badge"><IcoBadgeCheck size={20} /></span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="rs-actions">
          <button className="rs-btn-primary" onClick={handleAddToCalendar}>
            <IcoCalendar size={16} /> Add to Calendar
          </button>
          <button
            className="rs-btn-outline"
            onClick={typeof onViewRegistrations === 'function'
              ? onViewRegistrations : undefined}
          >
            <IcoRegistrations size={16} /> View My Registrations
          </button>
        </div>

        {/* Back link */}
        <button
          className="rs-back-link"
          onClick={typeof onBackToEvents === 'function' ? onBackToEvents : undefined}
        >
          <IcoArrowLeft size={15} /> Back to Events
        </button>

      </div>
    </div>
  );
};

export default RegistrationSuccess;
