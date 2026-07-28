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

const IcoMapPin        = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoTrash         = ({ size = 16 }) => <Svg size={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></Svg>;
const IcoAlertTriangle = ({ size = 16 }) => <Svg size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const IcoX             = ({ size = 16 }) => <Svg size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;

/**
 * Backend category codes — must match Event.Category choices in models.py.
 * Bug fix: the previous code used display strings like 'Technology & Innovation'
 * which were not valid backend choices, causing every save to fail silently.
 */
const CATEGORY_OPTIONS = [
  { value: 'ACADEMIC',    label: 'Academic' },
  { value: 'CULTURAL',    label: 'Cultural' },
  { value: 'SPORTS',      label: 'Sports' },
  { value: 'TECHNICAL',   label: 'Technical' },
  { value: 'WORKSHOP',    label: 'Workshop' },
  { value: 'SEMINAR',     label: 'Seminar' },
  { value: 'CONFERENCE',  label: 'Conference' },
  { value: 'NETWORKING',  label: 'Networking' },
  { value: 'SOCIAL',      label: 'Social' },
  { value: 'OTHER',       label: 'Other' },
];

/**
 * Convert a backend ISO datetime string to the format required by
 * <input type="datetime-local">: "YYYY-MM-DDTHH:MM"
 *
 * Bug fix: the previous code did `.split('T')[0]` which dropped the time
 * portion, causing DateTimeField validation errors on save.
 */
function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  try {
    const dt = new Date(isoString);
    // Format: YYYY-MM-DDTHH:MM (no seconds, no timezone)
    const pad = (n) => String(n).padStart(2, '0');
    return (
      dt.getFullYear() + '-' +
      pad(dt.getMonth() + 1) + '-' +
      pad(dt.getDate()) + 'T' +
      pad(dt.getHours()) + ':' +
      pad(dt.getMinutes())
    );
  } catch {
    return '';
  }
}

/**
 * Convert a datetime-local value ("YYYY-MM-DDTHH:MM") to an ISO string
 * suitable for the backend. Appends ":00" seconds and "Z" suffix.
 */
