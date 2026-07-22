import React, { useState } from 'react';
import { FiDownload, FiMail, FiChevronRight } from 'react-icons/fi';
import StatCard from '../components/dashboard/StatCard';
import SearchFilter from '../components/dashboard/SearchFilter';
import ParticipantsTable from '../components/dashboard/ParticipantsTable';
import Pagination from '../components/dashboard/Pagination';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { participantsData } from '../data/participants';
import './Participants.css';

function Participants({ onBackToEvents }) {
  const [participants, setParticipants] = useState(participantsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const statsData = [
    { id: 1, title: "Total Registrations", value: "1,248", subtext: "+12% this week", type: "success" },
    { id: 2, title: "VIP Attendees",        value: "342",   subtext: "27% of total",   type: "info"    },
    { id: 3, title: "Pending Payments",     value: "43",    subtext: "Critical",        type: "danger"  },
    { id: 4, title: "Check-in Rate",        value: "--%",   subtext: "Opens in 12 days",type: "neutral" },
  ];

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTicket  = ticketFilter  === 'all' || p.ticketType     === ticketFilter;
    const matchesPayment = paymentFilter === 'all' || p.paymentStatus  === paymentFilter;

    return matchesSearch && matchesTicket && matchesPayment;
  });

  const handleParticipantAction = (action, participant) => {
    if (action === 'delete') {
      const confirmCancel = window.confirm(
        `Are you sure you want to cancel the registration for "${participant.name}"?`
      );
      if (confirmCancel) {
        setParticipants(participants.filter((p) => p.id !== participant.id));
      }
    } else if (action === 'resend') {
      alert(`Ticket email successfully resent to ${participant.email}`);
    } else if (action === 'edit') {
      alert(`Edit profile for attendee: ${participant.name}`);
    }
  };

  return (
    <div className="participants-management-page">
      <div className="page-main-container">

        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <button className="breadcrumb-link" onClick={onBackToEvents}>
            My Created Events
          </button>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current" aria-current="page">
            Global Tech Summit 2024
          </span>
        </nav>

        <header className="participants-header">
          <div className="header-text-group">
            <h1 className="header-title">Participants - Global Tech Summit 2024</h1>
            <p className="header-subtitle">
              Manage and monitor attendee registrations in real-time.
            </p>
          </div>

          <div className="header-actions-group">
            <button className="action-btn secondary-btn" onClick={() => alert('Exporting participants list to CSV...')}>
              <FiDownload className="btn-icon" />
              <span>Export CSV</span>
            </button>
            <button className="action-btn primary-btn" onClick={() => alert('Opening broadcast email composer for registered attendees...')}>
              <FiMail className="btn-icon" />
              <span>Broadcast Email</span>
            </button>
          </div>
        </header>

        <div className="participants-page-content">

          <section className="stats-cards-grid" aria-label="Registration Statistics">
            {statsData.map((stat) => (
              <StatCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                subtext={stat.subtext}
                type={stat.type}
              />
            ))}
          </section>

          <section className="table-wrapper-section">
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              ticketFilter={ticketFilter}
              setTicketFilter={setTicketFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
            />

            <ParticipantsTable
              participants={filteredParticipants}
              onAction={handleParticipantAction}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={312}
              onPageChange={setCurrentPage}
            />
          </section>

        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}

export default Participants;
