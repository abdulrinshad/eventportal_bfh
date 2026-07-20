import React, { useState, useRef } from 'react';
import './CreateEvent.css';

/* ─────────────────────────────────────────────────────
   INLINE SVG ICONS  (same style as EventDetails)
───────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IcoDashboard   = ({ size = 16 }) => <Svg size={size}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>;
const IcoCalendar    = ({ size = 16 }) => <Svg size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>;
const IcoCirclePlus  = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></Svg>;
const IcoUsers       = ({ size = 16 }) => <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const IcoBell        = ({ size = 16 }) => <Svg size={size}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>;
const IcoSettings    = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>;
const IcoLogout      = ({ size = 16 }) => <Svg size={size}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>;
const IcoUpload      = ({ size = 16 }) => <Svg size={size}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></Svg>;
const IcoMapPin      = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoSearch      = ({ size = 16 }) => <Svg size={size}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>;
const IcoMap         = ({ size = 16 }) => <Svg size={size}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Svg>;
const IcoInfo        = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Svg>;
const IcoBold        = ({ size = 16 }) => <Svg size={size} fill="currentColor" stroke="none"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></Svg>;
const IcoItalic      = ({ size = 16 }) => <Svg size={size}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></Svg>;
const IcoLink        = ({ size = 16 }) => <Svg size={size}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>;
const IcoArrowRight  = ({ size = 16 }) => <Svg size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>;
const IcoCheck       = ({ size = 16 }) => <Svg size={size}><polyline points="20 6 9 17 4 12"/></Svg>;
const IcoSend        = ({ size = 16 }) => <Svg size={size}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>;
const IcoFb          = ({ size = 16 }) => <Svg size={size}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></Svg>;
const IcoTw          = ({ size = 16 }) => <Svg size={size}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></Svg>;
const IcoIn          = ({ size = 16 }) => <Svg size={size}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></Svg>;

/* ─────────────────────────────────────────────────────
   DUMMY / STATIC DATA
───────────────────────────────────────────────────── */
const USER = { name: 'Alex Rivera', role: 'Event Manager' };

const CATEGORIES = [
  'Technology & Innovation', 'Business & Finance', 'Design & UX',
  'Marketing', 'Music & Arts', 'Sports & Fitness',
  'Food & Beverage', 'Education', 'Entertainment', 'Health & Wellness',
];

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',          Icon: IcoDashboard },
  { id: 'my-events',      label: 'My Created Events',  Icon: IcoCalendar },
  { id: 'create',         label: 'Create Event',        Icon: IcoCirclePlus },
  { id: 'registrations',  label: 'My Registrations',   Icon: IcoUsers },
  { id: 'notifications',  label: 'Notifications',      Icon: IcoBell },
  { id: 'settings',       label: 'Settings',           Icon: IcoSettings },
];

const TABS = [
  { id: 'general',   label: 'General Info', num: 1 },
  { id: 'logistics', label: 'Logistics',    num: 2 },
  { id: 'ticketing', label: 'Ticketing',    num: 3 },
];

/* ─────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────── */
const Sidebar = ({ activeNav, onNav }) => (
  <aside className="ce-sidebar">
    {/* User card */}
    <div className="ce-sidebar__user">
      <div className="ce-sidebar__avatar">
        {USER.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="ce-sidebar__user-info">
        <div className="ce-sidebar__name">{USER.name}</div>
        <div className="ce-sidebar__role">{USER.role}</div>
      </div>
    </div>

    {/* Nav links */}
    <nav className="ce-sidebar__nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`ce-nav-item${activeNav === id ? ' active' : ''}`}
          onClick={() => onNav(id)}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}

      <div className="ce-sidebar__divider" />

      <button className="ce-nav-item ce-nav-item--logout" onClick={() => {}}>
        <IcoLogout size={16} />
        <span>Logout</span>
      </button>
    </nav>
  </aside>
);