function fromDatetimeLocal(val) {
  if (!val) return '';
  // val is already in "YYYY-MM-DDTHH:MM" — add seconds for full ISO
  return val.length === 16 ? val + ':00' : val;
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent, deleteEvent } = useContext(EventContext);

  const bannerInputRef = useRef();
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [saveFeedback,    setSaveFeedback]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]  = useState(false);
  const [addingTag,       setAddingTag]        = useState(false);
  const [tagInput,        setTagInput]         = useState('');

  // Track current event status so we can show resubmit messaging
  const [eventStatus,     setEventStatus]      = useState('');
  const [rejectionReason, setRejectionReason]  = useState('');

  const [form, setForm] = useState({
    bannerUrl:       null,   // absolute URL from backend for display
    bannerFile:      null,   // File object when user picks a new image
    title:           '',
    description:     '',
    category:        'OTHER',
    visibility:      'PUBLIC',
    startDatetime:   '',     // datetime-local string
    endDatetime:     '',
    registrationDeadline: '',
    venue:           '',
    ticketPrice:     0,
    maxParticipants: 100,
    contactEmail:    '',
    contactPhone:    '',
    website:         '',
    tags:            [],
  });

  // ── Fetch event on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // getEventById calls getEventDetailApi which already unwraps { success, data }
        const evt = await getEventById(id);
        if (evt) {
          setEventStatus(evt.status || '');
          setRejectionReason(evt.rejection_reason || '');
          setForm({
            // banner_url is the absolute URL returned by SerializerMethodField
            bannerUrl:            evt.banner_url || null,
            bannerFile:           null,
            title:                evt.title            || '',
            description:          evt.description      || '',
            // Bug fix: use backend category CODE, find it in CATEGORY_OPTIONS
            category:             CATEGORY_OPTIONS.find((c) => c.value === evt.category)
                                    ? evt.category
                                    : 'OTHER',
            visibility:           evt.visibility       || 'PUBLIC',
            // Bug fix: convert to datetime-local format, preserving time
            startDatetime:        toDatetimeLocal(evt.start_datetime),
            endDatetime:          toDatetimeLocal(evt.end_datetime),
            registrationDeadline: toDatetimeLocal(evt.registration_deadline),
            venue:                evt.venue            || '',
            ticketPrice:          evt.ticket_price != null ? Number(evt.ticket_price) : 0,
            maxParticipants:      evt.max_participants  || 100,
            contactEmail:         evt.contact_email    || '',
            contactPhone:         evt.contact_phone    || '',
            website:              evt.website          || '',
            tags:                 Array.isArray(evt.tags) ? evt.tags : [],
          });
        }
      } catch (err) {
        console.error('[EditEvent] failed to load event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const updateField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleBannerFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({
        ...f,
        bannerUrl:  URL.createObjectURL(file), // local preview
        bannerFile: file,                       // sent to backend on save
      }));
    }
  };

  const handleRemoveBanner = () => {
    setForm((f) => ({ ...f, bannerUrl: null, bannerFile: null }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Event Title is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title:                form.title,
        description:          form.description,
        category:             form.category,          // already a valid backend code
        visibility:           form.visibility,
        venue:                form.venue,
        ticket_price:         parseFloat(form.ticketPrice) || 0,
        max_participants:     parseInt(form.maxParticipants) || 100,
        contact_email:        form.contactEmail,
        contact_phone:        form.contactPhone,
        website:              form.website,
        // Bug fix: convert datetime-local back to full ISO string for backend
        start_datetime:       fromDatetimeLocal(form.startDatetime),
        end_datetime:         fromDatetimeLocal(form.endDatetime),
        registration_deadline: fromDatetimeLocal(form.registrationDeadline),
        tags:                 form.tags,
        bannerFile:           form.bannerFile,        // File | null
      };
      const updated = await updateEvent(id, payload);

      // Update local status if backend auto-transitioned REJECTED → PENDING
      if (updated && updated.status) {
        setEventStatus(updated.status);
        if (updated.status === 'PENDING') {
          setRejectionReason('');
        }
      }

      setSaveFeedback(true);
      setTimeout(() => {
        setSaveFeedback(false);
        navigate('/organizer/events');
      }, 1200);
    } catch (e) {
      const errMsg = e?.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : e.message;
      alert('Error updating event:\n' + errMsg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(id);
      setShowDeleteModal(false);
      navigate('/organizer/events');
    } catch (e) {
      alert('Error deleting event: ' + e.message);
    }
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      updateField('tags', [...form.tags, trimmed]);
    }
    setTagInput('');
    setAddingTag(false);
  };

  const removeTag = (tagToRemove) => {
    updateField('tags', form.tags.filter((t) => t !== tagToRemove));
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <OrganizerLayout activeItem="My Events">
        <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
          Loading event details…
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout activeItem="My Events">
      <PageContainer>
        <PageHeader
          title="Edit Event"
          description={
            eventStatus === 'REJECTED'
              ? 'Review admin feedback below, fix your event, and save to resubmit for approval.'
              : 'Modify details, settings, and logistics of your hosted experience.'
          }
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={() => navigate('/organizer/events')}>
                Discard
              </SecondaryButton>
              <PrimaryButton onClick={handleSave} loading={saving}>
                {saving
                  ? 'Saving…'
                  : saveFeedback
                  ? 'Saved! ✓'
                  : eventStatus === 'REJECTED'
                  ? 'Save & Resubmit'
                  : 'Save Event'}
              </PrimaryButton>
            </div>
          }
        />

        {/* Rejection reason banner — only shown for REJECTED events */}
        {eventStatus === 'REJECTED' && (
          <div style={{
            background: '#FFF1F2',
            border: '1px solid #FEE2E2',
            borderLeft: '4px solid #EF4444',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '700', marginBottom: '6px' }}>
              <IcoAlertTriangle size={16} />
              <span>This event was rejected by an administrator</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#991B1B', lineHeight: '1.5' }}>
              <strong>Admin Note:</strong>{' '}
              {rejectionReason || 'No reason provided.'}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#B45309' }}>
              Make your changes below and click <strong>Save &amp; Resubmit</strong> to send it back for review.
            </p>
          </div>
        )}

        {/* Delete confirmation modal */}
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
                  background: '#EF4444', color: '#FFFFFF', border: 'none',
                  borderRadius: '12px', padding: '10px 18px', fontWeight: '600',
                  fontSize: '14px', cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: '8px',
                }}
              >
                <IcoTrash size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </Modal>

        {/* Main content */}
        <div className="ee-main" style={{ padding: 0 }}>
          <div className="ee-cols">

            {/* ── Left Column ────────────────────────────────────────────── */}
            <div className="ee-left-col">

              {/* Banner Card */}
              <div className="ee-card">
                <h2 className="ee-card-title">Event Banner</h2>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '220px', background: '#F1F5F9', marginBottom: '12px' }}>
                  {form.bannerUrl ? (
                    <img
                      src={form.bannerUrl}
                      alt="Event banner preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px' }}>
                      No banner image
                    </div>
                  )}
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      background: 'rgba(255,255,255,0.92)', border: 'none',
                      borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
                      fontWeight: '600', color: '#111827', cursor: 'pointer',
                    }}
                  >
                    {form.bannerUrl ? 'Change Image' : 'Upload Image'}
                  </button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBannerFile}
                  />
                </div>
                {form.bannerUrl && (
                  <button
                    onClick={handleRemoveBanner}
                    style={{
                      fontSize: '12px', color: '#EF4444', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <IcoX size={12} /> Remove banner
                  </button>
                )}
              </div>

              {/* Basic Information */}
              <div className="ee-card">
                <h2 className="ee-card-title">Basic Information</h2>

                <div className="ee-field" style={{ marginBottom: '16px' }}>
                  <label className="ee-label" htmlFor="ee-title">Event Title <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    id="ee-title"
                    className="ee-input"
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="ee-field" style={{ marginBottom: '16px' }}>
                  <label className="ee-label" htmlFor="ee-desc">Description</label>
                  <textarea
                    id="ee-desc"
                    className="ee-textarea"
                    rows={6}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                <div className="ee-form-row" style={{ marginTop: '4px' }}>
                  {/* Category — Bug fix: uses backend codes, not display strings */}
                  <div className="ee-field ee-field--grow">
                    <label className="ee-label" htmlFor="ee-cat">Category</label>
                    <div className="ee-select-wrap">
                      <select
                        id="ee-cat"
                        className="ee-select"
                        value={form.category}
                        onChange={(e) => updateField('category', e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="ee-field ee-field--shrink">
                    <label className="ee-label">Visibility</label>
                    <div className="ee-visibility-toggle">
                      <button
                        className={`ee-vis-btn${form.visibility === 'PUBLIC' ? ' active' : ''}`}
                        onClick={() => updateField('visibility', 'PUBLIC')}
                      >Public</button>
                      <button
                        className={`ee-vis-btn${form.visibility === 'PRIVATE' ? ' active' : ''}`}
                        onClick={() => updateField('visibility', 'PRIVATE')}
                      >Private</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="ee-card">
                <h2 className="ee-card-title">Contact Details</h2>
                <div className="ee-form-row">
                  <div className="ee-field ee-field--grow">
                    <label className="ee-label" htmlFor="ee-email">Contact Email</label>
                    <input
                      id="ee-email"
                      className="ee-input"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="ee-field ee-field--grow">
                    <label className="ee-label" htmlFor="ee-phone">Contact Phone</label>
                    <input
                      id="ee-phone"
                      className="ee-input"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ───────────────────────────────────────────── */}
            <div className="ee-right-col">

              {/* Logistics & Dates */}
              <div className="ee-card">
                <h2 className="ee-card-title">
                  <IcoMapPin size={14} /> Logistics &amp; Dates
                </h2>

                {/* Bug fix: use datetime-local (not date) to preserve time */}
                <div className="ee-field" style={{ marginBottom: '12px' }}>
                  <label className="ee-label">Start Date &amp; Time</label>
                  <input
                    className="ee-input"
                    type="datetime-local"
                    value={form.startDatetime}
                    onChange={(e) => updateField('startDatetime', e.target.value)}
                  />
                </div>
                <div className="ee-field" style={{ marginBottom: '12px' }}>
                  <label className="ee-label">End Date &amp; Time</label>
                  <input
                    className="ee-input"
                    type="datetime-local"
                    value={form.endDatetime}
                    onChange={(e) => updateField('endDatetime', e.target.value)}
                  />
                </div>
                <div className="ee-field" style={{ marginBottom: '12px' }}>
                  <label className="ee-label">Registration Deadline</label>
                  <input
                    className="ee-input"
                    type="datetime-local"
                    value={form.registrationDeadline}
                    onChange={(e) => updateField('registrationDeadline', e.target.value)}
                  />
                </div>
                <div className="ee-field">
                  <label className="ee-label">Location / Venue</label>
                  <input
                    className="ee-input"
                    type="text"
                    value={form.venue}
                    onChange={(e) => updateField('venue', e.target.value)}
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
                      step="0.01"
                      value={form.ticketPrice}
                      onChange={(e) => updateField('ticketPrice', e.target.value)}
                      aria-label="Price per ticket"
                    />
                  </div>
                  <span className="ee-per-ticket">Per Ticket</span>
                </div>
              </div>

              {/* Max Participants */}
              <div className="ee-card">
                <h2 className="ee-card-title-sm">Capacity</h2>
                <div className="ee-field">
                  <label className="ee-label" htmlFor="ee-max">Max Participants</label>
                  <input
                    id="ee-max"
                    className="ee-input"
                    type="number"
                    min={1}
                    value={form.maxParticipants}
                    onChange={(e) => updateField('maxParticipants', e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="ee-card">
                <h2 className="ee-card-title-sm">Quick Tags</h2>
                <div className="ee-tags">
                  {form.tags.map((tag) => (
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
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
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
                  Once deleted, this event and all its registrations cannot be recovered.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '12px',
                    background: '#FEF2F2', border: '1.5px solid #FEE2E2',
                    color: '#EF4444', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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
