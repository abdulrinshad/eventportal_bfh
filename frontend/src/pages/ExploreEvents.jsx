import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout, PageContainer, ContentCard, PrimaryButton } from '../components/ui/DesignSystem';
import { FiSearch, FiCalendar, FiMapPin, FiSend } from 'react-icons/fi';

const MOCK_EXPLORE_EVENTS = [
  {
    id: 1,
    title: 'Global AI Summit 2024',
    date: 'Dec 12-14, 2024',
    venue: 'Innovation Center, San Francisco',
    price: '$298.00',
    category: 'Tech Summit',
    isFree: false,
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Design Systems Masterclass',
    date: 'Nov 20, 2024',
    venue: 'London Innovation Lab',
    price: '$149.00',
    category: 'Workshop',
    isFree: false,
    img: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Founders & Funders Night',
    date: 'Jan 15, 2025',
    venue: 'The Sky Lounge, New York City',
    price: 'Free',
    category: 'Networking',
    isFree: true,
    img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'SaaS Connect 2024',
    date: 'Jan 18-20, 2025',
    venue: 'Silicon Valley',
    price: '$350.00',
    category: 'Conference',
    isFree: false,
    img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Future of Fintech',
    date: 'Feb 05, 2025',
    venue: 'Boston Financial Hub',
    price: '$89.00',
    category: 'Conference',
    isFree: false,
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Hack the Vision 2024',
    date: 'Oct 10-12, 2024',
    venue: 'Virtual / Online',
    price: 'Free',
    category: 'Hackathon',
    isFree: true,
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
];

function ExploreEvents() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCats, setSelectedCats] = useState(['All Events']);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [priceType, setPriceType] = useState('All');

  const handleCatChange = (catName) => {
    if (catName === 'All Events') {
      setSelectedCats(['All Events']);
    } else {
      let updated = selectedCats.filter(c => c !== 'All Events');
      if (updated.includes(catName)) {
        updated = updated.filter(c => c !== catName);
        if (updated.length === 0) updated = ['All Events'];
      } else {
        updated.push(catName);
      }
      setSelectedCats(updated);
    }
  };

  const filteredEvents = MOCK_EXPLORE_EVENTS.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCats.includes('All Events') || 
                       selectedCats.some(c => evt.category.toLowerCase().includes(c.toLowerCase()));
    
    const matchesPrice = priceType === 'All' || 
                         (priceType === 'Free' && evt.isFree) || 
                         (priceType === 'Paid' && !evt.isFree);

    return matchesSearch && matchesCat && matchesPrice;
  });

  return (
    <AppLayout>
      <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: '0px', fontFamily: 'var(--font-sans)' }}>
        
        {/* Main Content Container */}
        <PageContainer size="xl" style={{ marginTop: '30px' }}>
          
          {/* Header row with search input */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                Browse Events
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Discover and manage 124 upcoming events across the globe.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E7EB', borderRadius: '30px', padding: '8px 16px', background: '#FFFFFF', width: '280px' }}>
              <FiSearch color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#374151' }}
              />
            </div>
          </div>

          {/* Two-column layout grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }} className="explore-grid">
            
            {/* Filter Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Categories */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Categories
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['All Events', 'Conferences', 'Workshops', 'Networking', 'Tech Summit'].map(cat => (
                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(cat === 'Conferences' ? 'Conference' : cat === 'Workshops' ? 'Workshop' : cat)}
                        onChange={() => handleCatChange(cat === 'Conferences' ? 'Conference' : cat === 'Workshops' ? 'Workshop' : cat)}
                        style={{ width: '15px', height: '15px', borderRadius: '4px', accentColor: '#F5C451' }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </ContentCard>

              {/* Date Range */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Date Range
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>FROM</label>
                    <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>TO</label>
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              </ContentCard>

              {/* Price Type */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Price Type
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['All', 'Free', 'Paid'].map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="priceType"
                        checked={priceType === type}
                        onChange={() => setPriceType(type)}
                        style={{ width: '15px', height: '15px', accentColor: '#F5C451' }}
                      />
                      <span>{type === 'All' ? 'All Events' : type === 'Free' ? 'Free Events' : 'Paid Events'}</span>
                    </label>
                  ))}
                </div>
              </ContentCard>

              <button 
                onClick={() => {
                  setSelectedCats(['All Events']);
                  setSearchTerm('');
                  setPriceType('All');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#111827'}
                onMouseLeave={(e) => e.target.style.background = '#1F2937'}
              >
                Clear Filters
              </button>
            </aside>

            {/* Right Column: Events Grid */}
            <main>
              {filteredEvents.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }} className="explore-cards">
                    {filteredEvents.map(evt => (
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
                        <div style={{ height: '140px', overflow: 'hidden', background: '#F1F5F9' }}>
                          <img src={evt.img} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '8px' }}>
                            {evt.category.toUpperCase()}
                          </span>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', lineHeight: '1.4', minHeight: '40px' }}>
                            {evt.title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                            <FiCalendar /> <span>{evt.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                            <FiMapPin /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.venue}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>{evt.price}</span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#F5C451' }}>View Details</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '14px' }}>&lt;</button>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5C451', border: 'none', cursor: 'pointer', color: '#FFFFFF', fontSize: '14px', fontWeight: '700' }}>1</button>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', cursor: 'pointer', color: '#6B7280', fontSize: '14px' }}>2</button>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', cursor: 'pointer', color: '#6B7280', fontSize: '14px' }}>3</button>
                    <span style={{ color: '#94A3B8' }}>...</span>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', cursor: 'pointer', color: '#6B7280', fontSize: '14px' }}>12</button>
                    <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '14px' }}>&gt;</button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '60px 24px', textAlign: 'center', background: '#FFFFFF', border: '1.5px dashed #E5E7EB', borderRadius: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>No matching events found. Try adjusting your filters.</p>
                </div>
              )}
            </main>

          </div>

        </PageContainer>

        {/* Footer */}
        <footer style={{ background: '#FFFFFF', padding: '60px 24px 30px 24px', borderTop: '1px solid #F1F5F9', marginTop: '80px' }}>
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
          .explore-grid {
            grid-template-columns: 1fr !important;
          }
          .explore-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default ExploreEvents;
