import React from 'react';
import { FiMapPin, FiNavigation, FiMap } from './Icons';

const VenueCard = ({ event }) => {
  if (!event) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || event.venueName)}`;

  return (
    <div className="card">
      <h2 className="section-title">Venue &amp; Location</h2>

      {/* Map Placeholder */}
      <div className="map-placeholder">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60"
          alt="Map placeholder"
          className="map-bg"
        />
        <div className="map-marker">
          <FiMapPin size={40} style={{ color: '#EF4444', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>
      </div>

      {/* Venue Info */}
      <div className="venue-info">
        <div className="venue-details">
          <div className="venue-title">{event.venueName}</div>
          <div className="venue-address">{event.address}</div>
        </div>
        <div className="venue-actions">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '13px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FiNavigation size={14} /> Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-dark"
            style={{ fontSize: '13px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FiMap size={14} /> View Map
          </a>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
