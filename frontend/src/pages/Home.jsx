import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { FiSearch, FiMapPin, FiCalendar, FiCompass, FiLayers, FiBell, FiArrowRight, FiSend } from 'react-icons/fi';
import { getPublicEventsApi, getPublicStatsApi } from '../services/api';

// ── Format date helper ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const VALUE_PROPS = [
  {
    icon: <FiCompass size={24} color="#F5C451" />,
    title: 'Seamless Registration',
    desc: 'Easy-to-use registration flows and fast secure ticket purchases for your attendees.',
  },
  {
    icon: <FiLayers size={24} color="#F5C451" />,
    title: 'Professional Dashboard',
    desc: 'Manage event coordination lists, ticket sales, and track real-time analytics from a central command center.',
  },
  {
    icon: <FiBell size={24} color="#F5C451" />,
    title: 'Real-time Notifications',
    desc: 'Keep everyone in the loop with automated alerts, check-in reminders, and last-minute updates.',
  },
];

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Search & Filter State ───────────────────────────────────────────────────
  const [searchTitle, setSearchTitle] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [location, setLocation] = useState('');

  // ── API State ───────────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0,
    total_registrations: 0,
    active_organizers: 0,
    participants: 0,
  });
  const [loading, setLoading] = useState(true);

  // ── Fetch dynamic data on mount ─────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          getPublicEventsApi({ ordering: 'newest', page: 1 }),
          getPublicStatsApi(),
        ]);
        if (active) {
          if (eventsRes && eventsRes.success) {
            setEvents(eventsRes.data || []);
          }
          if (statsRes && statsRes.success && statsRes.data) {
            setStats(statsRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch landing page data:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const queryParams = [];
    if (searchTitle.trim()) {
      queryParams.push(`search=${encodeURIComponent(searchTitle.trim())}`);
    }
    if (category && category !== 'All Categories') {
      queryParams.push(`category=${encodeURIComponent(category)}`);
    }
    if (location.trim()) {
      queryParams.push(`location=${encodeURIComponent(location.trim())}`);
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/events${queryString}`);
  };

  const secondaryBtnStyle = {
    background: 'transparent',
    border: '1.5px solid #E5E7EB',
    borderRadius: '30px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const handleSecondaryMouseEnter = (e) => {
    e.target.style.borderColor = '#F5C451';
  };

  const handleSecondaryMouseLeave = (e) => {
    e.target.style.borderColor = '#E5E7EB';
  };

  const renderHeroButtons = () => {
    if (!user) {
      return (
        <>
          <PrimaryButton onClick={() => navigate('/events')}>
            Explore Events
          </PrimaryButton>
          <button 
            onClick={() => navigate('/register')}
            style={secondaryBtnStyle}
            onMouseEnter={handleSecondaryMouseEnter}
            onMouseLeave={handleSecondaryMouseLeave}
          >
            Register
          </button>
        </>
      );
    }

    if (user.role === 'STUDENT') {
      return (
        <>
          <PrimaryButton onClick={() => navigate('/events')}>
            Explore Events
          </PrimaryButton>
          <button 
            onClick={() => navigate('/student/registrations')}
            style={secondaryBtnStyle}
            onMouseEnter={handleSecondaryMouseEnter}
            onMouseLeave={handleSecondaryMouseLeave}
          >
            My Registrations
          </button>
        </>
      );
    }

    if (user.role === 'ORGANIZER') {
      return (
        <>
          <PrimaryButton onClick={() => navigate('/organizer/events/create')}>
            Create Event
          </PrimaryButton>
          <button 
            onClick={() => navigate('/organizer/events')}
            style={secondaryBtnStyle}
            onMouseEnter={handleSecondaryMouseEnter}
            onMouseLeave={handleSecondaryMouseLeave}
          >
            My Events
          </button>
        </>
      );
    }

    if (user.role === 'ADMIN') {
      return (
        <PrimaryButton onClick={() => navigate('/admin')}>
          Admin Dashboard
        </PrimaryButton>
      );
    }

    return null;
  };

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
      <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        
        {/* ── 1. HERO SECTION ── */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 40px 24px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }} className="hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFFDF5', border: '1px solid rgba(245, 196, 81, 0.3)', borderRadius: '30px', padding: '6px 14px', marginBottom: '20px' }}>
              <span style={{ width: '6px', height: '6px', background: '#F5C451', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#B45309', letterSpacing: '0.5px' }}>TRUSTED BY 10k+ TEAMS GLOBALLY</span>
            </div>
            
            <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)', lineHeight: '1.15', letterSpacing: '-1px' }}>
              Discover &amp; Manage <br />
              <span style={{ color: '#F5C451' }}>Premium Events</span>
            </h1>
            
            <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 32px 0', maxWidth: '480px' }}>
              The all-in-one platform for professional event management. Streamline registrations, engage attendees, and host memorable experiences.
            </p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              {renderHeroButtons()}
            </div>
          </div>

          <div>
            <div style={{ overflow: 'hidden', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)' }}>
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" 
                alt="Event Audience"
                style={{ width: '100%', display: 'block', objectFit: 'cover', height: '360px' }}
              />
            </div>
          </div>
        </section>

        {/* ── 2. FLOATING SEARCH BAR ── */}
        <section style={{ maxWidth: '1200px', margin: '-24px auto 48px auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div 
            style={{ 
              background: '#FFFFFF', 
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)', 
              borderRadius: '20px', 
              padding: '16px 20px', 
              border: '1px solid #E5E7EB',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr',
              gap: '12px',
              alignItems: 'center'
            }}
            className="search-row"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid #E5E7EB', paddingRight: '12px' }} className="search-col">
              <FiSearch color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Search by title..." 
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#1F2937' }}
              />
            </div>

            <div style={{ borderRight: '1px solid #E5E7EB', paddingRight: '12px' }} className="search-col">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#4B5563', background: '#FFFFFF', cursor: 'pointer' }}
              >
                <option value="All Categories">All Categories</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Networking">Networking</option>
                <option value="Tech Summit">Tech Summit</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: 'none', paddingRight: '12px' }} className="search-col">
              <FiMapPin color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Select Location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#1F2937' }}
              />
            </div>

            <PrimaryButton onClick={handleSearch} style={{ width: '100%', borderRadius: '12px' }}>
              Search Events
            </PrimaryButton>
          </div>
        </section>

        {/* ── 3. METRIC STATISTICS ── */}
        <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} className="stats-grid">
            {[
              { value: `${stats.total_events || 0}+`, label: 'EVENTS HOSTED' },
              { value: `${stats.total_registrations || 0}+`, label: 'TOTAL REGISTRATIONS' },
              { value: `${stats.active_organizers || 0}+`, label: 'ACTIVE ORGANIZERS' },
              { value: `${stats.participants || 0}+`, label: 'ACTIVE PARTICIPANTS' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '1px' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. FEATURED EVENTS ── */}
        <section style={{ maxWidth: '1200px', margin: '70px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                Featured Events
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Find hand-picked premium experiences curated for professionals like you.
              </p>
            </div>
            <a 
              href="/events" 
              onClick={(e) => { e.preventDefault(); navigate('/events'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#F5C451', textDecoration: 'none' }}
            >
              View All Events <FiArrowRight />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }} className="cards-grid">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFFFFF', padding: '0px', display: 'flex', flexDirection: 'column', height: '340px' }}>
                  <div style={{ height: '180px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '16px', width: '30%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    <div style={{ height: '20px', width: '80%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    <div style={{ height: '14px', width: '60%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginTop: 'auto' }} />
                  </div>
                </div>
              ))
            ) : events.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: '1px dashed #E2E8F0' }}>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No approved events found. Check back later!</p>
              </div>
            ) : (
              events.slice(0, 3).map((evt) => {
                const isFree = evt.is_paid === false || evt.is_paid === 'false'
                  ? true
                  : evt.is_paid === true || evt.is_paid === 'true'
                  ? false
                  : (evt.ticket_price === 0 || evt.ticket_price === '0.00' || !evt.ticket_price);
                const displayPrice = isFree ? 'FREE' : `₹${parseFloat(evt.price || evt.ticket_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
                return (
                  <div 
                    key={evt.id} 
                    style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '20px', 
                      overflow: 'hidden', 
                      border: '1px solid #E5E7EB',
                      boxShadow: 'var(--shadow-soft)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/events/${evt.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ height: '180px', overflow: 'hidden', background: '#F1F5F9' }}>
                      {evt.banner_url || evt.banner || evt.image ? (
                        <img src={evt.banner_url || evt.banner || evt.image} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1F2937, #374151)', fontSize: '48px' }}>
                          🎪
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: '6px', alignSelf: 'flex-start', marginBottom: '12px' }}>
                        {(evt.category || '').toUpperCase()}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {evt.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8', marginTop: 'auto' }}>
                        <FiCalendar /> <span>{formatDate(evt.event_date || evt.start_date || evt.start_datetime)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: isFree ? '12px' : '15px', fontWeight: '800', color: isFree ? '#15803D' : '#111827', background: isFree ? '#DCFCE7' : 'transparent', padding: isFree ? '2px 10px' : '0px', borderRadius: isFree ? '20px' : '0px' }}>{displayPrice}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#F5C451' }}>View Details &rarr;</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── 5. WHY CHOOSE COMPILVISION ── */}
        <section style={{ background: '#F8FAFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
              Why Choose CompilVision
            </h2>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 54px 0', maxWidth: '580px', marginInline: 'auto', lineHeight: '1.6' }}>
              We provide the most robust tools for creating, promoting, and managing your events with surgical precision.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="cards-grid">
              {VALUE_PROPS.map((vp, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '20px', 
                    padding: '32px 24px', 
                    border: '1px solid #E5E7EB', 
                    textAlign: 'left',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    {vp.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>
                    {vp.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5', margin: 0 }}>
                    {vp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. FOOTER ── */}
        <footer style={{ background: '#FFFFFF', padding: '60px 24px 30px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '48px', paddingBottom: '40px', borderBottom: '1px solid #F1F5F9' }} className="footer-grid">
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
                  CompilVision
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
                  Premium event management platform for professional hosting. Coordinate registrations, tickets, and analytics seamlessly since 2026.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Platform
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['About Us', 'Events', 'Speakers', 'Pricing'].map(l => (
                    <a key={l} href="/" onClick={e => e.preventDefault()} style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}>{l}</a>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Support
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Help Center', 'Contact', 'Terms of Service', 'Privacy Policy'].map(l => (
                    <a key={l} href="/" onClick={e => e.preventDefault()} style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}>{l}</a>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Stay in the loop
                </h4>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>
                  Subscribe to receive updates on upcoming summits and workshops.
                </p>
                <div style={{ display: 'flex', gap: '8px', border: '1px solid #E5E7EB', borderRadius: '30px', padding: '4px 6px 4px 14px', alignItems: 'center' }}>
                  <input 
                    type="email" 
                    placeholder="Email address"
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#374151' }}
                  />
                  <button 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5C451', border: 'none', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <FiSend size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                &copy; {new Date().getFullYear()} CompilVision. All rights reserved.
              </span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94A3B8' }}>
                <a href="#terms" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                <a href="#privacy" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid, .search-row, .stats-grid, .cards-grid, .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .search-col {
            border-right: none !important;
            border-bottom: 1px solid #F1F5F9 !important;
            padding-bottom: 12px !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default Home;
