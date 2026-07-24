import React, { useState } from 'react';
import { AppLayout, PageContainer, PageHeader, ContentCard, SearchBar } from '../components/ui/DesignSystem';

const HELP_ARTICLES = [
  { id: 1, title: 'How to create an event?', desc: 'Navigate to the Sidebar and click "New Event". Fill in title, location, category, date, and description. Once completed, hit "Publish Event".' },
  { id: 2, title: 'How to register for an event?', desc: 'Browse the Explore page, select the event you wish to attend, click on the Pricing Card on the sidebar, select ticket type, and confirm registration.' },
  { id: 3, title: 'How does waitlisting work?', desc: 'If an event reaches its maximum capacity, new registers are put on a waitlist. Planners will receive notifications if spots open.' },
  { id: 4, title: 'How to update my account settings?', desc: 'Go to Settings inside your Sidebar dashboard to toggle preferences on emails, notifications, push alerts, and 2FA.' },
];

function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = HELP_ARTICLES.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageContainer size="lg">
        <PageHeader
          title="Help Center"
          description="Find answers to common questions about ticketing, registration, and hosting events."
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
    </AppLayout>
  );
}

export default HelpCenter;
