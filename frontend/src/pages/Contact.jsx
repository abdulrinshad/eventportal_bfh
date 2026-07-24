import React, { useState } from 'react';
import { AppLayout, PageContainer, PageHeader, FormContainer, PrimaryButton } from '../components/ui/DesignSystem';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AppLayout>
      <PageContainer size="md">
        <PageHeader
          title="Contact Us"
          description="Have questions about ticketing, sponsorship, or platform hosting? Get in touch."
        />

        {submitted && (
          <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '20px' }}>
            ✓ Message sent successfully! We'll reply within 24 hours.
          </div>
        )}

        <FormContainer onSubmit={handleSubmit} title="Send us a message">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Your Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Message</label>
            <textarea
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us how we can help you..."
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', resize: 'none' }}
            />
          </div>

          <PrimaryButton type="submit">
            Send Message
          </PrimaryButton>
        </FormContainer>
      </PageContainer>
    </AppLayout>
  );
}

export default Contact;
