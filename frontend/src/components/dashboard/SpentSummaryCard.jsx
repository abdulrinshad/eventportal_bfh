import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import './SpentSummaryCard.css';

function SpentSummaryCard({
  title = "TOTAL SPENT (YTD)",
  amount = "$14,280.00",
  growthText = "+12% from last year"
}) {
  return (
    <div className="spent-summary-card">
      <div className="card-top">
        <span className="card-title">{title}</span>
        <div className="growth-badge">
          <FiTrendingUp className="growth-icon" />
          <span>{growthText}</span>
        </div>
      </div>
      <h2 className="spent-amount">{amount}</h2>
    </div>
  );
}

export default SpentSummaryCard;
