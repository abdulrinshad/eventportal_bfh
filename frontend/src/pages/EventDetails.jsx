import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EventDetails.css';
import { getStudentEventDetailApi, registerForEventApi } from '../services/api';

/* ─────────────────────────────────────────────────────
   INLINE SVG ICONS
───────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IcoCalendar    = ({ size = 16 }) => <Svg size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>;
const IcoMapPin      = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoUsers       = ({ size = 16 }) => <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const IcoShare       = ({ size = 16 }) => <Svg size={size}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Svg>;
const IcoBookmark    = ({ size = 16 }) => <Svg size={size}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Svg>;
const IcoCheck       = ({ size = 16 }) => <Svg size={size}><polyline points="20 6 9 17 4 12"/></Svg>;
const IcoShield      = ({ size = 16 }) => <Svg size={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>;
const IcoChevronDown = ({ size = 16 }) => <Svg size={size}><polyline points="6 9 12 15 18 9"/></Svg>;
const IcoNavigation  = ({ size = 16 }) => <Svg size={size}><polygon points="3 11 22 2 13 21 11 13 3 11"/></Svg>;
const IcoMap         = ({ size = 16 }) => <Svg size={size}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Svg>;
const IcoArrowRight  = ({ size = 16 }) => <Svg size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>;
const IcoSend        = ({ size = 16 }) => <Svg size={size}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>;
const IcoFb          = ({ size = 16 }) => <Svg size={size}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></Svg>;
const IcoTw          = ({ size = 16 }) => <Svg size={size}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></Svg>;
const IcoIn          = ({ size = 16 }) => <Svg size={size}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></Svg>;

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function formatDateTime(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────────────────────────────────────────
   HERO BANNER
───────────────────────────────────────────────────── */
const HeroBanner = ({ event, bookmarked, onBookmark, onShare, shareCopied }) => {
  // Use single banner image; fill remaining panels with a gradient if no banner
  const hasBanner = !!event.banner_url;
  return (
    <section className="cv-hero">
      <div className="cv-hero__mosaic">
        {hasBanner ? (
          // Full-width single banner instead of mosaic
          <div className="cv-hero__panel cv-hero__panel--0" style={{ gridColumn: '1 / -1', gridRow: '1 / -1' }}>
            <img src={event.banner_url} alt={event.title} className="cv-hero__panel-img" />
          </div>
        ) : (
          // Gradient placeholder when no banner
          <div style={{ gridColumn: '1 / -1', gridRow: '1 / -1', background: 'linear-gradient(135deg, #111827, #1F2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
            🎪
          </div>
        )}
        <div className="cv-hero__overlay" />
      </div>

      <div className="cv-hero__top-actions">
        <button className={`cv-hero__icon-btn${shareCopied ? ' active' : ''}`} onClick={onShare} title="Share">
          <IcoShare size={15} />
        </button>
        <button className={`cv-hero__icon-btn${bookmarked ? ' active' : ''}`} onClick={onBookmark} title="Save">
          <IcoBookmark size={15} />
        </button>
      </div>

      <div className="cv-hero__content">
        <span className="cv-hero__category">{event.category}</span>
        <h1 className="cv-hero__title">{event.title}</h1>
        <div className="cv-hero__meta">
          <span className="cv-hero__meta-item">
            <IcoCalendar size={14} /> {formatDate(event.start_datetime)}
          </span>
          <span className="cv-hero__meta-item">
            <IcoMapPin size={14} /> {event.venue}
          </span>
          <span className="cv-hero__meta-item">
            <IcoUsers size={14} /> {event.registered_count || 0}+ Registered
          </span>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────
   ABOUT EVENT
───────────────────────────────────────────────────── */
const AboutCard = ({ event }) => (
  <div className="cv-card">
    <h2 className="cv-section-title">About the Event</h2>
    <div className="cv-about__body">
      {event.description
        ? event.description.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)
        : <p style={{ color: '#6B7280' }}>No description available.</p>
      }
    </div>

    {/* Tags */}
    {event.tags && event.tags.length > 0 && (
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {event.tags.map((tag, i) => (
          <span key={i} style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', background: '#F1F5F9', color: '#475569' }}>
            #{tag}
          </span>
        ))}
      </div>
    )}

    {/* Stats */}
    <div className="cv-stats" style={{ marginTop: '24px' }}>
      <div className="cv-stat">
        <div className="cv-stat__val">{event.max_participants}</div>
        <div className="cv-stat__label">Max Participants</div>
      </div>
      <div className="cv-stat">
        <div className="cv-stat__val">{event.registered_count || 0}</div>
        <div className="cv-stat__label">Registered</div>
      </div>
      <div className="cv-stat">
        <div className="cv-stat__val">{Math.max(0, event.available_seats ?? (event.max_participants - event.registered_count))}</div>
        <div className="cv-stat__label">Seats Left</div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   PRICING / REGISTRATION CARD (sidebar)
───────────────────────────────────────────────────── */
const PricingCard = ({ event, registering, onRegister, regMsg }) => {
  const btnState = event.registration_button_state || 'REGISTER_NOW';

  // Prefer new is_paid/price fields; fall back to ticket_price for old events
  const isFree = event.is_paid === false || event.is_paid === 'false'
    ? true
    : event.is_paid === true || event.is_paid === 'true'
    ? false
    : (event.ticket_price === 0 || event.ticket_price === '0.00' || !event.ticket_price);

  const rawPrice = event.is_paid ? (event.price || event.ticket_price) : (event.ticket_price);
  const price    = isFree ? 'Free' : `₹${parseFloat(rawPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const buttonConfig = {
    REGISTER_NOW:       { text: registering ? 'Registering...' : 'Register Now', disabled: registering, style: {} },
    ALREADY_REGISTERED: { text: "✓ You're Registered!", disabled: true, style: { background: '#10B981', cursor: 'default' } },
    WAITLISTED:         { text: '⏳ You\'re on the Waitlist', disabled: true, style: { background: '#F59E0B', cursor: 'default' } },
    REGISTRATION_CLOSED:{ text: 'Registration Closed', disabled: true, style: { background: '#6B7280', cursor: 'not-allowed' } },
    EVENT_FULL:         { text: 'Event Full', disabled: true, style: { background: '#EF4444', cursor: 'not-allowed' } },
  };
  const btn = buttonConfig[btnState] || buttonConfig.REGISTER_NOW;

  return (
    <div className="cv-card cv-pricing">
      <div className="cv-pricing__top">
        <span className="cv-pricing__tier">{isFree ? 'FREE ENTRY' : 'STANDARD ACCESS'}</span>
        {!event.deadline_passed && btnState === 'REGISTER_NOW' && (
          <span className="cv-pricing__badge">
            Deadline: {formatDate(event.registration_deadline)}
          </span>
        )}
      </div>
      <div className="cv-pricing__price">
        <span className="cv-pricing__amount">{price}</span>
        {!isFree && <span className="cv-pricing__per">/per person</span>}
      </div>

      {/* Registration deadline */}
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
        <strong>Registration closes:</strong>{' '}
        <span style={{ color: event.deadline_passed ? '#EF4444' : '#111827' }}>
          {formatDateTime(event.registration_deadline)}
        </span>
      </div>

      {/* Seats info */}
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
        <strong>Seats available:</strong>{' '}
        {Math.max(0, event.available_seats ?? (event.max_participants - event.registered_count))} / {event.max_participants}
        {event.enable_waitlist && <span style={{ marginLeft: '8px', color: '#F59E0B', fontWeight: '600' }}>(Waitlist enabled)</span>}
      </div>

      {/* Status message */}
      {regMsg && (
        <div style={{
          background: regMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          border: `1px solid ${regMsg.type === 'success' ? '#15803D' : '#FCA5A5'}`,
          borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
          color: regMsg.type === 'success' ? '#15803D' : '#991B1B',
          marginBottom: '16px', fontWeight: '600',
        }}>
          {regMsg.text}
        </div>
      )}

      <button
        className="cv-btn-register"
        onClick={onRegister}
        disabled={btn.disabled}
        style={btn.style}
      >
        {btn.text}
      </button>

      <div className="cv-pricing__secure">
        <IcoShield size={13} />
        <span>Secured by the event portal</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   ATTENDEES CARD (sidebar)
───────────────────────────────────────────────────── */
const AttendeesCard = ({ count }) => (
  <div className="cv-card cv-attendees">
    <h3 className="cv-attendees__title">Who's attending?</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      {[...Array(Math.min(5, count || 1))].map((_, i) => (
        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 60}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#FFFFFF', fontWeight: '700', marginLeft: i > 0 ? '-8px' : '0', border: '2px solid #FFFFFF' }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      {count > 5 && <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>+{count - 5} more</span>}
    </div>
    <p className="cv-attendees__text">
      <strong>{count}+</strong> people have already registered for this event.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────
   SCHEDULE ACCORDION
───────────────────────────────────────────────────── */
const ScheduleAccordion = ({ schedule }) => {
  const [openId, setOpenId] = useState(null);
  const toggle = id => setOpenId(prev => prev === id ? null : id);

  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="cv-card">
      <h2 className="cv-section-title">Event Schedule</h2>
      <div className="cv-accordion">
        {schedule.map((item, idx) => {
          const isOpen = openId === idx;
          return (
            <div key={idx} className={`cv-acc-item${isOpen ? ' open' : ''}`}>
              <button className="cv-acc-btn" onClick={() => toggle(idx)}>
                <div className="cv-acc-time">
                  <span>{item.time || item.start_time || ''}</span>
                </div>
                <div className="cv-acc-info">
                  <span className="cv-acc-title">{item.title || item.session}</span>
                  {item.speaker && <span className="cv-acc-speaker">Speaker: {item.speaker}</span>}
                  <div className="cv-acc-tags">
                    {item.location && <span className="cv-tag cv-tag--green">{item.location}</span>}
                    {item.duration && <span className="cv-tag cv-tag--yellow">{item.duration}</span>}
                  </div>
                </div>
                <span className={`cv-acc-chevron${isOpen ? ' rotated' : ''}`}>
                  <IcoChevronDown size={16} />
                </span>
              </button>
              {isOpen && item.description && (
                <div className="cv-acc-body"><p>{item.description}</p></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   ORGANIZER CARD
───────────────────────────────────────────────────── */
const OrganizerCard = ({ organizer }) => {
  if (!organizer) return null;
  return (
    <div className="cv-card cv-organizer">
      <div className="cv-organizer__header">
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #F5C451, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0 }}>
          {(organizer.name || 'O').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="cv-organizer__name">{organizer.name}</div>
          <div className="cv-organizer__role">{organizer.organization}</div>
        </div>
      </div>
      <p className="cv-organizer__bio">
        This event is organized by {organizer.name}.
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   CONTACT & DETAILS CARD
───────────────────────────────────────────────────── */
const ContactCard = ({ event }) => (
  <div className="cv-card">
    <h2 className="cv-section-title">Contact & Details</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
      {event.contact_email && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ color: '#F5C451', fontSize: '16px' }}>✉</span>
          <a href={`mailto:${event.contact_email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{event.contact_email}</a>
        </div>
      )}
      {event.contact_phone && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ color: '#F5C451', fontSize: '16px' }}>📞</span>
          <span>{event.contact_phone}</span>
        </div>
      )}
      {event.website && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ color: '#F5C451', fontSize: '16px' }}>🌐</span>
          <a href={event.website} target="_blank" rel="noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>
            {event.website}
          </a>
        </div>
      )}
      {event.social_links && Object.keys(event.social_links).length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {Object.entries(event.social_links).map(([platform, url]) => (
            <a key={platform} href={url} target="_blank" rel="noreferrer"
              style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: '600', color: '#475569', textDecoration: 'none' }}
            >
              {platform}
            </a>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   VENUE & LOCATION
───────────────────────────────────────────────────── */
const VenueCard = ({ event }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`;
  return (
    <div className="cv-card cv-venue">
      <h2 className="cv-section-title">Venue & Location</h2>
      <div className="cv-venue__info">
        <div>
          <div className="cv-venue__name">{event.venue}</div>
          <div className="cv-venue__links">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="cv-venue__link">
              <IcoNavigation size={13} /> Get Directions
            </a>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="cv-venue__link cv-venue__link--dark">
              <IcoMap size={13} /> View on Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────── */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);
  const handleSub = e => {
    e.preventDefault();
    if (email.trim()) { setSubbed(true); setEmail(''); setTimeout(() => setSubbed(false), 3000); }
  };
  return (
    <footer className="cv-footer">
      <div className="cv-footer__inner">
        <div className="cv-footer__grid">
          <div className="cv-footer__brand">
            <div className="cv-footer__logo">EventPortal</div>
            <p>Making premium events accessible and beautifully managed for the modern community.</p>
          </div>
          <div>
            <h4 className="cv-footer__heading">Links</h4>
            <ul className="cv-footer__list">
              {['About Us', 'Events', 'Contact'].map(l => (
                <li key={l}><a href="/" className="cv-footer__link">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="cv-footer__heading">Legal</h4>
            <ul className="cv-footer__list">
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><a href="/" className="cv-footer__link">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="cv-footer__heading">Stay Updated</h4>
            {subbed
              ? <p className="cv-footer__thanks">✓ Thank you!</p>
              : (
                <form className="cv-footer__form" onSubmit={handleSub}>
                  <input type="email" className="cv-footer__input" placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                  <button type="submit" className="cv-footer__send" aria-label="Subscribe">
                    <IcoSend size={14} />
                  </button>
                </form>
              )
            }
          </div>
        </div>
        <div className="cv-footer__bottom">
          <span>© {new Date().getFullYear()} EventPortal. All rights reserved.</span>
          <div className="cv-footer__socials">
            {[IcoFb, IcoTw, IcoIn].map((Ic, i) => (
              <a key={i} href="/" className="cv-footer__social" aria-label="social"><Ic size={14} /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }
    `}</style>
    {[300, 40, 20, 20, 20].map((h, i) => (
      <div key={i} style={{
        height: h, borderRadius: 8, marginBottom: 16,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
      }} />
    ))}
  </div>
);

import { AppLayout } from '../components/ui/DesignSystem';

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
const EventDetails = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [event,       setEvent]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchErr,    setFetchErr]    = useState(null);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMsg,      setRegMsg]      = useState(null);

  // Fetch event details from backend
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchErr(null);
      try {
        const res = await getStudentEventDetailApi(id);
        if (!cancelled && res && res.success) {
          setEvent(res.data);
        } else if (!cancelled) {
          setFetchErr('Event not found or not available.');
        }
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 404) {
            setFetchErr('This event does not exist or is not available.');
          } else if (status === 403) {
            setFetchErr('You do not have permission to view this event.');
          } else {
            setFetchErr('Failed to load event details. Please try again.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    setRegMsg(null);
    try {
      const res = await registerForEventApi(event.id);
      if (res && res.success) {
        const newStatus = res.data?.status;
        setRegMsg({
          type: 'success',
          text: newStatus === 'WAITLISTED'
            ? '✓ You have been added to the waitlist!'
            : '✓ Registration successful!',
        });
        // Refresh event to update button state
        const refreshed = await getStudentEventDetailApi(event.id);
        if (refreshed && refreshed.success) setEvent(refreshed.data);
      } else {
        setRegMsg({ type: 'error', text: res?.message || 'Registration failed.' });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setRegMsg({ type: 'error', text: msg });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <AppLayout><LoadingSkeleton /></AppLayout>;

  if (fetchErr) {
    return (
      <AppLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🚫</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Event Unavailable</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>{fetchErr}</p>
          <button
            onClick={() => navigate('/student/events')}
            style={{ padding: '12px 24px', borderRadius: '12px', background: '#F5C451', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            ← Back to Events
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!event) return null;

  return (
    <AppLayout>
      <main style={{ paddingBottom: '40px' }}>
        <HeroBanner
          event={event}
          bookmarked={bookmarked}
          onBookmark={() => setBookmarked(b => !b)}
          onShare={handleShare}
          shareCopied={shareCopied}
        />

        <div className="cv-container">
          <div className="cv-layout">
            {/* Main column */}
            <div className="cv-main-col">
              <AboutCard event={event} />
              {event.schedule && event.schedule.length > 0 && (
                <ScheduleAccordion schedule={event.schedule} />
              )}
              <OrganizerCard organizer={event.organizer} />
              <ContactCard event={event} />
              <VenueCard event={event} />
            </div>

            {/* Sticky Sidebar */}
            <div className="cv-sidebar">
              <div className="cv-sidebar__sticky">
                <PricingCard
                  event={event}
                  registering={registering}
                  onRegister={handleRegister}
                  regMsg={regMsg}
                />
                <AttendeesCard count={event.registered_count || 0} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </AppLayout>
  );
};

export default EventDetails;
