import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton, Modal } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import '../EditEvent.css';

/* ─────────────────────────────────────────────────────
   INLINE SVG ICONS
   ───────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IcoMapPin         = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoTrash          = ({ size = 16 }) => <Svg size={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></Svg>;
const IcoAlertTriangle  = ({ size = 16 }) => <Svg size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const IcoX              = ({ size = 16 }) => <Svg size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;

const CATEGORIES = [
  'Technology & Innovation', 'Business & Finance', 'Design & UX',
  'Marketing', 'Music & Arts', 'Sports & Fitness',
  'Food & Beverage', 'Education', 'Entertainment', 'Health & Wellness',
];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent, deleteEvent } = useContext(EventContext);

  const bannerInputRef = useRef();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    bannerUrl:       '',
    title:           '',
    description:     '',
    category:        CATEGORIES[0],
    visibility:      'public',
    startDate:       '',
    endDate:         '',
    location:        '',
    price:           0,
    maxParticipants: 100,
    registrations:   0,
    tags:            [],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const evt = await getEventById(id);
        if (evt) {
          setForm({
            bannerUrl:       evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
            title:           evt.title || '',
            description:     evt.description || '',
            category:        evt.category || CATEGORIES[0],
            visibility:      'public',
            startDate:       evt.date ? evt.date.split(' ')[0] : '',
            endDate:         evt.date ? evt.date.split(' ')[0] : '',
            location:        evt.venueName || '',
            price:           evt.price || 0,
            maxParticipants: evt.maxParticipants || 100,
            registrations:   evt.attendeesCount || 0,
            tags:            evt.category ? [evt.category.split(' ')[0]] : ['Technology'],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, getEventById]);

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleBannerFile = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateField('bannerUrl', url);
    }
  };

  const handleDiscard = () => {
    navigate('/organizer/events');
  };

  const handleSave = async () => {
    if (!form.title) {
      alert('Event Title is required.');
      return;
    }
    setSaving(true);
    try {
      const updatedEvt = {
        title: form.title,
        category: form.category,
        date: form.startDate || 'TBD',
        venueName: form.location,
        address: form.location,
        price: parseFloat(form.price || 0),
        maxParticipants: parseInt(form.maxParticipants || 100),
        image: form.bannerUrl,
        description: form.description,
        status: 'pending' // Resubmit to pending state after edits!
      };
      await updateEvent(id, updatedEvt);
      setSaveFeedback(true);
      setTimeout(() => {
        setSaveFeedback(false);
        navigate('/organizer/events');
      }, 1000);
    } catch (e) {
      alert('Error updating event: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(id);
      setShowDeleteModal(false);
      alert('Event deleted successfully.');
      navigate('/organizer/events');
    } catch (e) {
      alert('Error deleting event: ' + e.message);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      updateField('tags', [...form.tags, tagInput.trim()]);
    }
    setTagInput('');
    setAddingTag(false);
  };

  const removeTag = tagToRemove => {
    updateField('tags', form.tags.filter(t => t !== tagToRemove));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading event details...</div>;

  const regPercent = Math.min(100, Math.round((form.registrations / form.maxParticipants) * 100));

  return (
    <OrganizerLayout activeItem="My Events">
      <PageContainer>
        <PageHeader
          title="Edit Event"
          description="Modify details, settings, and logistics of your hosted experience."
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={handleDiscard}>
                Discard
              </SecondaryButton>
              <PrimaryButton onClick={handleSave} loading={saving}>
                {saveFeedback ? 'Saved!' : 'Save Event'}
              </PrimaryButton>
            </div>
          }
        />

        {/* Modal deletion */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Event"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{form.title}"</strong>?
              All registrations will be cancelled. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Keep Event</SecondaryButton>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <IcoTrash size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </Modal>

        {/* Content body */}
        <div className="ee-main" style={{ padding: 0 }}>
          <div className="ee-cols">
            
            {/* Left Col */}
            <div className="ee-left-col">
              
              {/* Banner Card */}
              <div className="ee-card">
                <h2 className="ee-card-title">Event Banner</h2>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '220px', background: '#F1F5F9', marginBottom: '16px' }}>
                  <img 
                    src={form.bannerUrl} 
                    alt="Event banner preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#111827',
                      cursor: 'pointer',
                    }}
                  >
                    Change Image
                  </button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBannerFile}
                  />
                </div>
              </div>

              {/* Title & Desc */}
              <div className="ee-card">
                <h2 className="ee-card-title">Basic Information</h2>
                
                <div className="ee-field" style={{ marginBottom: '16px' }}>
                  <label className="ee-label" htmlFor="ee-title">Event Title</label>
                  <input
                    id="ee-title"
                    className="ee-input"
                    type="text"
                    value={form.title}
                    onChange={e => updateField('title', e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="ee-field">
                  <label className="ee-label" htmlFor="ee-desc">Description</label>
                  <textarea
                    id="ee-desc"
                    className="ee-textarea"
                    rows={6}
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                  />
                </div>

                <div className="ee-form-row" style={{ marginTop: '16px' }}>
                  <div className="ee-field ee-field--grow">
                    <label className="ee-label" htmlFor="ee-cat">Category</label>
                    <div className="ee-select-wrap">
                      <select
                        id="ee-cat"
                        className="ee-select"
                        value={form.category}
                        onChange={e => updateField('category', e.target.value)}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="ee-field ee-field--shrink">
                    <label className="ee-label">Visibility</label>
                    <div className="ee-visibility-toggle">
                      <button
                        className={`ee-vis-btn${form.visibility === 'public' ? ' active' : ''}`}
                        onClick={() => updateField('visibility', 'public')}
                      >Public</button>
                      <button
                        className={`ee-vis-btn${form.visibility === 'private' ? ' active' : ''}`}
                        onClick={() => updateField('visibility', 'private')}
                      >Private</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="ee-right-col">
              
              {/* Logistics */}
              <div className="ee-card">
                <h2 className="ee-card-title">
                  <IcoMapPin size={14} /> Logistics &amp; Date
                </h2>
                <div className="ee-field" style={{ marginBottom: '12px' }}>
                  <label className="ee-label">Start Date</label>
                  <input
                    className="ee-input"
                    type="date"
                    value={form.startDate}
                    onChange={e => updateField('startDate', e.target.value)}
                  />
                </div>
                <div className="ee-field" style={{ marginBottom: '12px' }}>
                  <label className="ee-label">End Date</label>
                  <input
                    className="ee-input"
                    type="date"
                    value={form.endDate}
                    onChange={e => updateField('endDate', e.target.value)}
                  />
                </div>
                <div className="ee-field">
                  <label className="ee-label">Location / Venue</label>
                  <input
                    className="ee-input"
                    type="text"
                    value={form.location}
                    onChange={e => updateField('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="ee-card">
                <h2 className="ee-card-title-sm">Pricing (USD)</h2>
                <div className="ee-pricing-row">
                  <div className="ee-pricing-input-wrap">
                    <span className="ee-dollar">$</span>
                    <input
                      className="ee-input ee-input--price"
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={e => updateField('price', e.target.value)}
                      aria-label="Price per ticket"
                    />
                  </div>
                  <span className="ee-per-ticket">Per Ticket</span>
                </div>
              </div>

              {/* Tags */}
              <div className="ee-card">
                <h2 className="ee-card-title-sm">Quick Tags</h2>
                <div className="ee-tags">
                  {form.tags.map(tag => (
                    <span key={tag} className="ee-tag">
                      {tag}
                      <button
                        className="ee-tag__remove"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        <IcoX size={11} />
                      </button>
                    </span>
                  ))}
                  {addingTag ? (
                    <span className="ee-tag-input-wrap">
                      <input
                        className="ee-tag-input"
                        type="text"
                        value={tagInput}
                        placeholder="Tag name…"
                        autoFocus
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addTag();
                          if (e.key === 'Escape') { setAddingTag(false); setTagInput(''); }
                        }}
                      />
                      <button className="ee-tag-confirm" onClick={addTag}>Add</button>
                    </span>
                  ) : (
                    <button className="ee-tag-add" onClick={() => setAddingTag(true)}>
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="ee-card" style={{ border: '1px solid #FEE2E2', background: '#FFFDFD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>
                  <IcoAlertTriangle size={15} />
                  <span>Danger Zone</span>
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  Once deleted, this event cannot be recovered.
                </p>
                <button
                  type="button"
                  className="ee-btn-delete"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    background: '#FEF2F2',
                    border: '1.5px solid #FEE2E2',
                    color: '#EF4444',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <IcoTrash size={15} /> Delete Event
                </button>
              </div>

            </div>
          </div>
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
