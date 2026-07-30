import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageContainer, ContentCard, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { SiteSettingsContext } from '../context/SiteSettingsContext';
import { getPublicStatsApi } from '../services/api';
import * as Icons from 'react-icons/fi';
import { FiLinkedin, FiMail } from 'react-icons/fi';

const DynamicIcon = ({ name, size = 24, color = '#F5C451' }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.FiCompass size={size} color={color} />;
  return <IconComponent size={size} color={color} />;
};

function About() {
  const navigate = useNavigate();
  const { settings, values, features, team, partners, loading, error } = useContext(SiteSettingsContext);
  const [stats, setStats] = useState({
    total_events: 0,
    total_registrations: 0,
    active_organizers: 0,
    participants: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicStatsApi();
        if (res && res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load about stats:", err);
      }
    })();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <PageContainer size="xl" style={{ marginTop: '40px' }}>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position:  200% 0; }
            }
          `}</style>
          <div style={{ height: '240px', borderRadius: '24px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: '40px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '180px', borderRadius: '16px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  if (error || !settings) {
    return (
      <AppLayout>
        <PageContainer size="lg" style={{ marginTop: '80px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '16px' }}>Failed to Load About Content</h2>
          <p style={{ color: '#6B7280' }}>Please verify settings in the Admin Panel or refresh the page.</p>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        
        {/* ── 1. HERO SECTION ── */}
        <section style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', color: '#FFFFFF', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: '40px', fontWeight: '800', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
              {settings.about_hero_title}
            </h1>
            <p style={{ fontSize: '18px', color: '#D1D5DB', lineHeight: '1.6', margin: 0 }}>
              {settings.about_hero_subtitle}
            </p>
          </div>
          {settings.about_hero_banner && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, zIndex: 1 }}>
              <img src={settings.about_hero_banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </section>

        {/* ── 2. STORY SECTION ── */}
        <PageContainer size="xl" style={{ marginTop: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: settings.about_story_image ? '1.1fr 0.9fr' : '1fr', gap: '48px', alignItems: 'center', marginBottom: '80px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 20px 0', fontFamily: 'var(--font-heading)' }}>
                {settings.about_story_title}
              </h2>
              <div style={{ fontSize: '16px', color: '#4B5563', lineHeight: '1.7' }}>
                {settings.about_story_content.split('\n').map((p, i) => p.trim() && <p key={i} style={{ marginBottom: '16px' }}>{p}</p>)}
              </div>
            </div>
            {settings.about_story_image && (
              <div>
                <img src={settings.about_story_image} alt="Our Story" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }} />
              </div>
            )}
          </div>

          {/* ── 3. MISSION & VISION ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '80px' }} className="grid-responsive">
            <ContentCard style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '32px' }}>🎯</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0' }}>Our Mission</h3>
                  <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>{settings.mission}</p>
                </div>
              </div>
            </ContentCard>
            <ContentCard style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '32px' }}>🔭</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0' }}>Our Vision</h3>
                  <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>{settings.vision}</p>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* ── 4. VALUES ── */}
          {values.length > 0 && (
            <div style={{ marginBottom: '80px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', textAlign: 'center', margin: '0 0 40px 0', fontFamily: 'var(--font-heading)' }}>
                Core Values
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-responsive-3">
                {values.map(val => (
                  <ContentCard key={val.id} style={{ padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <DynamicIcon name={val.icon} size={24} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>{val.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5', margin: 0 }}>{val.description}</p>
                  </ContentCard>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. PLATFORM FEATURES ── */}
          {features.length > 0 && (
            <div style={{ marginBottom: '80px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', textAlign: 'center', margin: '0 0 40px 0', fontFamily: 'var(--font-heading)' }}>
                Platform Features
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-responsive-3">
                {features.map(feat => (
                  <ContentCard key={feat.id} style={{ padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <DynamicIcon name={feat.icon} size={24} />
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '750', color: '#111827', margin: '0 0 10px 0' }}>{feat.title}</h3>
                    <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: '1.5', margin: 0 }}>{feat.description}</p>
                  </ContentCard>
                ))}
              </div>
            </div>
          )}
        </PageContainer>

        {/* ── 6. METRIC STATS ── */}
        <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '50px 24px', marginBottom: '80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} className="grid-responsive-4">
            {[
              { value: `${stats.total_events || 0}+`, label: 'EVENTS HOSTED' },
              { value: `${stats.total_registrations || 0}+`, label: 'TOTAL REGISTRATIONS' },
              { value: `${stats.active_organizers || 0}+`, label: 'ACTIVE ORGANIZERS' },
              { value: `${stats.participants || 0}+`, label: 'ACTIVE PARTICIPANTS' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px' }}>
                <h3 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>{stat.value}</h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '1px' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. MEET OUR TEAM ── */}
        <PageContainer size="xl">
          {team.length > 0 && (
            <div style={{ marginBottom: '80px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', textAlign: 'center', margin: '0 0 40px 0', fontFamily: 'var(--font-heading)' }}>
                Meet Our Leadership Team
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }} className="grid-responsive-4">
                {team.map(member => (
                  <div key={member.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', textAlign: 'center', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '240px', overflow: 'hidden', background: '#F1F5F9' }}>
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E2E8F0, #CBD5E1)', fontSize: '64px' }}>👤</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '750', color: '#111827', margin: '0 0 4px 0' }}>{member.name}</h3>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#F5C451', textTransform: 'uppercase', marginBottom: '12px' }}>{member.position}</span>
                      <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', margin: '0 0 16px 0', flex: 1 }}>{member.bio}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#475569' }}><FiLinkedin size={16} /></a>}
                        {member.email && <a href={`mailto:${member.email}`} style={{ color: '#475569' }}><FiMail size={16} /></a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 8. SPONSORS / PARTNERS ── */}
          {partners.length > 0 && (
            <div style={{ marginBottom: '80px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', margin: '0 0 32px 0' }}>
                Trusted Partners &amp; Sponsors
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }}>
                {partners.map(p => (
                  <a key={p.id} href={p.website || '#'} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.6, transition: 'opacity 0.2s', display: 'block' }}>
                    <img src={p.logo} alt={p.name} style={{ height: '36px', objectFit: 'contain' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── 9. CALL TO ACTION ── */}
          <section style={{ background: '#FFFDF5', border: '1px solid rgba(245, 196, 81, 0.3)', borderRadius: '24px', padding: '48px', textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0' }}>Coordinate your next major event with us</h2>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 24px 0', maxWidth: '520px', marginInline: 'auto' }}>
              Join thousands of developers, Planners, and teams hosting high-quality experiences worldwide.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <PrimaryButton onClick={() => navigate('/events')}>Explore Events</PrimaryButton>
              <SecondaryButton onClick={() => navigate('/register')}>Get Started for Free</SecondaryButton>
            </div>
          </section>

        </PageContainer>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .grid-responsive, .grid-responsive-3, .grid-responsive-4 {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default About;
