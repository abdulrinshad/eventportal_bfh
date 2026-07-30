import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout, PageContainer, ContentCard, PrimaryButton } from '../components/ui/DesignSystem';
import { FiSearch, FiCalendar, FiMapPin, FiSend, FiLoader } from 'react-icons/fi';
import { getPublicEventsApi } from '../services/api';

// ── Format date helper ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Loading skeleton card ─────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFFFFF', padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ height: '140px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ height: '16px', width: '40%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ height: '20px', width: '80%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ height: '12px', width: '60%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ height: '12px', width: '50%', borderRadius: '4px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    </div>
  </div>
);

function ExploreEvents() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [debouncedSearch, setDebouncedSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [selectedCats, setSelectedCats] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    return cat ? [cat] : ['All Events'];
  });
  const [locationFilter, setLocationFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('location') || '';
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [priceType, setPriceType] = useState('All');

  // ── API state ───────────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // ── Debounce search input ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Fetch events from backend ────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      
      let apiCategory = undefined;
      const nonAllCats = selectedCats.filter(c => c !== 'All Events');
      if (nonAllCats.length === 1) {
        const cat = nonAllCats[0];
        if (cat === 'Conference') apiCategory = 'CONFERENCE';
        else if (cat === 'Workshop') apiCategory = 'WORKSHOP';
        else if (cat === 'Networking') apiCategory = 'NETWORKING';
        else if (cat === 'Tech Summit') apiCategory = 'TECHNICAL';
      }
      if (apiCategory) {
        params.category = apiCategory;
      }
      
      if (priceType !== 'All') {
        params.price_type = priceType;
      }
      
      const res = await getPublicEventsApi(params);
      if (res && res.success) {
        setEvents(res.data || []);
        setTotalCount(res.count || 0);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      } else {
        setEvents([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError('Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCats, priceType, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    setPage(1);
  };

  const filteredEvents = events.filter(evt => {
    // Client-side date range filter if provided
    if (fromDate) {
      const eventDate = new Date(evt.event_date || evt.start_date || evt.start_datetime);
      const filterFrom = new Date(fromDate);
      if (eventDate < filterFrom) return false;
    }
    if (toDate) {
      const eventDate = new Date(evt.event_date || evt.start_date || evt.start_datetime);
      const filterTo = new Date(toDate);
      if (eventDate > filterTo) return false;
    }

    // Secondary category check for multi-select logic (if more than 1 category is selected)
    const nonAllCats = selectedCats.filter(c => c !== 'All Events');
    if (nonAllCats.length > 1) {
      const matchesCat = nonAllCats.some(c => {
        let mapped = c;
        if (c === 'Conference') mapped = 'CONFERENCE';
        else if (c === 'Workshop') mapped = 'WORKSHOP';
        else if (c === 'Networking') mapped = 'NETWORKING';
        else if (c === 'Tech Summit') mapped = 'TECHNICAL';
        return evt.category && evt.category.toUpperCase() === mapped.toUpperCase();
      });
      if (!matchesCat) return false;
    }

    // Client-side location check
    if (locationFilter) {
      const loc = (evt.venue || evt.location || '').toLowerCase();
      if (!loc.includes(locationFilter.toLowerCase())) return false;
    }

    return true;
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
                {loading ? (
                  'Loading upcoming events...'
                ) : (
                  <>Discover and manage <strong>{totalCount}</strong> upcoming events across the globe.</>
                )}
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
              {loading && <FiLoader color="#94A3B8" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '14px 18px', color: '#991B1B', fontSize: '14px', marginBottom: '24px' }}>
              {error}{' '}
              <span style={{ cursor: 'pointer', fontWeight: '700' }} onClick={fetchEvents}>Retry</span>
            </div>
          )}

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
                      onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>TO</label>
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => { setToDate(e.target.value); setPage(1); }}
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
                        onChange={() => { setPriceType(type); setPage(1); }}
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
                  setFromDate('');
                  setToDate('');
                  setPriceType('All');
                  setPage(1);
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
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }} className="explore-cards">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : filteredEvents.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }} className="explore-cards">
                    {filteredEvents.map(evt => {
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
                          <div style={{ height: '140px', overflow: 'hidden', background: '#F1F5F9' }}>
                            {evt.banner_url || evt.banner || evt.image ? (
                              <img src={evt.banner_url || evt.banner || evt.image} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1F2937, #374151)', fontSize: '48px' }}>
                                🎪
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '8px' }}>
                              {(evt.category || '').toUpperCase()}
                            </span>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', lineHeight: '1.4', minHeight: '40px' }}>
                              {evt.title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                              <FiCalendar /> <span>{formatDate(evt.event_date || evt.start_date || evt.start_datetime)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                              <FiMapPin /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.venue || evt.location}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: isFree ? '12px' : '15px', fontWeight: '800', color: isFree ? '#15803D' : '#111827', background: isFree ? '#DCFCE7' : 'transparent', padding: isFree ? '2px 10px' : '0px', borderRadius: isFree ? '20px' : '0px' }}>
                                {displayPrice}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#F5C451' }}>View Details</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalCount > 10 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!hasPrev}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: hasPrev ? 'pointer' : 'not-allowed', color: '#6B7280', fontSize: '14px' }}
                      >
                        &lt;
                      </button>
                      {Array.from({ length: Math.ceil(totalCount / 10) }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = page === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isActive ? '#F5C451' : '#FFFFFF',
                              border: isActive ? 'none' : '1px solid #E5E7EB',
                              cursor: 'pointer',
                              color: isActive ? '#FFFFFF' : '#6B7280',
                              fontSize: '14px',
                              fontWeight: isActive ? '700' : '400'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasNext}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: hasNext ? 'pointer' : 'not-allowed', color: '#6B7280', fontSize: '14px' }}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
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
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
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

