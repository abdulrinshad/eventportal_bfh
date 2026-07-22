import React from 'react';
import RegistrationHistoryRow from './RegistrationHistoryRow';
import './RegistrationHistoryTable.css';

function RegistrationHistoryTable({ history = [], onAction }) {
  return (
    <div className="history-table-responsive-container">
      <table className="registration-history-table">
        <thead>
          <tr>
            <th scope="col" className="col-thumbnail">Event</th>
            <th scope="col" className="col-event-name">Event Name</th>
            <th scope="col" className="col-reg-id">Registration ID</th>
            <th scope="col" className="col-date">Date</th>
            <th scope="col" className="col-amount">Amount Paid</th>
            <th scope="col" className="col-status">Status</th>
            <th scope="col" className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((item) => (
              <RegistrationHistoryRow
                key={item.id}
                item={item}
                onAction={onAction}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="table-empty-row">
                No registration history records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RegistrationHistoryTable;
