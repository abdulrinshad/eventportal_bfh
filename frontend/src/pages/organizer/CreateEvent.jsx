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
const BannerUpload = ({ preview, onFile }) => {
  const inputRef = useRef();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
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
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
        />
      </div>
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
        <div className="ce-pricing-input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF' }}>
          <span style={{
            padding: '0 12px',
            fontSize: '15px',
            fontWeight: '700',
            color: '#374151',
            background: '#F8FAFC',
            borderRight: '1.5px solid #E2E8F0',
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
        {priceError && (
          <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
            {priceError}
          </span>
        )}
        <span className="ce-field-hint">E.g. ₹250 or ₹500. Decimals allowed.</span>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────
   GeneralInfoTab — only tab (General Info)
   ───────────────────────────────────────────────────── */
const GeneralInfoTab = ({ form, onChange, onBannerFile, priceError }) => (
  <div className="ce-tab-content">
    <BannerUpload preview={form.bannerPreview} onFile={onBannerFile} />

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
            onChange={(e) => onChange('title', e.target.value)}
            maxLength={100}
          />
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
              onChange={(e) => onChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
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
            onChange={(e) => onChange('description', e.target.value)}
          />
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
              onChange={(e) => onChange('maxParticipants', e.target.value)}
            />
            <span className="ce-input-suffix-icon" title="Maximum number of registered attendees">
              <IcoInfo size={15} />
            </span>
          </div>
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

    {/* Event Pricing — between Description and Time & Location */}
    <EventPricingCard
      isPaid={form.is_paid}
      price={form.price}
      onIsPaidChange={(val) => onChange('is_paid', val)}
      onPriceChange={(val) => onChange('price', val)}
      priceError={priceError}
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
            onChange={(e) => onChange('startDatetime', e.target.value)}
          />
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
              onChange={(e) => onChange('venue', e.target.value)}
            />
          </div>
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
            onChange={(e) => onChange('endDatetime', e.target.value)}
          />
        </div>
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-deadline">Registration Deadline <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            id="ce-deadline"
            className="ce-input"
            type="datetime-local"
            value={form.registrationDeadline}
            onChange={(e) => onChange('registrationDeadline', e.target.value)}
          />
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
            onChange={(e) => onChange('contactEmail', e.target.value)}
          />
        </div>
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-phone">Contact Phone</label>
          <input
            id="ce-phone"
            className="ce-input"
            type="tel"
            placeholder="e.g. +1 555-000-0000"
            value={form.contactPhone}
            onChange={(e) => onChange('contactPhone', e.target.value)}
          />
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Banner file stored separately so it can be appended to FormData
  const [bannerFile, setBannerFile] = useState(null);

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
    // Clear price error when pricing changes
    if (key === 'is_paid' || key === 'price') {
      setPriceError('');
    }
  };

  const handleBannerFile = (file) => {
    setBannerFile(file);
    updateField('bannerPreview', URL.createObjectURL(file));
  };

  /**
   * Validate required fields and return an error message or null.
   */
  const validate = () => {
    if (!form.title.trim())               return 'Event Title is required.';
    if (!form.category)                   return 'Please select a category.';
    if (!form.description.trim())         return 'Description is required.';
    if (!form.startDatetime)              return 'Start Date & Time is required.';
    if (!form.endDatetime)                return 'End Date & Time is required.';
    if (!form.registrationDeadline)       return 'Registration Deadline is required.';
    if (!form.venue.trim())               return 'Venue / Location is required.';
    if (!form.contactEmail.trim())        return 'Contact Email is required.';
    if (parseInt(form.maxParticipants) < 1) return 'Max Participants must be at least 1.';

    // Pricing validation
    if (form.is_paid) {
      const amount = parseFloat(form.price);
      if (!form.price || isNaN(amount) || amount <= 0) {
        setPriceError('Please enter a valid event amount.');
        return 'Please enter a valid event amount.';
      }
    }

    return null;
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      alert('Event Title is required to save a draft.');
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
    const validationError = validate();
    if (validationError) {
      alert(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await createEvent({ ...form, status: 'PENDING' }, bannerFile);
      alert('Event submitted successfully! It is now pending administrator review.');
      navigate('/organizer/events/pending');
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      alert('Error creating event: ' + msg);
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
            priceError={priceError}
          />
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
