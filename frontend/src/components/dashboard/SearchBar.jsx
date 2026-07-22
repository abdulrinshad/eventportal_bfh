import React from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import './SearchBar.css';

function SearchBar({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  dateFilter, 
  setDateFilter 
}) {
  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by event title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters-group">
        <div className="select-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="live">Live Events</option>
            <option value="draft">Drafts</option>
            <option value="past">Past Events</option>
          </select>
          <FiChevronDown className="select-arrow" />
        </div>

        <div className="select-wrapper">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Any Date</option>
            <option value="upcoming">Upcoming</option>
            <option value="not-scheduled">Not Scheduled</option>
            <option value="past">Past Date</option>
          </select>
          <FiChevronDown className="select-arrow" />
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
