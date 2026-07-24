import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { FiSearch, FiMapPin, FiCalendar, FiCompass, FiLayers, FiBell, FiArrowRight, FiSend } from 'react-icons/fi';

const STATS = [
  { value: '500+', label: 'EVENTS HOSTED' },
  { value: '10k+', label: 'ACTIVE USERS' },
  { value: '50+', label: 'GLOBAL CITIES' },
  { value: '99%', label: 'SATISFACTION' },
];

const FEATURED_EVENTS = [
  {
    id: 1,
    title: 'Global Leadership Summit',
    date: 'Dec 24, 2026',
    price: '$299.00',
    category: 'Leadership',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'UI/UX Design Masterclass',
    date: 'Nov 12, 2026',
    price: '$150.00',
    category: 'Design',
    img: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Tech Founders Mixer',
    date: 'Dec 30, 2026',
    price: 'Free',
    category: 'Networking',
    img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80',
  },
];

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

  const [searchTitle, setSearchTitle] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [location, setLocation] = useState('');

  return (
    <AppLayout>
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
              <PrimaryButton onClick={() => navigate('/events')}>
                Explore Events
              </PrimaryButton>
              <button 
                onClick={() => navigate(user ? '/create' : '/login')}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#F5C451'}
                onMouseLeave={(e) => e.target.style.borderColor = '#E5E7EB'}
              >
                Create Event
              </button>
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
                <option>All Categories</option>
                <option>Technology</option>
                <option>Design</option>
                <option>Leadership</option>
                <option>Networking</option>
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

            <PrimaryButton onClick={() => navigate('/events')} style={{ width: '100%', borderRadius: '12px' }}>
              Search Events
            </PrimaryButton>
          </div>
        </section>

        {/* ── 3. METRIC STATISTICS ── */}
        <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} className="stats-grid">
            {STATS.map((stat, i) => (
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
            {FEATURED_EVENTS.map((evt) => (
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
                onClick={() => navigate('/events/1')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ height: '180px', overflow: 'hidden', background: '#F1F5F9' }}>
                  <img src={evt.img} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: '6px', alignSelf: 'flex-start', marginBottom: '12px' }}>
                    {evt.category.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                    {evt.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8', marginTop: 'auto' }}>
                    <FiCalendar /> <span>{evt.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>{evt.price}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#F5C451' }}>View Details &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
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
