import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EventDetails.css';

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
   DUMMY DATA
───────────────────────────────────────────────────── */
const EVENT = {
  title: 'Future Visionary Summit 2024',
  category: 'Technology & Innovation',
  date: 'October 2-05, 2024',
  venue: 'Grand Tech Center, San Francisco',
  attendees: 1200,
  price: 499.00,
  heroImages: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  ],
  aboutText: [
    "Welcome to the flagship event of CompilVision. The Future Visionary Summit 2024 brings together the world's most influential minds in technology, design, and business strategy for three days of immersive learning and networking.",
    "This year's theme focuses on \"The Symbiosis of AI and Human Creativity.\" We will explore how generative technologies are reshaping industry landscapes, from automated logistics to high-fidelity creative arts. Our curated sessions are designed to move beyond the hype and provide actionable insights for professional growth.",
  ],
  stats: [
    { value: 32, label: 'Keynote Speakers' },
    { value: 15, label: 'Workshops' },
    { value: '24h', label: 'Networking' },
    { value: 12, label: 'Exhibitors' },
  ],
  checklist: [
    'Full access to all keynote sessions',
    'Lunch and refreshments included',
    'Networking gala evening pass',
    'Digital certificate of attendance',
  ],
  schedule: [
    {
      id: 1,
      time: ['09:00', 'AM'],
      title: 'Opening Keynote: The Digital Renaissance',
      speaker: 'Speaker: Dr. Julian Voice, Chief Futurist at CompilVision',
      tags: [
        { label: 'Main Stage', color: 'green' },
        { label: '90 Mins', color: 'yellow' },
      ],
      detail: 'An inspiring opening session exploring the intersection of technology and human creativity, setting the vision for the summit.',
    },
    {
      id: 2,
      time: ['11:00', 'AM'],
      title: 'Interactive UI Design Workshop',
      speaker: 'Hands-on session using the latest design-to-code workflows.',
      tags: [
        { label: 'Workshop Lab', color: 'green' },
        { label: '120 Mins', color: 'yellow' },
      ],
      detail: 'Participants will prototype real components using Figma and modern AI-assisted code generation tools.',
    },
  ],
  organizer: {
    name: 'CompilVision Events Team',
    role: 'Professional Event Planners',
    bio: 'CompilVision is a global leader in organizing high-fidelity professional events. We focus on bringing the gap between innovative technology and real-world education through world-class summits and hands-on workshops.',
    img: 'https://images.unsplash.com/photo-1573496799822-994c23dce00f?auto=format&fit=crop&w=150&q=80',
  },
  venueName: 'Grand Tech Center',
  venueAddress: '101 Innovation Way, Demo District, San Francisco, CA 94103',
  mapImg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=60',
};

const ATTENDEE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
];

const SIMILAR = [
  {
    id: 's1',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=80',
    date: 'Nov 15, 2024',
    title: 'AI Marketing Strategies',
    price: '$129.00',
    free: false,
  },
  {
    id: 's2',
    img: 'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=500&q=80',
    date: 'Dec 05, 2024',
    title: 'Design Systems 2.0',
    price: 'Free',
    free: true,
  },
  {
    id: 's3',
    img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=500&q=80',
    date: 'Jan 18, 2025',
    title: "Founder's Night Out",
    price: '$45.00',
    free: false,
  },
];

/* ─────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────── */
const Navbar = ({ scrolled }) => (
  <header className={`cv-nav${scrolled ? ' cv-nav--scrolled' : ''}`}>
    <div className="cv-nav__inner">
      <a href="/" className="cv-nav__logo">CompilVision</a>
      <nav className="cv-nav__links">
        <a href="/" className="cv-nav__link">Home</a>
        <a href="/" className="cv-nav__link cv-nav__link--active">Events</a>
        <a href="/" className="cv-nav__link">About</a>
        <a href="/" className="cv-nav__link">Contact</a>
      </nav>
      <div className="cv-nav__actions">
        <a href="/login" className="cv-nav__login">Login</a>
        <a href="/login" className="cv-nav__register">Register!</a>
      </div>
    </div>
  </header>
);

