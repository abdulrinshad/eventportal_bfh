import React, { useState } from 'react';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, SearchBar } from '../../components/ui/DesignSystem';

const HELP_ARTICLES = [
  { id: 1, title: 'How to create an event?', desc: 'Navigate to "Create Event" in the sidebar. Fill in the general details, location, categories, date, and description. Once completed, submit the event for Admin review. It will enter the "Pending Approval" state.' },
  { id: 2, title: 'Why is my event status "Pending"?', desc: 'All newly created events must be checked and approved by system administrators before they are publicly listed on the portal.' },
  { id: 3, title: 'What happens if my event is "Rejected"?', desc: 'If an event is rejected, you will receive a rejection note with details. Navigate to "Rejected Events", click edit, make the requested adjustments, and resubmit.' },
  { id: 4, title: 'How do Stripe payouts work?', desc: 'Connect your merchant Stripe account via Settings -> Payouts. Once verified, registration fees from paid tickets will be deposited directly to your bank account.' },
];

export default function OrganizerHelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = HELP_ARTICLES.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <OrganizerLayout activeItem="Help Center">
      <PageContainer size="lg">
        <PageHeader
          title="Organizer Help Center"
          description="Find answers to common questions about hosting events, payouts, and listing approvals."
        />

        <div style={{ marginBottom: '28px' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search help articles..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredArticles.map((art) => (
            <ContentCard key={art.id}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                {art.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                {art.desc}
              </p>
            </ContentCard>
          ))}
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
