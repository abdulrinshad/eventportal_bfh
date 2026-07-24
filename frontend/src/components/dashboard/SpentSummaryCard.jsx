import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { ContentCard } from '../ui/DesignSystem';

function SpentSummaryCard({
  title = "TOTAL SPENT (YTD)",
  amount = "$14,280.00",
  growthText = "+12% from last year"
}) {
  return (
    <ContentCard style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '8px 0 0 0', fontFamily: 'var(--font-heading)' }}>
            {amount}
          </h2>
        </div>
        <div style={{ background: '#DCFCE7', color: '#15803D', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiTrendingUp size={14} />
          <span>{growthText}</span>
        </div>
      </div>
    </ContentCard>
  );
}

export default SpentSummaryCard;
