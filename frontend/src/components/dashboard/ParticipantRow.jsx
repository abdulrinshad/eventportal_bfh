import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import './ParticipantRow.css';

function ParticipantRow({ participant, onAction }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const { id, name, email, ticketType, registrationDate, paymentStatus, avatar } = participant;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTicketBadgeClass = (type) => {
    switch (type) {
      case 'VIP Pass':          return 'ticket-vip';
      case 'General Admission': return 'ticket-general';
      case 'Early Bird':        return 'ticket-early';
      default:                  return 'ticket-default';
    }
  };

  const getPaymentBadgeClass = (status) => {
    return status?.toLowerCase() === 'paid' ? 'payment-paid' : 'payment-pending';
  };

  const handleMenuClick = (action) => {
    setShowMenu(false);
    if (onAction) {
      onAction(action, participant);
    } else {
      alert(`Action "${action}" triggered for ${name}`);
    }
  };

  return (
    <tr className="participant-row">
      <td className="cell-avatar">
        {avatar ? (
          <img src={avatar} alt={name} className="participant-avatar" />
        ) : (
          <div className="avatar-placeholder">
            {name ? name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
        )}
      </td>
      <td className="cell-name">{name}</td>
      <td className="cell-email">{email}</td>
      <td className="cell-ticket">
        <span className={`ticket-badge ${getTicketBadgeClass(ticketType)}`}>
          {ticketType}
        </span>
      </td>
      <td className="cell-date">{registrationDate}</td>
      <td className="cell-status">
        <span className={`payment-badge ${getPaymentBadgeClass(paymentStatus)}`}>
          <span className="status-dot"></span>
          {paymentStatus}
        </span>
      </td>
      <td className="cell-actions">
        <div className="action-menu-container" ref={menuRef}>
          <button 
            className="row-menu-btn" 
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Participant Actions"
          >
            <FiMoreVertical />
          </button>
          
          {showMenu && (
            <div className="row-context-menu">
              <button className="context-item" onClick={() => handleMenuClick('edit')}>
                Edit Attendee
              </button>
              <button className="context-item" onClick={() => handleMenuClick('resend')}>
                Resend Ticket Email
              </button>
              <button className="context-item danger-text" onClick={() => handleMenuClick('delete')}>
                Cancel Registration
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ParticipantRow;
