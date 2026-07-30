import React, { useState, useContext } from 'react';
import { AppLayout, PageContainer, ContentCard, PrimaryButton } from '../components/ui/DesignSystem';
import { SiteSettingsContext } from '../context/SiteSettingsContext';
import { submitContactEnquiryApi } from '../services/api';
import { FiPhone, FiMail, FiMapPin, FiClock, FiFacebook, FiInstagram, FiLinkedin, FiTwitter, FiYoutube } from 'react-icons/fi';

function Contact() {
  const { settings, loading, error } = useContext(SiteSettingsContext);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await submitContactEnquiryApi(formData);
      if (res && res.success) {
        setFeedback({ type: 'success', message: res.message || 'Thank you! Your enquiry has been submitted.' });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      console.error("Failed to submit enquiry:", err);
      const errMsg = err.response?.data?.message || 'Failed to connect to the server. Please try again.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          <div style={{ height: '380px', borderRadius: '24px', background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </PageContainer>
      </AppLayout>
    );
  }

  if (error || !settings) {
    return (
      <AppLayout>
        <PageContainer size="lg" style={{ marginTop: '80px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '16px' }}>Failed to Load Contact Content</h2>
          <p style={{ color: '#6B7280' }}>Please verify settings in the Admin Panel or refresh the page.</p>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        
        {/* ── HERO SECTION ── */}
        <section style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', color: '#FFFFFF', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
              {settings.contact_hero_title}
            </h1>
            <p style={{ fontSize: '16px', color: '#D1D5DB', lineHeight: '1.6', margin: 0 }}>
              {settings.contact_hero_subtitle}
            </p>
          </div>
        </section>

        <PageContainer size="xl" style={{ marginTop: '48px', paddingBottom: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }} className="contact-grid">
            
            {/* ── LEFT COLUMN: INFO & MAP ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ContentCard style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 24px 0', fontFamily: 'var(--font-heading)' }}>
                  Contact Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FFFDF5', border: '1px solid rgba(245,196,81,0.2)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiPhone color="#F5C451" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>PHONE</span>
                      <a href={`tel:${settings.support_phone}`} style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textDecoration: 'none' }}>{settings.support_phone}</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FFFDF5', border: '1px solid rgba(245,196,81,0.2)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiMail color="#F5C451" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>EMAIL</span>
                      <a href={`mailto:${settings.support_email}`} style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textDecoration: 'none' }}>{settings.support_email}</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FFFDF5', border: '1px solid rgba(245,196,81,0.2)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiMapPin color="#F5C451" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>ADDRESS</span>
                      <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{settings.address}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FFFDF5', border: '1px solid rgba(245,196,81,0.2)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiClock color="#F5C451" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>BUSINESS HOURS</span>
                      <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{settings.business_hours}</span>
                    </div>
                  </div>
                </div>

                {/* SOCIAL LINKS */}
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '12px' }}>FOLLOW US</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { url: settings.facebook, icon: <FiFacebook /> },
                      { url: settings.instagram, icon: <FiInstagram /> },
                      { url: settings.linkedin, icon: <FiLinkedin /> },
                      { url: settings.twitter, icon: <FiTwitter /> },
                      { url: settings.youtube, icon: <FiYoutube /> }
                    ].map((soc, idx) => soc.url && (
                      <a key={idx} href={soc.url} target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', transition: 'all 0.2s' }} className="social-btn">
                        {soc.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </ContentCard>

              {/* MAP EMBED */}
              {settings.google_maps_embed_url && (
                <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E7EB', height: '240px', background: '#F8FAFC' }}>
                  <iframe 
                    title="Office Location"
                    src={settings.google_maps_embed_url}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: FORM ── */}
            <div>
              <ContentCard style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                  Send us a Message
                </h2>
                <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 24px 0' }}>
                  Fill out the form below and a representative will connect with you shortly.
                </p>

                {feedback && (
                  <div style={{ 
                    background: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2', 
                    border: `1px solid ${feedback.type === 'success' ? '#15803D' : '#EF4444'}`, 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    color: feedback.type === 'success' ? '#15803D' : '#B91C1C', 
                    fontWeight: '600', 
                    marginBottom: '20px',
                    fontSize: '13.5px'
                  }}>
                    {feedback.type === 'success' ? '✓ ' : '⚠️ '}{feedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive">
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>FULL NAME *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="John Doe" 
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontSize: '14px', color: '#1F2937' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>EMAIL ADDRESS *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="john@company.com" 
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontSize: '14px', color: '#1F2937' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }} className="grid-responsive">
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>PHONE (OPTIONAL)</label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+1 (555) 000-0000" 
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontSize: '14px', color: '#1F2937' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>SUBJECT *</label>
                      <input 
                        type="text" 
                        name="subject" 
                        required 
                        value={formData.subject} 
                        onChange={handleChange} 
                        placeholder="Partnership query, support request..." 
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontSize: '14px', color: '#1F2937' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>MESSAGE *</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={5} 
                      value={formData.message} 
                      onChange={handleChange} 
                      placeholder="Type your message details here..." 
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontSize: '14px', color: '#1F2937', resize: 'none', lineHeight: '1.5' }}
                    />
                  </div>

                  <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '700' }}>
                    {submitting ? 'Sending Message...' : 'Send Message'}
                  </PrimaryButton>
                </form>
              </ContentCard>
            </div>

          </div>
        </PageContainer>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        .social-btn:hover {
          border-color: #F5C451 !important;
          color: #F5C451 !important;
        }
      `}</style>
    </AppLayout>
  );
}

export default Contact;
