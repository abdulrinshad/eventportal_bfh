import React from 'react';
import ParticipantRow from './ParticipantRow';
import './ParticipantsTable.css';

function ParticipantsTable({ participants = [], onAction }) {
  return (
    <div className="table-responsive-container">
      <table className="participants-table">
        <thead>
          <tr>
            <th scope="col" className="col-avatar">Avatar</th>
            <th scope="col" className="col-name">Name</th>
            <th scope="col" className="col-email">Email Address</th>
            <th scope="col" className="col-ticket">Ticket Type</th>
            <th scope="col" className="col-date">Registered Date</th>
            <th scope="col" className="col-status">Payment</th>
            <th scope="col" className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.length > 0 ? (
            participants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                onAction={onAction}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="table-empty-row">
                No participants match your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ParticipantsTable;
