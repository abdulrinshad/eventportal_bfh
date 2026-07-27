import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { EventContext } from '../../context/EventContext';
import StudentLayout from './StudentLayout';
import { PageContainer, ContentCard, PrimaryButton } from '../../components/ui/DesignSystem';
import { FiSearch, FiCalendar, FiMapPin, FiSend } from 'react-icons/fi';

const CATEGORIES = [
  'All Events', 'Technology & Innovation', 'Artificial Intelligence',
  'Design Systems', 'Product Strategy', 'Workshop', 'Hackathon'
];

export default function ExploreEvents() {
  const { user } = useContext(AuthContext);
  const { events } = useContext(EventContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCats, setSelectedCats] = useState(['All Events']);
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

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (evt.venueName && evt.venueName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = selectedCats.includes('All Events') || 
                       selectedCats.some(c => evt.category.toLowerCase().includes(c.toLowerCase()));
                       
    const isFree = evt.price === 0 || evt.price === 'Free' || !evt.price;
    const matchesPrice = priceType === 'All' || 
                         (priceType === 'Free' && isFree) || 
                         (priceType === 'Paid' && !isFree);

    return matchesSearch && matchesCat && matchesPrice;
  });

  return (
    <StudentLayout activeItem="Explore Events">
      <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: '0px', fontFamily: 'var(--font-sans)' }}>
        <PageContainer size="xl" style={{ marginTop: '30px' }}>
          {/* Header row with search input */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                Browse Events
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Discover and register for upcoming premium technical conferences and summits.
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
                  {CATEGORIES.map(cat => {
                    const checked = selectedCats.includes(cat);
                    return (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={checked}
                          onChange={() => handleCatChange(cat)}
                          style={{ accentColor: '#F5C451', width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid #D1D5DB' }}
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
              </ContentCard>

              {/* Price Type */}
              <ContentCard style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  Ticket Fee
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['All', 'Paid', 'Free'].map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="price-filter"
                        checked={priceType === type}
                        onChange={() => setPriceType(type)}
                        style={{ accentColor: '#F5C451', width: '16px', height: '16px' }}
                      />
                      {type === 'All' ? 'All tickets' : type === 'Paid' ? 'Paid tickets' : 'Free registrations'}
                    </label>
                  ))}
                </div>
              </ContentCard>
            </aside>

            {/* Results Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }} className="explore-cards">
                {filteredEvents.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                    <span style={{ fontSize: '32px' }}>🔍</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '12px 0 6px 0' }}>No events found</h3>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Try adjusting your keywords or category filters.</p>
                  </div>
                ) : (
                  filteredEvents.map(evt => {
                    const priceVal = evt.price === 0 || evt.price === 'Free' || !evt.price ? 'Free' : `$${evt.price}`;
                    return (
                      <ContentCard key={evt.id} style={{ padding: '0px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'} 
                            alt={evt.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#FFFFFF', color: '#111827', fontSize: '12px', fontWeight: '750', padding: '4px 10px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            {priceVal}
                          </span>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#F5C451', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            {evt.category}
                          </span>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)', lineUpperLimit: 2, height: '44px', overflow: 'hidden' }}>
                            {evt.title}
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '13px', color: '#6B7280' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <FiCalendar size={14} /> {evt.date || 'TBD'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <FiMapPin size={14} /> {evt.venueName || 'Virtual'}
                            </span>
                          </div>
                          <PrimaryButton onClick={() => navigate(`/events/${evt.id}`)} style={{ width: '100%', marginTop: 'auto' }}>
                            View Tickets
                          </PrimaryButton>
                        </div>
                      </ContentCard>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </PageContainer>
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
    </StudentLayout>
  );
}
