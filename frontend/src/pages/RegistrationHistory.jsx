import React, { useState } from 'react';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import SpentSummaryCard from '../components/dashboard/SpentSummaryCard';
import HistoryFilters from '../components/dashboard/HistoryFilters';
import RegistrationHistoryTable from '../components/dashboard/RegistrationHistoryTable';
import Pagination from '../components/dashboard/Pagination';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { registrationHistoryData } from '../data/registrationHistory';
import './RegistrationHistory.css';

function RegistrationHistory({ onBackToRegistrations }) {
  const [history, setHistory] = useState(registrationHistoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const parseDateStr = (dateStr) => new Date(Date.parse(dateStr));

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.eventName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesFromDate = true;
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      matchesFromDate = parseDateStr(item.registrationDate) >= from;
    }

    let matchesToDate = true;
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      matchesToDate = parseDateStr(item.registrationDate) <= to;
    }

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  return (
    <div className="registration-history-page">
      <div className="page-main-container">
        
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <button className="breadcrumb-link" onClick={onBackToRegistrations}>
            My Registered Events
          </button>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current" aria-current="page">
            Registration History
          </span>
        </nav>

        <header className="history-page-header">
          <div className="header-text-group">
            <h1 className="header-title">Registration History</h1>
            <p className="header-subtitle">
              Review and manage your past event registrations and financial receipts.
            </p>
          </div>

          <div className="header-right-controls">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" 
              alt="User Profile" 
              className="user-profile-avatar"
            />
          </div>
        </header>

        <div className="history-page-content">
          <SpentSummaryCard />

          <section className="table-wrapper-section">
            <HistoryFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />

            <RegistrationHistoryTable
              history={filteredHistory}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>

      </div>

      <DashboardFooter />
    </div>
  );
}

export default RegistrationHistory;