/* ─────────────────────────────────────────────────────
   BANNER UPLOAD WIDGET
───────────────────────────────────────────────────── */
const BannerUpload = ({ preview, onFile }) => {
  const inputRef = useRef();
  const handleDrop = e => {
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
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
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
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   GENERAL INFO TAB CONTENT
───────────────────────────────────────────────────── */
const GeneralInfoTab = ({ form, onChange }) => {
  const handleFile = file => {
    const url = URL.createObjectURL(file);
    onChange('bannerPreview', url);
  };

  return (
    <div className="ce-tab-content">
      {/* Banner Upload */}
      <BannerUpload preview={form.bannerPreview} onFile={handleFile} />

      {/* Title + Category */}
      <div className="ce-form-card">
        <div className="ce-form-row">
          <div className="ce-field ce-field--grow">
            <label className="ce-label" htmlFor="ce-title">Event Title</label>
            <input
              id="ce-title"
              className="ce-input"
              type="text"
              placeholder="e.g. CompilVision Global Tech Summit 2024"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
              maxLength={100}
            />
            <span className="ce-field-hint">Catchy titles work best. Limit to 100 characters.</span>
          </div>
          <div className="ce-field ce-field--category">
            <label className="ce-label" htmlFor="ce-category">Category</label>
            <div className="ce-select-wrap">
              <select
                id="ce-category"
                className="ce-select"
                value={form.category}
                onChange={e => onChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Description + Max Participants */}
        <div className="ce-form-row ce-form-row--top">
          <div className="ce-field ce-field--grow">
            <div className="ce-label-row">
              <label className="ce-label" htmlFor="ce-desc">Description</label>
              <div className="ce-format-btns">
                <button className="ce-fmt-btn" title="Bold"><IcoBold size={13} /></button>
                <button className="ce-fmt-btn" title="Italic"><IcoItalic size={13} /></button>
                <button className="ce-fmt-btn" title="Insert link"><IcoLink size={13} /></button>
              </div>
            </div>
            <textarea
              id="ce-desc"
              className="ce-textarea"
              rows={7}
              placeholder="Describe what makes your event unique..."
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
            />
          </div>

          <div className="ce-field ce-field--participants">
            <label className="ce-label" htmlFor="ce-max">Max Participants</label>
            <div className="ce-input-with-icon">
              <input
                id="ce-max"
                className="ce-input"
                type="number"
                min={1}
                value={form.maxParticipants}
                onChange={e => onChange('maxParticipants', e.target.value)}
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
                onChange={e => onChange('enableWaitlist', e.target.checked)}
              />
              <span className="ce-checkbox-label">Enable waitlist</span>
            </label>
          </div>
        </div>
      </div>

      {/* Time & Location */}
      <div className="ce-section-card">
        <h3 className="ce-section-title ce-section-title--icon">
          <IcoMapPin size={15} /> Time &amp; Location
        </h3>
        <div className="ce-form-row">
          <div className="ce-field ce-field--half">
            <label className="ce-label" htmlFor="ce-start">Start Date &amp; Time</label>
            <input
              id="ce-start"
              className="ce-input"
              type="datetime-local"
              value={form.startDate}
              onChange={e => onChange('startDate', e.target.value)}
            />
          </div>
          <div className="ce-field ce-field--half">
            <label className="ce-label" htmlFor="ce-venue">Venue / Location</label>
            <div className="ce-input-with-icon ce-input-with-icon--left">
              <span className="ce-input-prefix-icon"><IcoSearch size={14} /></span>
              <input
                id="ce-venue"
                className="ce-input ce-input--padded-left"
                type="text"
                placeholder="Search for a venue..."
                value={form.venue}
                onChange={e => onChange('venue', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="ce-form-row">
          <div className="ce-field ce-field--half">
            <label className="ce-label" htmlFor="ce-end">End Date &amp; Time</label>
            <input
              id="ce-end"
              className="ce-input"
              type="datetime-local"
              value={form.endDate}
              onChange={e => onChange('endDate', e.target.value)}
            />
          </div>
          <div className="ce-field ce-field--half">
            <div className={`ce-map-placeholder${form.venue ? ' has-venue' : ''}`}>
              <IcoMap size={22} />
              <span>{form.venue ? `Showing: ${form.venue}` : 'Select a location to see map'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="ce-section-card">
        <h3 className="ce-section-title ce-section-title--icon">
          <IcoUsers size={15} /> Registration Details
        </h3>
        <div className="ce-form-row">
          <div className="ce-field ce-field--half">
            <label className="ce-label" htmlFor="ce-deadline">Registration Deadline</label>
            <input
              id="ce-deadline"
              className="ce-input"
              type="date"
              value={form.regDeadline}
              onChange={e => onChange('regDeadline', e.target.value)}
            />
          </div>
          <div className="ce-field ce-field--half">
            <label className="ce-label" htmlFor="ce-email">Contact Email for Attendees</label>
            <input
              id="ce-email"
              className="ce-input"
              type="email"
              placeholder="support@compilvision.com"
              value={form.contactEmail}
              onChange={e => onChange('contactEmail', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   PLACEHOLDER TAB CONTENT
───────────────────────────────────────────────────── */
const PlaceholderTab = ({ icon: Icon, title, description }) => (
  <div className="ce-tab-content ce-placeholder-content">
    <div className="ce-placeholder-inner">
      <div className="ce-placeholder-icon"><Icon size={36} /></div>
      <h3 className="ce-placeholder-title">{title}</h3>
      <p className="ce-placeholder-desc">{description}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   FOOTER  (matches EventDetails footer design)
───────────────────────────────────────────────────── */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);
  const handleSub = e => {
    e.preventDefault();
    if (email.trim()) { setSubbed(true); setEmail(''); setTimeout(() => setSubbed(false), 3000); }
  };
  return (
    <footer className="ce-footer">
      <div className="ce-footer__inner">
        <div className="ce-footer__grid">
          <div className="ce-footer__brand">
            <div className="ce-footer__logo">CompilVision</div>
            <p>Simplifying high-stakes event coordination for the digital age.</p>
          </div>
          <div>
            <h4 className="ce-footer__heading">Product</h4>
            <ul className="ce-footer__list">
              {['Features', 'Pricing', 'Security'].map(l => (
                <li key={l}><a href="/" className="ce-footer__link">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="ce-footer__heading">Company</h4>
            <ul className="ce-footer__list">
              {['About Us', 'Careers', 'Contact'].map(l => (
                <li key={l}><a href="/" className="ce-footer__link">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="ce-footer__heading">Legal</h4>
            <ul className="ce-footer__list">
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><a href="/" className="ce-footer__link">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ce-footer__bottom">
          <span>© {new Date().getFullYear()} CompilVision. All rights reserved.</span>
          <div className="ce-footer__socials">
            {[IcoFb, IcoTw, IcoIn].map((Ic, i) => (
              <a key={i} href="/" className="ce-footer__social" aria-label="social"><Ic size={14} /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────── */
const CreateEvent = ({ onPublish, onCancel, onNavigateToEdit }) => {
  const [activeTab,  setActiveTab]  = useState('general');
  const [activeNav,  setActiveNav]  = useState('create');
  const [draftSaved, setDraftSaved] = useState(false);
  const [form, setForm] = useState({
    bannerPreview:   null,
    title:           '',
    category:        '',
    description:     '',
    maxParticipants: 100,
    enableWaitlist:  false,
    startDate:       '',
    endDate:         '',
    venue:           '',
    regDeadline:     '',
    contactEmail:    '',
  });

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') onCancel();
  };

  const handlePublish = () => {
    // Ready to navigate to EventDetails when routing is wired up
    if (typeof onPublish === 'function') onPublish(form);
  };

  return (
    <div className="ce-root">

      {/* ── Top Header ── */}
      <header className="ce-header">
        <div className="ce-header__logo">CompilVision</div>
        <h1 className="ce-header__title">New Event</h1>
        <div className="ce-header__actions">
          <button className="ce-btn-ghost" onClick={handleCancel}>Cancel</button>
          <button
            className={`ce-btn-draft${draftSaved ? ' saved' : ''}`}
            onClick={handleSaveDraft}
          >
            {draftSaved
              ? <><IcoCheck size={13} /> Saved!</>
              : 'Save Draft'
            }
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div className="ce-body">

        <Sidebar activeNav={activeNav} onNav={id => {
            if (id === 'my-events' && typeof onNavigateToEdit === 'function') {
              onNavigateToEdit();
            } else {
              setActiveNav(id);
            }
          }} />

        <div className="ce-main">
          {/* Tab bar */}
          <div className="ce-tab-bar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`ce-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ce-tab__num">{tab.num}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === 'general' && (
            <GeneralInfoTab form={form} onChange={updateField} />
          )}
          {activeTab === 'logistics' && (
            <PlaceholderTab
              icon={IcoMapPin}
              title="Logistics"
              description="Configure transportation, parking, and accommodation options for your attendees."
            />
          )}
          {activeTab === 'ticketing' && (
            <PlaceholderTab
              icon={IcoInfo}
              title="Ticketing"
              description="Set up ticket tiers, pricing, and early-bird discounts for your event."
            />
          )}
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="ce-action-bar">
        <div className="ce-action-bar__left">
          <IcoInfo size={14} />
          <span>You are logged in as <strong>{USER.name}</strong></span>
        </div>
        <div className="ce-action-bar__right">
          <button className="ce-btn-ghost" onClick={handleCancel}>Cancel</button>
          <button className="ce-btn-publish" onClick={handlePublish}>
            Publish Event
            <IcoArrowRight size={15} />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateEvent;
