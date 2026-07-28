import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { PageContainer, ContentCard, PrimaryButton } from '../../components/ui/DesignSystem';
import { FiSearch, FiCalendar, FiMapPin, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getStudentEventsApi } from '../../services/api';

// ── Event categories from the backend model ───────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: 'ALL',         label: 'All Events' },
  { value: 'ACADEMIC',   label: 'Academic' },
  { value: 'CULTURAL',   label: 'Cultural' },
  { value: 'SPORTS',     label: 'Sports' },
  { value: 'TECHNICAL',  label: 'Technical' },
  { value: 'WORKSHOP',   label: 'Workshop' },
  { value: 'SEMINAR',    label: 'Seminar' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'SOCIAL',     label: 'Social' },
  { value: 'OTHER',      label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'upcoming',   label: 'Upcoming First' },
  { value: 'newest',    label: 'Newest' },
  { value: 'oldest',    label: 'Oldest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// ── Format date helper ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Loading skeleton card ─────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFFFFF' }}>
    <div style={{ height: '160px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    <div style={{ padding: '20px' }}>
      {[80, 60, 70, 50].map((w, i) => (
        <div key={i} style={{ height: i === 1 ? 18 : 12, width: `${w}%`, borderRadius: '6px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: '10px' }} />
      ))}
    </div>
  </div>
);

export default function ExploreEvents() {
  const navigate = useNavigate();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');          // debounced
  const [selectedCategory, setCategory] = useState('ALL');
  const [priceType, setPriceType]       = useState('All');
  const [ordering, setOrdering]         = useState('upcoming');
  const [page, setPage]                 = useState(1);

  // ── API state ───────────────────────────────────────────────────────────────
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [totalCount, setTotalCount]     = useState(0);
  const [hasNext, setHasNext]           = useState(false);
  const [hasPrev, setHasPrev]           = useState(false);
  const [fetchErr, setFetchErr]         = useState(null);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // ── Debounce search input ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch events from backend ────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const params = {
        ordering,
        page,
      };
      if (search)                       params.search    = search;
      if (selectedCategory !== 'ALL')   params.category  = selectedCategory;
      if (priceType !== 'All')          params.price_type = priceType;

      const res = await getStudentEventsApi(params);
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
      setFetchErr('Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, priceType, ordering, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCategoryChange = (value) => { setCategory(value); setPage(1); };
  const handlePriceChange    = (value) => { setPriceType(value); setPage(1); };
  const handleOrderingChange = (value) => { setOrdering(value); setPage(1); };

  return (
    <StudentLayout activeItem="Explore Events">
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (max-width: 900px) {
          .explore-grid  { grid-template-columns: 1fr !important; }
          .explore-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        <PageContainer size="xl" style={{ marginTop: '30px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                Browse Events
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Discover and register for upcoming approved events.
                {!loading && <> Showing <strong>{events.length}</strong> of <strong>{totalCount}</strong> events.</>}
              </p>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E7EB', borderRadius: '30px', padding: '8px 16px', background: '#FFFFFF', width: '280px' }}>
              <FiSearch color="#94A3B8" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#374151' }}
              />
              {loading && <FiLoader color="#94A3B8" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
            </div>
          </div>

          {/* Error banner */}
          {fetchErr && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '14px 18px', color: '#991B1B', fontSize: '14px', marginBottom: '24px' }}>
              {fetchErr}{' '}
              <span style={{ cursor: 'pointer', fontWeight: '700' }} onClick={fetchEvents}>Retry</span>
            </div>
          )}

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="explore-grid">

            {/* Filter Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Sort */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Sort By
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {SORT_OPTIONS.map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sort"
                        checked={ordering === opt.value}
                        onChange={() => handleOrderingChange(opt.value)}
                        style={{ accentColor: '#F5C451', width: '15px', height: '15px' }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </ContentCard>

              {/* Categories */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Categories
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {CATEGORY_OPTIONS.map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === opt.value}
                        onChange={() => handleCategoryChange(opt.value)}
                        style={{ accentColor: '#F5C451', width: '15px', height: '15px' }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </ContentCard>

              {/* Price Type */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Ticket Fee
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'All',  label: 'All tickets' },
                    { value: 'Paid', label: 'Paid tickets' },
                    { value: 'Free', label: 'Free registrations' },
                  ].map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="price-filter"
                        checked={priceType === opt.value}
                        onChange={() => handlePriceChange(opt.value)}
                        style={{ accentColor: '#F5C451', width: '15px', height: '15px' }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </ContentCard>
            </aside>

            {/* Results Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}
                className="explore-cards"
              >
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                ) : events.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                    <span style={{ fontSize: '32px' }}>🔍</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '12px 0 6px 0' }}>No Events Available</h3>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                      {search || selectedCategory !== 'ALL' || priceType !== 'All'
                        ? 'Try adjusting your filters or search term.'
                        : 'No approved events are currently available. Check back soon!'}
                    </p>
                    {(search || selectedCategory !== 'ALL' || priceType !== 'All') && (
                      <button
                        onClick={() => { setSearchInput(''); setCategory('ALL'); setPriceType('All'); setPage(1); }}
                        style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  events.map(evt => {
                    // Prefer new is_paid/price; fall back to is_free/ticket_price for old events
                    const eventIsFree = evt.is_paid === false || evt.is_paid === 'false'
                      ? true
                      : evt.is_paid === true || evt.is_paid === 'true'
                      ? false
                      : (evt.is_free === true || !evt.ticket_price || evt.ticket_price == 0);
                    const displayPrice = eventIsFree
                      ? 'FREE'
                      : `₹${parseFloat(evt.price || evt.ticket_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
                    const seatsLeft = evt.available_seats ?? (evt.max_participants - evt.registered_count);
                    return (
                      <ContentCard
                        key={evt.id}
                        style={{ padding: '0px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #E5E7EB', borderRadius: '16px' }}
                      >
                        {/* Banner */}
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: '#F1F5F9' }}>
                          {evt.banner_url ? (
                            <img
                              src={evt.banner_url}
                              alt={evt.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1F2937, #374151)', fontSize: '48px' }}>
                              🎪
                            </div>
                          )}
                          {/* Price badge */}
                          <span style={{ position: 'absolute', top: '12px', right: '12px', background: eventIsFree ? '#DCFCE7' : '#FFFFFF', color: eventIsFree ? '#15803D' : '#111827', fontSize: '12px', fontWeight: '750', padding: '4px 10px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            {displayPrice}
                          </span>
                          {/* Seats badge */}
                          {seatsLeft <= 10 && seatsLeft > 0 && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
                              {seatsLeft} seats left
                            </span>
                          )}
                          {seatsLeft <= 0 && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#FEE2E2', color: '#991B1B', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
                              {evt.enable_waitlist ? 'Waitlist Open' : 'Full'}
                            </span>
                          )}
                        </div>

                        {/* Card body */}
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#F5C451', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            {evt.category}
                          </span>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {evt.title}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0' }}>
                            by {evt.organizer?.name || 'Unknown Organizer'}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px', fontSize: '13px', color: '#6B7280' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <FiCalendar size={13} /> {formatDate(evt.start_datetime)}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <FiMapPin size={13} /> {evt.venue}
                            </span>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                              Deadline: {formatDate(evt.registration_deadline)}
                            </span>
                          </div>
                          <PrimaryButton
                            onClick={() => navigate(`/events/${evt.id}`)}
                            style={{ width: '100%', marginTop: 'auto' }}
                          >
                            View Details
                          </PrimaryButton>
                        </div>
                      </ContentCard>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {!loading && totalCount > PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', paddingTop: '8px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrev}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', background: hasPrev ? '#FFFFFF' : '#F9FAFB', cursor: hasPrev ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: hasPrev ? '#111827' : '#9CA3AF' }}
                  >
                    <FiChevronLeft size={15} /> Prev
                  </button>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNext}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', background: hasNext ? '#FFFFFF' : '#F9FAFB', cursor: hasNext ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: hasNext ? '#111827' : '#9CA3AF' }}
                  >
                    Next <FiChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </div>
    </StudentLayout>
  );
}
