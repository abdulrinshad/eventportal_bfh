import React, { useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { PageContainer, ContentCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { AuthContext } from '../../context/AuthContext';
import { FiCheckCircle } from 'react-icons/fi';

export default function OrganizerApplicationSuccess() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <StudentLayout activeItem="Dashboard">
      <PageContainer size="md">
        <ContentCard style={{ textAlign: 'center', padding: '60px 40px', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <FiCheckCircle size={64} color="#10B981" />
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
            Application Submitted Successfully
          </h1>
          
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 32px auto' }}>
            Your organizer application has been submitted successfully. It is currently under review by the administrator. You will receive a notification once the review is complete.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <SecondaryButton onClick={() => navigate('/student/dashboard')}>
              Return to Dashboard
            </SecondaryButton>
            <PrimaryButton onClick={() => navigate('/student/dashboard')}>
              View Application Status
            </PrimaryButton>
          </div>
        </ContentCard>
      </PageContainer>
    </StudentLayout>
  );
}
