import React from 'react';
import { AppLayout, PageContainer, PageHeader, ContentCard } from '../components/ui/DesignSystem';

function About() {
  return (
    <AppLayout>
      <PageContainer size="lg">
        <PageHeader
          title="About CompilVision"
          description="Empowering high-fidelity professional events and summits around the globe."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ContentCard>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
              Our Vision
            </h3>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              At CompilVision, we believe that bringing together industry experts, developers, and visionaries fosters progress. 
              Our mission is to simplify high-stakes event organization by providing planners with tools that scale, 
              from ticket distribution to real-time attendee engagement.
            </p>
          </ContentCard>

          <ContentCard>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
              Core Values
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>High Fidelity</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>We strive to present polished layouts, robust APIs, and flawless coordination flows.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Scalable Architecture</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Built on top of modular state management systems optimized for high throughput traffic.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Accessible to All</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Following WCAG standards to design interfaces accessible to every individual.</p>
              </div>
            </div>
          </ContentCard>
        </div>
      </PageContainer>
    </AppLayout>
  );
}

export default About;
