import React from 'react';
import { FiDownload, FiEye } from 'react-icons/fi';
import './RegistrationHistoryRow.css';

function RegistrationHistoryRow({ item, onAction }) {
  const { id, eventName, eventThumbnail, registrationDate, amountPaid, status } = item;

  const getStatusBadgeClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'confirmed':  return 'history-status-confirmed';
      case 'cancelled':  return 'history-status-cancelled';
      case 'refunded':   return 'history-status-refunded';
      default:           return 'history-status-default';
    }
  };

  const handleDownload = () => {
    if (onAction) onAction('download', item);
    else alert(`Downloading receipt for registration ${id}...`);
  };

  const handleView = () => {
    if (onAction) onAction('view', item);
    else alert(`Viewing registration details for ${id}...`);
  };

  return (
    <tr className="registration-history-row">
      <td className="cell-thumbnail">
        <img src={eventThumbnail} alt={eventName} className="history-thumbnail" />
      </td>
      <td className="cell-event-name">{eventName}</td>
      <td className="cell-reg-id">{id}</td>
      <td className="cell-date">{registrationDate}</td>
      <td className="cell-amount">{amountPaid}</td>
      <td className="cell-status">
        <span className={`history-status-badge ${getStatusBadgeClass(status)}`}>
          <span className="status-dot"></span>
          {status}
        </span>
      </td>
      <td className="cell-actions">
        <div className="action-buttons-group">
          <button
            className="history-action-btn tooltip"
            data-tooltip="View Ticket"
            onClick={handleView}
            aria-label="View Ticket Details"
          >
            <FiEye />
          </button>
          <button
            className="history-action-btn tooltip"
            data-tooltip="Download Receipt"
            onClick={handleDownload}
            aria-label="Download Receipt"
          >
            <FiDownload />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default RegistrationHistoryRow;
