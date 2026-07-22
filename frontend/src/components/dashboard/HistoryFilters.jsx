import React from 'react';
import { FiFilter } from 'react-icons/fi';
import './HistoryFilters.css';

function HistoryFilters({
  statusFilter,
  setStatusFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate
}) {
  const handleClearFilters = () => {
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="history-filters-container">
      <div className="filters-left-group">
        <div className="filter-badge">
          <FiFilter className="filter-badge-icon" />
          <span>Filters</span>
        </div>

        <div className="filter-item">
          <label htmlFor="status-select" className="filter-label">Status</label>
          <div className="select-wrapper">
            <select
              id="status-select"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="from-date" className="filter-label">From Date</label>
          <input
            type="date"
            id="from-date"
            className="filter-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="to-date" className="filter-label">To Date</label>
          <input
            type="date"
            id="to-date"
            className="filter-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {(statusFilter !== 'all' || fromDate !== '' || toDate !== '') && (
        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default HistoryFilters;
