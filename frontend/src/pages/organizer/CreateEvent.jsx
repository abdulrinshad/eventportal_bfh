import React, { useState, useRef, useContext } from 'react';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../CreateEvent.css';

/* ─────────────────────────────────────────────────────
   INLINE SVG ICONS
   ───────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IcoUpload  = ({ size = 16 }) => <Svg size={size}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></Svg>;
const IcoMapPin  = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoUsers   = ({ size = 16 }) => <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const IcoInfo    = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Svg>;
const IcoBold    = ({ size = 16 }) => <Svg size={size} fill="currentColor" stroke="none"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></Svg>;
const IcoItalic  = ({ size = 16 }) => <Svg size={size}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></Svg>;
const IcoLink    = ({ size = 16 }) => <Svg size={size}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>;
const IcoSearch  = ({ size = 16 }) => <Svg size={size}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>;

/* ─── Inline field error ──────────────────────────────────────────────────── */
const FieldError = ({ msg }) =>
  msg ? <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>{msg}</span> : null;

/**
 * Backend category codes that map to the display labels shown in the UI.
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

/* ─────────────────────────────────────────────────────
   BannerUpload sub-component
   ───────────────────────────────────────────────────── */
const BannerUpload = ({ preview, onFile, error }) => {
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    onFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="ce-banner-section">
      <h3 className="ce-section-title">Event Banner</h3>
      <p className="ce-section-sub">
        This image will appear at the top of your event listing (16:9 ratio recommended).
      </p>
      <div
        className={`ce-upload-area${preview ? ' has-preview' : ''}`}
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="Upload banner image"
      >
        {preview ? (
          <img src={preview} alt="Banner preview" className="ce-upload-preview" />
        ) : (
          <div className="ce-upload-body">
            <div className="ce-upload-icon-wrap"><IcoUpload size={26} /></div>
            <p className="ce-upload-text">
              Drag &amp; drop or <span className="ce-upload-link">click to upload</span>
            </p>
            <p className="ce-upload-hint">PNG, JPG or WebP (Max 10MB)</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
        />
      </div>
      {error && <FieldError msg={error} />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   EventPricingCard sub-component
   ───────────────────────────────────────────────────── */
const EventPricingCard = ({ isPaid, price, onIsPaidChange, onPriceChange, priceError }) => (
  <div className="ce-section-card">
    <h3 className="ce-section-title">Event Pricing</h3>

    {/* Event Type Radio Buttons */}
    <div style={{ display: 'flex', gap: '24px', marginBottom: isPaid ? '16px' : '0' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
        <input
          type="radio"
          name="ce-event-type"
          id="ce-event-free"
          checked={!isPaid}
          onChange={() => onIsPaidChange(false)}
          style={{ width: '16px', height: '16px', accentColor: '#F5C451', cursor: 'pointer' }}
        />
        Free Event
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
        <input
          type="radio"
          name="ce-event-type"
          id="ce-event-paid"
          checked={isPaid}
          onChange={() => onIsPaidChange(true)}
          style={{ width: '16px', height: '16px', accentColor: '#F5C451', cursor: 'pointer' }}
        />
        Paid Event
      </label>
    </div>

    {/* Amount field — only visible when Paid */}
    {isPaid && (
      <div className="ce-field" style={{ maxWidth: '280px' }}>
        <label className="ce-label" htmlFor="ce-price">
          Charge Amount <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div className="ce-pricing-input-wrap" style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${priceError ? '#EF4444' : '#E2E8F0'}`, borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF' }}>
          <span style={{
            padding: '0 12px',
            fontSize: '15px',
            fontWeight: '700',
            color: '#374151',
            background: '#F8FAFC',
            borderRight: `1.5px solid ${priceError ? '#EF4444' : '#E2E8F0'}`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '42px',
          }}>₹</span>
          <input
            id="ce-price"
            className="ce-input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter event fee"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            style={{ border: 'none', borderRadius: 0, flex: 1, paddingLeft: '10px' }}
          />
        </div>
        <FieldError msg={priceError} />
        <span className="ce-field-hint">E.g. ₹250 or ₹500. Decimals allowed.</span>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────
   GeneralInfoTab — only tab (General Info)
   ───────────────────────────────────────────────────── */
const GeneralInfoTab = ({ form, onChange, onBannerFile, errors, setErrors }) => (
  <div className="ce-tab-content">
    <BannerUpload preview={form.bannerPreview} onFile={onBannerFile} error={errors.banner} />

    <div className="ce-form-card">
      <div className="ce-form-row">
        {/* Title */}
        <div className="ce-field ce-field--grow">
          <label className="ce-label" htmlFor="ce-title">Event Title <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-title"
            className="ce-input"
            type="text"
            placeholder="e.g. CompilVision Global Tech Summit 2026"
            value={form.title}
            onChange={(e) => {
              onChange('title', e.target.value);
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            maxLength={100}
            style={{ borderColor: errors.title ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.title} />
          <span className="ce-field-hint">Catchy titles work best. Limit to 100 characters.</span>
        </div>
        {/* Category */}
        <div className="ce-field ce-field--category">
          <label className="ce-label" htmlFor="ce-category">Category <span style={{ color: '#EF4444' }}>*</span></label>
          <div className="ce-select-wrap">
            <select
              id="ce-category"
              className="ce-select"
              value={form.category}
              onChange={(e) => {
                onChange('category', e.target.value);
                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
              }}
              style={{ borderColor: errors.category ? '#EF4444' : undefined }}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <FieldError msg={errors.category} />
        </div>
      </div>

      <div className="ce-form-row ce-form-row--top">
        {/* Description */}
        <div className="ce-field ce-field--grow">
          <div className="ce-label-row">
            <label className="ce-label" htmlFor="ce-desc">Description <span style={{ color: '#EF4444' }}>*</span></label>
            <div className="ce-format-btns">
              <button className="ce-fmt-btn" title="Bold" onClick={(e) => e.preventDefault()}><IcoBold size={13} /></button>
              <button className="ce-fmt-btn" title="Italic" onClick={(e) => e.preventDefault()}><IcoItalic size={13} /></button>
              <button className="ce-fmt-btn" title="Insert link" onClick={(e) => e.preventDefault()}><IcoLink size={13} /></button>
            </div>
          </div>
          <textarea
            id="ce-desc"
            className="ce-textarea"
            rows={7}
            placeholder="Describe what makes your event unique..."
            value={form.description}
            onChange={(e) => {
              onChange('description', e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
            style={{ borderColor: errors.description ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.description} />
        </div>

        {/* Max Participants */}
        <div className="ce-field ce-field--participants">
          <label className="ce-label" htmlFor="ce-max">Max Participants <span style={{ color: '#EF4444' }}>*</span></label>
          <div className="ce-input-with-icon">
            <input
              id="ce-max"
              className="ce-input"
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) => {
                onChange('maxParticipants', e.target.value);
                if (errors.maxParticipants) setErrors(prev => ({ ...prev, maxParticipants: '' }));
              }}
              style={{ borderColor: errors.maxParticipants ? '#EF4444' : undefined }}
            />
            <span className="ce-input-suffix-icon" title="Maximum number of registered attendees">
              <IcoInfo size={15} />
            </span>
          </div>
          <FieldError msg={errors.maxParticipants} />
          <label className="ce-checkbox-row">
            <input
              type="checkbox"
              className="ce-checkbox"
              checked={form.enableWaitlist}
              onChange={(e) => onChange('enableWaitlist', e.target.checked)}
            />
            <span className="ce-checkbox-label">Enable waitlist</span>
          </label>
        </div>
      </div>
    </div>

    {/* Event Pricing */}
    <EventPricingCard
      isPaid={form.is_paid}
      price={form.price}
      onIsPaidChange={(val) => onChange('is_paid', val)}
      onPriceChange={(val) => {
        onChange('price', val);
        if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
      }}
      priceError={errors.price}
    />

    {/* Time & Location */}
    <div className="ce-section-card">
      <h3 className="ce-section-title ce-section-title--icon">
        <IcoMapPin size={15} /> Time &amp; Location
      </h3>
      <div className="ce-form-row">
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-start">Start Date &amp; Time <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-start"
            className="ce-input"
            type="datetime-local"
            value={form.startDatetime}
            onChange={(e) => {
              onChange('startDatetime', e.target.value);
              if (errors.startDatetime) setErrors(prev => ({ ...prev, startDatetime: '' }));
            }}
            style={{ borderColor: errors.startDatetime ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.startDatetime} />
        </div>
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-venue">Venue / Location <span style={{ color: '#EF4444' }}>*</span></label>
          <div className="ce-input-with-icon ce-input-with-icon--left">
            <span className="ce-input-prefix-icon"><IcoSearch size={14} /></span>
            <input
              id="ce-venue"
              className="ce-input ce-input--padded-left"
              type="text"
              placeholder="Search for a venue..."
              value={form.venue}
              onChange={(e) => {
                onChange('venue', e.target.value);
                if (errors.venue) setErrors(prev => ({ ...prev, venue: '' }));
              }}
              style={{ borderColor: errors.venue ? '#EF4444' : undefined }}
            />
          </div>
          <FieldError msg={errors.venue} />
        </div>
      </div>
      <div className="ce-form-row">
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-end">End Date &amp; Time <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-end"
            className="ce-input"
            type="datetime-local"
            value={form.endDatetime}
            onChange={(e) => {
              onChange('endDatetime', e.target.value);
              if (errors.endDatetime) setErrors(prev => ({ ...prev, endDatetime: '' }));
            }}
            style={{ borderColor: errors.endDatetime ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.endDatetime} />
        </div>
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-deadline">Registration Deadline <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-deadline"
            className="ce-input"
            type="datetime-local"
            value={form.registrationDeadline}
            onChange={(e) => {
              onChange('registrationDeadline', e.target.value);
              if (errors.registrationDeadline) setErrors(prev => ({ ...prev, registrationDeadline: '' }));
            }}
            style={{ borderColor: errors.registrationDeadline ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.registrationDeadline} />
        </div>
      </div>
    </div>

    {/* Contact Details */}
    <div className="ce-section-card">
      <h3 className="ce-section-title ce-section-title--icon">
        <IcoUsers size={15} /> Organizer &amp; Contact Details
      </h3>
      <div className="ce-form-row">
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-email">Contact Email <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-email"
            className="ce-input"
            type="email"
            placeholder="e.g. support@compilvision.com"
            value={form.contactEmail}
            onChange={(e) => {
              onChange('contactEmail', e.target.value);
              if (errors.contactEmail) setErrors(prev => ({ ...prev, contactEmail: '' }));
            }}
            style={{ borderColor: errors.contactEmail ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.contactEmail} />
        </div>
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-phone">
            Contact Phone
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '400', marginLeft: '6px' }}>(10 digits)</span>
          </label>
          <input
            id="ce-phone"
            className="ce-input"
            type="tel"
            placeholder="e.g. 9876543210"
            value={form.contactPhone}
            maxLength={10}
            onChange={(e) => {
              // Only allow numeric digits
              const val = e.target.value.replace(/\D/g, '');
              onChange('contactPhone', val);
              if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: '' }));
            }}
            style={{ borderColor: errors.contactPhone ? '#EF4444' : undefined }}
          />
          <FieldError msg={errors.contactPhone} />
          <span className="ce-field-hint">Exactly 10 digits, numbers only.</span>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   Main CreateEvent page
   ───────────────────────────────────────────────────── */
export default function CreateEvent() {
  const { createEvent } = useContext(EventContext);
  const { user }        = useContext(AuthContext);
  const navigate        = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Banner file stored separately so it can be appended to FormData
  const [bannerFile, setBannerFile] = useState(null);

  // Inline field errors
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    bannerPreview:        '',
    title:                '',
    category:             '',
    description:          '',
    maxParticipants:      100,
    enableWaitlist:       false,
    startDatetime:        '',
    endDatetime:          '',
    venue:                '',
    registrationDeadline: '',
    contactEmail:         user?.email || '',
    contactPhone:         '',
    ticketPrice:          0,
    visibility:           'PUBLIC',
    is_paid:              false,
    price:                '',
  });

  const updateField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleBannerFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, banner: 'Only PNG, JPG, or WebP images are allowed.' }));
      return;
    }
    // Validate file size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, banner: 'Image must be smaller than 10 MB.' }));
      return;
    }
    setErrors(prev => ({ ...prev, banner: '' }));
    setBannerFile(file);
    updateField('bannerPreview', URL.createObjectURL(file));
  };

  /**
   * Full validation — returns an errors object. Empty object means no errors.
   */
  const validate = () => {
    const errs = {};

    if (!form.title.trim())
      errs.title = 'Event Title is required.';

    if (!form.category)
      errs.category = 'Please select a category.';

    if (!form.description.trim())
      errs.description = 'Description is required.';

    if (!form.startDatetime) {
      errs.startDatetime = 'Start Date & Time is required.';
    } else {
      const startDate = new Date(form.startDatetime);
      if (startDate <= new Date()) {
        errs.startDatetime = 'Event start date and time cannot be in the past.';
      }
    }

    if (!form.endDatetime) {
      errs.endDatetime = 'End Date & Time is required.';
    } else if (form.startDatetime && new Date(form.endDatetime) <= new Date(form.startDatetime)) {
      errs.endDatetime = 'End date & time must be after start date & time.';
    }

    if (!form.registrationDeadline) {
      errs.registrationDeadline = 'Registration Deadline is required.';
    } else if (form.startDatetime && new Date(form.registrationDeadline) >= new Date(form.startDatetime)) {
      errs.registrationDeadline = 'Registration deadline must be before the event start date & time.';
    }

    if (!form.venue.trim())
      errs.venue = 'Venue / Location is required.';

    if (!form.contactEmail.trim()) {
      errs.contactEmail = 'Contact Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      errs.contactEmail = 'Please enter a valid email address.';
    }

    if (form.contactPhone) {
      if (!/^\d{10}$/.test(form.contactPhone)) {
        errs.contactPhone = 'Contact phone must be exactly 10 digits (numbers only).';
      }
    }

    const participants = parseInt(form.maxParticipants, 10);
    if (isNaN(participants) || participants < 1)
      errs.maxParticipants = 'Max Participants must be at least 1.';

    if (form.is_paid) {
      const amount = parseFloat(form.price);
      if (!form.price || isNaN(amount) || amount <= 0) {
        errs.price = 'Please enter a valid positive event amount.';
      }
    }

    return errs;
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      setErrors({ title: 'Event Title is required to save a draft.' });
      return;
    }
    setSavingDraft(true);
    try {
      await createEvent({ ...form, status: 'DRAFT' }, bannerFile);
      alert('Draft saved successfully!');
      navigate('/organizer/events');
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      alert('Error saving draft: ' + msg);
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      // Scroll to first error
      const firstField = document.querySelector('.ce-input[style*="border-color: rgb(239, 68, 68)"], .ce-select[style*="border-color: rgb(239, 68, 68)"]');
      if (firstField) firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await createEvent({ ...form, status: 'PENDING' }, bannerFile);
      alert('Event submitted successfully! It is now pending administrator review.');
      navigate('/organizer/events/pending');
    } catch (e) {
      // Surface backend validation errors inline
      if (e?.response?.data) {
        const backendErrors = {};
        const data = e.response.data;
        if (data.title)               backendErrors.title = Array.isArray(data.title) ? data.title[0] : data.title;
        if (data.venue)               backendErrors.venue = Array.isArray(data.venue) ? data.venue[0] : data.venue;
        if (data.contact_phone)       backendErrors.contactPhone = Array.isArray(data.contact_phone) ? data.contact_phone[0] : data.contact_phone;
        if (data.start_datetime)      backendErrors.startDatetime = Array.isArray(data.start_datetime) ? data.start_datetime[0] : data.start_datetime;
        if (data.end_datetime)        backendErrors.endDatetime = Array.isArray(data.end_datetime) ? data.end_datetime[0] : data.end_datetime;
        if (data.registration_deadline) backendErrors.registrationDeadline = Array.isArray(data.registration_deadline) ? data.registration_deadline[0] : data.registration_deadline;
        if (data.price)               backendErrors.price = Array.isArray(data.price) ? data.price[0] : data.price;
        if (data.max_participants)    backendErrors.maxParticipants = Array.isArray(data.max_participants) ? data.max_participants[0] : data.max_participants;
        if (data.contact_email)       backendErrors.contactEmail = Array.isArray(data.contact_email) ? data.contact_email[0] : data.contact_email;
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          return;
        }
        alert('Error creating event: ' + JSON.stringify(data));
      } else {
        alert('Error creating event: ' + e.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OrganizerLayout activeItem="Create Event">
      <PageContainer>
        <PageHeader
          title="Create New Event"
          description="Design, structure, and announce your hosted experience."
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={handleSaveDraft} loading={savingDraft}>
                {savingDraft ? 'Saving…' : 'Save Draft'}
              </SecondaryButton>
              <PrimaryButton onClick={handlePublish} loading={submitting}>
                {submitting ? 'Submitting…' : 'Publish Event'}
              </PrimaryButton>
            </div>
          }
        />

        <div className="ce-main" style={{ padding: 0 }}>
          <GeneralInfoTab
            form={form}
            onChange={updateField}
            onBannerFile={handleBannerFile}
            errors={errors}
            setErrors={setErrors}
          />
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
