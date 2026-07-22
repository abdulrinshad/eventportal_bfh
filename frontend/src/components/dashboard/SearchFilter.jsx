import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './SearchFilter.css';

function SearchFilter({
  searchTerm,
  setSearchTerm,
  ticketFilter,
  setTicketFilter,
  paymentFilter,
  setPaymentFilter
}) {
  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters-group">
        <div className="filter-badge-icon">
          <FiFilter className="filter-icon" />
        </div>
        
        <div className="select-wrapper">
          <select
            className="filter-select"
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            aria-label="Filter by Ticket Type"
          >
            <option value="all">All Ticket Types</option>
            <option value="VIP Pass">VIP Pass</option>
            <option value="General Admission">General Admission</option>
            <option value="Early Bird">Early Bird</option>
          </select>
        </div>

        <div className="select-wrapper">
          <select
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by Payment Status"
          >
            <option value="all">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;
