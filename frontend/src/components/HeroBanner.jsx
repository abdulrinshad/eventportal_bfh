import React, { useState } from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiShare2, FiBookmark } from './Icons';

const HeroBanner = ({ event }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  if (!event) return null;

  const defaultImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  return (
    <div
      className="hero-banner"
      style={{ backgroundImage: `url(${event.image || defaultImg})` }}
    >
      <div className="hero-overlay">
        {/* Top Right Actions */}
        <div className="hero-actions">
          <button
            className={`hero-action-btn ${shareCopied ? 'active' : ''}`}
            onClick={handleShare}
            title={shareCopied ? 'Link Copied!' : 'Share'}
            aria-label="Share event"
          >
            <FiShare2 />
          </button>
          <button
            className={`hero-action-btn ${bookmarked ? 'active' : ''}`}
            onClick={() => setBookmarked(!bookmarked)}
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
            aria-label="Bookmark event"
          >
            <FiBookmark />
          </button>
        </div>

        {/* Bottom Left Content */}
        <div className="hero-content">
          <span className="hero-category">{event.category}</span>
          <h1 className="hero-title">{event.title}</h1>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <FiCalendar />
              <span>{event.date}</span>
            </div>
            <div className="hero-meta-item">
              <FiMapPin />
              <span>{event.venueName}</span>
            </div>
            <div className="hero-meta-item">
              <FiUsers />
              <span>{event.attendeesCount}+ Attending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
