import React from 'react';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, StatCard } from '../../components/ui/DesignSystem';
import { FiTrendingUp, FiActivity, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function EventAnalytics() {
  return (
    <OrganizerLayout activeItem="Analytics">
      <PageContainer size="xl">
        <PageHeader
          title="Performance Analytics"
          description="Track registrations velocity, ticket sales conversion ratios, and demographic interests."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Conversion Rate" value="68.2%" icon={<FiTrendingUp />} description="Clicks to registration" />
          <StatCard title="Page Views" value="4,829" icon={<FiActivity />} description="Across all listing pages" />
          <StatCard title="Total Sales" value="$42,890" icon={<FiDollarSign />} description="Gross sales revenue" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }} className="analytics-grid">
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Registration Velocity</h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0' }}>
              {[30, 45, 60, 50, 75, 90, 120, 110, 140, 180, 200, 230].map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '6%' }}>
                  <div style={{ width: '100%', height: `${h}px`, background: '#F5C451', borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '6px' }}>M{i+1}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Demographic Interests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Computer Science & Engineering', percent: '45%' },
                { name: 'UI/UX Design & Product Strategy', percent: '30%' },
                { name: 'Data Science & Artificial Intelligence', percent: '25%' },
              ].map((d, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    <span>{d.name}</span>
                    <span>{d.percent}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: d.percent, height: '100%', background: '#F5C451' }} />
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
