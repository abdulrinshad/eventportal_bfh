import React, { useState, useRef } from 'react';
import './EditEvent.css';

/* ─────────────────────────────────────────────────────
   INLINE SVG ICONS  (identical system to CreateEvent)
───────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IcoDashboard     = ({ size = 16 }) => <Svg size={size}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>;
const IcoUser          = ({ size = 16 }) => <Svg size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const IcoCalendar      = ({ size = 16 }) => <Svg size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>;
const IcoCirclePlus    = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></Svg>;
const IcoUsers         = ({ size = 16 }) => <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const IcoBell          = ({ size = 16 }) => <Svg size={size}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>;
const IcoSettings      = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>;
const IcoLogout        = ({ size = 16 }) => <Svg size={size}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>;
const IcoImage         = ({ size = 16 }) => <Svg size={size}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Svg>;
const IcoInfo          = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Svg>;
const IcoMapPin        = ({ size = 16 }) => <Svg size={size}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcoAlertTriangle = ({ size = 16 }) => <Svg size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const IcoTrash         = ({ size = 16 }) => <Svg size={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Svg>;
const IcoClock         = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const IcoCircleCheck   = ({ size = 16 }) => <Svg size={size}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Svg>;
const IcoCheck         = ({ size = 16 }) => <Svg size={size}><polyline points="20 6 9 17 4 12"/></Svg>;
const IcoX             = ({ size = 16 }) => <Svg size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;
const IcoFb            = ({ size = 16 }) => <Svg size={size}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></Svg>;
const IcoTw            = ({ size = 16 }) => <Svg size={size}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></Svg>;
const IcoIn            = ({ size = 16 }) => <Svg size={size}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></Svg>;

/* ─────────────────────────────────────────────────────
   DUMMY DATA  (pre-filled event)
───────────────────────────────────────────────────── */
const DUMMY_EVENT = {
  bannerUrl:       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
  title:           'Global Tech Summit 2024',
  description:     'Join industry leaders, innovators, and visionaries for the premier technology event of the year. The 2024 Global Tech Summit explores the frontiers of AI, quantum computing, and sustainable tech ecosystems. Networking, workshops, and high-impact keynotes await.',
  category:        'Technology',
  visibility:      'public',
  startDate:       '2024-11-15',
  endDate:         '2024-11-17',
  location:        'San Francisco, CA',
  price:           299,
  tags:            ['AI', 'Web3'],
  registrations:   1248,
  maxParticipants: 1500,
  lastUpdated:     '2 days ago',
  lastUpdatedBy:   'Sarah Jenkins',
};

const USER = {
  name:   'Event Manager',
  org:    'COMPILVISION',
  tier:   'PROFESSIONAL',
  avatar: 'https://images.unsplash.com/photo-1573496799822-994c23dce00f?auto=format&fit=crop&w=150&q=80',
};

const CATEGORIES = [
  'Technology', 'Business & Finance', 'Design & UX', 'Marketing',
  'Music & Arts', 'Sports & Fitness', 'Food & Beverage',
  'Education', 'Entertainment', 'Health & Wellness',
];

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',         Icon: IcoDashboard },
  { id: 'profile',       label: 'Profile',            Icon: IcoUser      },
  { id: 'registrations', label: 'My Registrations',  Icon: IcoUsers     },
  { id: 'my-events',     label: 'My Created Events', Icon: IcoCalendar  },
  { id: 'create',        label: 'Create Event',       Icon: IcoCirclePlus},
  { id: 'notifications', label: 'Notifications',     Icon: IcoBell      },
  { id: 'settings',      label: 'Settings',          Icon: IcoSettings  },
];

/* ─────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────── */
const Sidebar = ({ onNavigateToCreate }) => (
  <aside className="ee-sidebar">
    <div className="ee-sidebar__user">
      <img
        src={USER.avatar}
        alt={USER.name}
        className="ee-sidebar__avatar"
        onError={e => { e.target.src = ''; e.target.style.background = '#f4b400'; }}
      />
      <div className="ee-sidebar__user-info">
        <div className="ee-sidebar__name">{USER.name}</div>
        <div className="ee-sidebar__org">{USER.org}</div>
        <div className="ee-sidebar__tier">{USER.tier}</div>
      </div>
    </div>

    <nav className="ee-sidebar__nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`ee-nav-item${id === 'create' ? ' active' : ''}`}
          onClick={id === 'create' && typeof onNavigateToCreate === 'function'
            ? onNavigateToCreate : undefined}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}

      <div className="ee-sidebar__divider" />

      <button className="ee-nav-item ee-nav-item--logout">
        <IcoLogout size={16} />
        <span>Logout</span>
      </button>
    </nav>
  </aside>
);