/* ─────────────────────────────────────────────────────
   HERO BANNER  — mosaic of 4 images
───────────────────────────────────────────────────── */
const HeroBanner = ({ event, bookmarked, onBookmark, onShare, shareCopied }) => (
  <section className="cv-hero">
    <div className="cv-hero__mosaic">
      {event.heroImages.map((src, i) => (
        <div key={i} className={`cv-hero__panel cv-hero__panel--${i}`}>
          <img src={src} alt="" className="cv-hero__panel-img" />
        </div>
      ))}
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
          <IcoCalendar size={14} /> {event.date}
        </span>
        <span className="cv-hero__meta-item">
          <IcoMapPin size={14} /> {event.venue}
        </span>
        <span className="cv-hero__meta-item">
          <IcoUsers size={14} /> {event.attendees.toLocaleString()}+ Attendees
        </span>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────
   ABOUT EVENT
───────────────────────────────────────────────────── */
const AboutCard = ({ event }) => (
  <div className="cv-card">
    <h2 className="cv-section-title">About the Event</h2>
    <div className="cv-about__body">
      {event.aboutText.map((p, i) => <p key={i}>{p}</p>)}
    </div>
    <div className="cv-stats">
      {event.stats.map((s, i) => (
        <div key={i} className="cv-stat">
          <div className="cv-stat__val">{s.value}</div>
          <div className="cv-stat__label">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   PRICING CARD (sidebar)
───────────────────────────────────────────────────── */
const PricingCard = ({ event, registered, onRegister }) => (
  <div className="cv-card cv-pricing">
    <div className="cv-pricing__top">
      <span className="cv-pricing__tier">STANDARD ACCESS</span>
      <span className="cv-pricing__badge">Sale ends soon!</span>
    </div>
    <div className="cv-pricing__price">
      <span className="cv-pricing__amount">${event.price.toFixed(2)}</span>
      <span className="cv-pricing__per">/per</span>
    </div>
    <ul className="cv-checklist">
      {event.checklist.map((item, i) => (
        <li key={i} className="cv-checklist__item">
          <span className="cv-checklist__icon"><IcoCheck size={13} /></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
    {registered ? (
      <div className="cv-pricing__registered"><IcoCheck size={16} /> You're Registered!</div>
    ) : (
      <button className="cv-btn-register" onClick={onRegister}>Register Now</button>
    )}
    <div className="cv-pricing__secure">
      <IcoShield size={13} />
      <span>Secure checkout powered by CompilVision Pay</span>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   ATTENDEES CARD (sidebar)
───────────────────────────────────────────────────── */
const AttendeesCard = ({ count }) => (
  <div className="cv-card cv-attendees">
    <h3 className="cv-attendees__title">Who's attending?</h3>
    <div className="cv-avatars">
      {ATTENDEE_AVATARS.map((src, i) => (
        <img key={i} src={src} alt="attendee"
          className="cv-avatar"
          style={{ zIndex: ATTENDEE_AVATARS.length - i }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ))}
      <div className="cv-avatar cv-avatar--more">+{count - ATTENDEE_AVATARS.length}</div>
    </div>
    <p className="cv-attendees__text">
      Join <strong>{count}+</strong> professionals including leaders from Google, Meta, and Stripe who have already registered.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────
   SCHEDULE ACCORDION
───────────────────────────────────────────────────── */
const ScheduleAccordion = ({ schedule }) => {
  const [openId, setOpenId] = useState(1);
  const toggle = id => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="cv-card">
      <h2 className="cv-section-title">Event Schedule</h2>
      <div className="cv-accordion">
        {schedule.map(item => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={`cv-acc-item${isOpen ? ' open' : ''}`}>
              <button className="cv-acc-btn" onClick={() => toggle(item.id)}>
                <div className="cv-acc-time">
                  {item.time.map((t, i) => <span key={i}>{t}</span>)}
                </div>
                <div className="cv-acc-info">
                  <span className="cv-acc-title">{item.title}</span>
                  <span className="cv-acc-speaker">{item.speaker}</span>
                  <div className="cv-acc-tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className={`cv-tag cv-tag--${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>
                </div>
                <span className={`cv-acc-chevron${isOpen ? ' rotated' : ''}`}>
                  <IcoChevronDown size={16} />
                </span>
              </button>
              {isOpen && (
                <div className="cv-acc-body">
                  <p>{item.detail}</p>
                </div>
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
const OrganizerCard = ({ organizer }) => (
  <div className="cv-card cv-organizer">
    <div className="cv-organizer__header">
      <img src={organizer.img} alt={organizer.name} className="cv-organizer__img"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1573496799822-994c23dce00f?auto=format&fit=crop&w=150&q=80'; }} />
      <div>
        <div className="cv-organizer__name">{organizer.name}</div>
        <div className="cv-organizer__role">{organizer.role}</div>
      </div>
    </div>
    <p className="cv-organizer__bio">{organizer.bio}</p>
    <button className="cv-btn-outline">Follow Organizer</button>
  </div>
);

/* ─────────────────────────────────────────────────────
   VENUE & LOCATION
───────────────────────────────────────────────────── */
const VenueCard = ({ event }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venueAddress)}`;
  return (
    <div className="cv-card cv-venue">
      <h2 className="cv-section-title">Venue &amp; Location</h2>
      <div className="cv-venue__map">
        <img src={event.mapImg} alt="Map of venue" className="cv-venue__map-img" />
        <div className="cv-venue__pin"><IcoMapPin size={34} /></div>
        <div className="cv-venue__map-label">{event.venueName}, SF</div>
      </div>
      <div className="cv-venue__info">
        <div>
          <div className="cv-venue__name">{event.venueName}</div>
          <div className="cv-venue__address">{event.venueAddress}</div>
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
   SIMILAR EVENTS
───────────────────────────────────────────────────── */
const SimilarCard = ({ ev, onDetails }) => (
  <div className="cv-sim-card">
    <div className="cv-sim-card__img-wrap">
      <img src={ev.img} alt={ev.title} className="cv-sim-card__img"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'; }} />
    </div>
    <div className="cv-sim-card__body">
      <div className="cv-sim-card__date">{ev.date}</div>
      <h3 className="cv-sim-card__title">{ev.title}</h3>
      <div className="cv-sim-card__footer">
        <span className={`cv-sim-card__price${ev.free ? ' free' : ''}`}>{ev.price}</span>
        <button
          className="cv-sim-card__details"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => onDetails && onDetails(ev.id)}
        >
          Details
        </button>
      </div>
    </div>
  </div>
);

const SimilarEvents = ({ events, onDetails }) => (
  <div className="cv-similar">
    <div className="cv-similar__header">
      <h2 className="cv-section-title">Similar Events</h2>
      <a href="/" className="cv-view-all">View All <IcoArrowRight size={13} /></a>
    </div>
    <div className="cv-similar__grid">
      {events.map(ev => <SimilarCard key={ev.id} ev={ev} onDetails={onDetails} />)}
    </div>
  </div>
);

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
            <div className="cv-footer__logo">CompilVision</div>
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
          <span>© {new Date().getFullYear()} CompilVision. All rights reserved.</span>
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
   MAIN PAGE
───────────────────────────────────────────────────── */
const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [scrolled,    setScrolled]    = useState(false);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [registered,  setRegistered]  = useState(false);
  const [regMsg,      setRegMsg]      = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleRegister = () => {
    setRegistered(true);
    setRegMsg('Registration successful! Redirecting...');
    setTimeout(() => navigate('/registration-success'), 1200);
  };

  const handleSimilarDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="cv-root">
      <Navbar scrolled={scrolled} />

      <main>
        <HeroBanner
          event={EVENT}
          bookmarked={bookmarked}
          onBookmark={() => setBookmarked(b => !b)}
          onShare={handleShare}
          shareCopied={shareCopied}
        />

        <div className="cv-container">
          {regMsg && <div className="cv-reg-alert">{regMsg}</div>}

          <div className="cv-layout">
            {/* Main column */}
            <div className="cv-main-col">
              <AboutCard event={EVENT} />
              <ScheduleAccordion schedule={EVENT.schedule} />
              <OrganizerCard organizer={EVENT.organizer} />
              <VenueCard event={EVENT} />
              <SimilarEvents events={SIMILAR} onDetails={handleSimilarDetails} />
            </div>

            {/* Sticky Sidebar */}
            <div className="cv-sidebar">
              <div className="cv-sidebar__sticky">
                <PricingCard event={EVENT} registered={registered} onRegister={handleRegister} />
                <AttendeesCard count={EVENT.attendees} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
