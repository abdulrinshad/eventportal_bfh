import React from 'react';
import './DashboardFooter.css';

function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <div className="footer-left">
        <span>© {currentYear} EventPortal Inc. All rights reserved.</span>
      </div>
      <div className="footer-right">
        <a href="#privacy" className="footer-link">Privacy Policy</a>
        <span className="footer-divider">•</span>
        <a href="#terms" className="footer-link">Terms of Service</a>
      </div>
    </footer>
  );
}

export default DashboardFooter;