/* ─────────────────────────────────────────────────────
   FOOTER  (matches EventDetails / CreateEvent footer)
───────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="ee-footer">
    <div className="ee-footer__inner">
      <div className="ee-footer__grid">
        <div className="ee-footer__brand">
          <div className="ee-footer__logo">CompilVision</div>
          <p>Simplifying high-stakes event coordination for the digital age.</p>
        </div>
        <div>
          <h4 className="ee-footer__heading">Product</h4>
          <ul className="ee-footer__list">
            {['Features', 'Pricing', 'Security'].map(l => (
              <li key={l}><a href="/" className="ee-footer__link">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="ee-footer__heading">Company</h4>
          <ul className="ee-footer__list">
            {['About Us', 'Careers', 'Contact'].map(l => (
              <li key={l}><a href="/" className="ee-footer__link">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="ee-footer__heading">Legal</h4>
          <ul className="ee-footer__list">
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <li key={l}><a href="/" className="ee-footer__link">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ee-footer__bottom">
        <span>© {new Date().getFullYear()} CompilVision. All rights reserved.</span>
        <div className="ee-footer__socials">
          {[IcoFb, IcoTw, IcoIn].map((Ic, i) => (
            <a key={i} href="/" className="ee-footer__social" aria-label="social"><Ic size={14} /></a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────────────
   DELETE CONFIRMATION MODAL
───────────────────────────────────────────────────── */
const DeleteModal = ({ eventTitle, onConfirm, onCancel }) => (
  <div className="ee-modal-overlay" onClick={onCancel}>
    <div className="ee-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
      <div className="ee-modal__icon"><IcoAlertTriangle size={28} /></div>
      <h3 className="ee-modal__title">Delete Event</h3>
      <p className="ee-modal__text">
        Are you sure you want to permanently delete <strong>"{eventTitle}"</strong>?
        All registrations will be cancelled. This action cannot be undone.
      </p>
      <div className="ee-modal__actions">
        <button className="ee-btn-ghost ee-btn-ghost--outline" onClick={onCancel}>
          Keep Event
        </button>
        <button className="ee-btn-delete-confirm" onClick={onConfirm}>
          <IcoTrash size={14} /> Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────── */
const EditEvent = ({ onSave, onDiscard, onNavigateToCreate }) => {
  const bannerInputRef = useRef();
  const [form,            setForm]            = useState({ ...DUMMY_EVENT });
  const [tagInput,        setTagInput]        = useState('');
  const [addingTag,       setAddingTag]       = useState(false);
  const [saveFeedback,    setSaveFeedback]    = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleBannerFile = e => {
    if (e.target.files[0])
      updateField('bannerUrl', URL.createObjectURL(e.target.files[0]));
  };

  const handleSave = () => {
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      if (typeof onSave === 'function') onSave();
    }, 1200);
  };

  const handleDiscard = () => {
    setForm({ ...DUMMY_EVENT });
    if (typeof onDiscard === 'function') onDiscard();
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    if (typeof onDiscard === 'function') onDiscard();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t))
      updateField('tags', [...form.tags, t]);
    setTagInput('');
    setAddingTag(false);
  };

  const removeTag = tag => updateField('tags', form.tags.filter(t => t !== tag));

  const regPercent = Math.min(100, Math.round((form.registrations / form.maxParticipants) * 100));

  return (
    <div className="ee-root">

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <DeleteModal
          eventTitle={form.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* ── Full-width Header ── */}
      <header className="ee-header">
        <div className="ee-header__logo">CompilVision</div>
        <h1 className="ee-header__title">Edit Event</h1>
        <div className="ee-header__actions">
          <button className="ee-btn-ghost" onClick={handleDiscard}>Discard</button>
          <button
            className={`ee-btn-save${saveFeedback ? ' saved' : ''}`}
            onClick={handleSave}
          >
            {saveFeedback ? <><IcoCheck size={13} /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div className="ee-body">

        <Sidebar onNavigateToCreate={onNavigateToCreate} />

        <div className="ee-main">

          {/* ── Banner ── */}
          <div className="ee-banner">
            <img src={form.bannerUrl} alt="Event banner" className="ee-banner__img" />
            <div className="ee-banner__overlay">
              <button
                className="ee-banner__replace-btn"
                onClick={() => bannerInputRef.current?.click()}
              >
                <IcoImage size={15} /> Replace Banner
              </button>
            </div>
            <span className="ee-banner__badge">ACTIVE BANNER</span>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleBannerFile}
            />
          </div>

          {/* ── Content Grid ── */}
          <div className="ee-content">

            {/* Row 1: Basic Info (left) | Logistics + Status (right) */}
            <div className="ee-row-1">

              {/* Basic Information */}
              <div className="ee-card">
                <h2 className="ee-card-title">
                  <span className="ee-card-icon"><IcoInfo size={16} /></span>
                  Basic Information
                </h2>

                <div className="ee-field">
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

                <div className="ee-form-row">
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

              {/* Right column */}
              <div className="ee-right-col">

                {/* Logistics */}
                <div className="ee-card">
                  <h2 className="ee-card-title">
                    <span className="ee-card-icon"><IcoCalendar size={16} /></span>
                    Logistics
                  </h2>

                  <div className="ee-field">
                    <label className="ee-label" htmlFor="ee-start">Start Date</label>
                    <input
                      id="ee-start"
                      className="ee-input"
                      type="date"
                      value={form.startDate}
                      onChange={e => updateField('startDate', e.target.value)}
                    />
                  </div>

                  <div className="ee-field">
                    <label className="ee-label" htmlFor="ee-end">End Date</label>
                    <input
                      id="ee-end"
                      className="ee-input"
                      type="date"
                      value={form.endDate}
                      onChange={e => updateField('endDate', e.target.value)}
                    />
                  </div>

                  <div className="ee-field">
                    <label className="ee-label" htmlFor="ee-loc">Location</label>
                    <div className="ee-input-icon-wrap">
                      <span className="ee-input-icon"><IcoMapPin size={14} /></span>
                      <input
                        id="ee-loc"
                        className="ee-input ee-input--icon-left"
                        type="text"
                        value={form.location}
                        onChange={e => updateField('location', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Event Status */}
                <div className="ee-card ee-status-card">
                  <div className="ee-status-label">Event Status</div>
                  <div className="ee-status-row">
                    <span className="ee-status-meta">Registrations</span>
                    <span className="ee-status-count">
                      {form.registrations.toLocaleString()} / {form.maxParticipants.toLocaleString()}
                    </span>
                  </div>
                  <div className="ee-progress-track">
                    <div
                      className="ee-progress-fill"
                      style={{ width: `${regPercent}%` }}
                      aria-valuenow={regPercent}
                    />
                  </div>
                  <div className="ee-status-live">
                    <span className="ee-status-check"><IcoCircleCheck size={16} /></span>
                    <span>Status: Live &amp; Published</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Row 2: Pricing | Quick Tags | Danger Zone */}
            <div className="ee-row-2">

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

              {/* Quick Tags */}
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
              <div className="ee-card ee-danger-card">
                <div className="ee-danger-header">
                  <IcoAlertTriangle size={15} />
                  <span className="ee-danger-title">Danger Zone</span>
                </div>
                <p className="ee-danger-text">
                  Once deleted, this event cannot be recovered.
                </p>
                <button
                  className="ee-btn-delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <IcoTrash size={15} /> Delete Event
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="ee-action-bar">
        <div className="ee-action-bar__left">
          <IcoClock size={14} />
          <span>
            Last updated {form.lastUpdated} by <strong>{form.lastUpdatedBy}</strong>
          </span>
        </div>
        <div className="ee-action-bar__right">
          <button className="ee-btn-ghost ee-btn-ghost--outline" onClick={handleDiscard}>
            Discard Changes
          </button>
          <button
            className={`ee-btn-save-event${saveFeedback ? ' saved' : ''}`}
            onClick={handleSave}
          >
            {saveFeedback ? <><IcoCheck size={14} /> Saved!</> : 'Save Event'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditEvent;
