import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton, AppLayout, Modal } from '../../components/ui/DesignSystem';
import { AuthContext } from '../../context/AuthContext';
import { getOrganizerStatusApi, applyOrganizerApi } from '../../services/api';
import { FiUser, FiMail, FiPhone, FiBookOpen, FiActivity, FiFileText, FiGlobe } from 'react-icons/fi';

export default function OrganizerApplication() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');

  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearSemester, setYearSemester] = useState('');
  const [studentId, setStudentId] = useState('');

  const [clubName, setClubName] = useState('');
  const [position, setPosition] = useState('');
  const [eventExperience, setEventExperience] = useState('');
  const [leadershipExperience, setLeadershipExperience] = useState('');

  const [whyOrganizer, setWhyOrganizer] = useState('');
  const [eventTypePlan, setEventTypePlan] = useState('');
  const [experienceDetail, setExperienceDetail] = useState('');

  const [collegeId, setCollegeId] = useState('');
  const [resume, setResume] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Status and API states
  const [organizerStatus, setOrganizerStatus] = useState('NOT_APPLIED');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      setErrorMsg('');
      const res = await getOrganizerStatusApi();
      if (res && res.success) {
        setOrganizerStatus(res.organizer_status || res.data?.organizer_status || 'NOT_APPLIED');
      } else {
        setErrorMsg(res?.message || 'Could not fetch organizer application status.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the server to retrieve application status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  if (!user) {
    return (
      <AppLayout>
        <PageContainer size="lg">
          <Modal
            isOpen={true}
            onClose={() => navigate('/')}
            title="Sign in Required"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                To apply for Organizer privileges, you need to sign in to your CompilVision account.
              </p>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                After signing in, you'll be automatically redirected to the Organizer Application page so you can continue where you left off.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <PrimaryButton onClick={() => navigate('/login', { state: { from: '/organizer/apply' } })}>
                  Sign In
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/register', { state: { from: '/organizer/apply' } })}>
                  Create Account
                </SecondaryButton>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '8px',
                    marginTop: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#111827'}
                  onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </PageContainer>
      </AppLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (organizerStatus === 'PENDING' || organizerStatus === 'APPROVED') {
      setErrorMsg('You already have a pending or approved application.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await applyOrganizerApi();
      if (res && res.success) {
        setSuccessMsg('Your organizer application has been submitted successfully.');
        setOrganizerStatus('PENDING');
        if (refreshUser) {
          await refreshUser();
        }
        navigate('/organizer/application-success');
      } else {
        setErrorMsg(res?.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.non_field_errors?.[0] || err.response?.data?.message || err.message || 'An error occurred while submitting the application.';
      setErrorMsg(serverError);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    const badgeColors = {
      NOT_APPLIED: { bg: '#E2E8F0', text: '#475569', label: 'Not Applied' },
      PENDING: { bg: '#FEF3C7', text: '#D97706', label: 'Pending Review' },
      APPROVED: { bg: '#D1FAE5', text: '#065F46', label: 'Approved' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected / Apply Again' }
    };
    const style = badgeColors[organizerStatus] || badgeColors.NOT_APPLIED;
    return (
      <span style={{
        padding: '6px 16px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: '700',
        backgroundColor: style.bg,
        color: style.text
      }}>
        Current Status: {style.label}
      </span>
    );
  };

  if (loadingStatus) {
    return (
      <StudentLayout activeItem="Dashboard">
        <PageContainer size="lg">
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading status and application details...</p>
          </div>
        </PageContainer>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout activeItem="Dashboard">
      <PageContainer size="lg">
        <PageHeader
          title="Organizer Privileges Application"
          description="Apply for organizer privileges to create, promote, and manage public events on the portal."
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          {getStatusBadge()}
          {(organizerStatus === 'PENDING' || organizerStatus === 'APPROVED') && (
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
              Applications cannot be resubmitted while pending review or after being approved.
            </p>
          )}
        </div>

        {errorMsg && (
          <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#FEF2F2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', marginBottom: '24px', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#E0F2FE', color: '#0369A1', border: '1.5px solid #BAE6FD', fontWeight: '600', marginBottom: '24px', fontSize: '14px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1 */}
          <ContentCard>

            <h3 style={{ fontSize: '16px', fontWeight: '755', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser color="#F5C451" /> 1. Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Full Name *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Email Address *</label>
                <input
                  type="email"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', background: '#F8FAFC' }}
                  value={email}
                  readOnly
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Phone Number *</label>
                <input
                  type="tel"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </ContentCard>

          {/* Section 2 */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '755', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBookOpen color="#F5C451" /> 2. Academic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>College / University *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. Stanford University"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Department *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Year / Semester *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. 3rd Year / 5th Sem"
                  value={yearSemester}
                  onChange={e => setYearSemester(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Student ID *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. SU-90421"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  required
                />
              </div>
            </div>
          </ContentCard>

          {/* Section 3 */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '755', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiActivity color="#F5C451" /> 3. Organizer Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Club / Organization Name *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. ACM Student Chapter"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Position *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="e.g. Vice President"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Previous Event Experience *</label>
                <textarea
                  rows={3}
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                  placeholder="Describe your previous experience managing events..."
                  value={eventExperience}
                  onChange={e => setEventExperience(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Leadership Experience *</label>
                <textarea
                  rows={3}
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                  placeholder="Describe any general leadership position or activities..."
                  value={leadershipExperience}
                  onChange={e => setLeadershipExperience(e.target.value)}
                  required
                />
              </div>
            </div>
          </ContentCard>

          {/* Section 4 */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '755', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText color="#F5C451" /> 4. Application Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Why do you want to become an organizer? *</label>
                <textarea
                  rows={4}
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                  value={whyOrganizer}
                  onChange={e => setWhyOrganizer(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>What type of events do you plan to organize? *</label>
                <textarea
                  rows={4}
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                  value={eventTypePlan}
                  onChange={e => setEventTypePlan(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Describe your experience in details. *</label>
                <textarea
                  rows={4}
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                  value={experienceDetail}
                  onChange={e => setExperienceDetail(e.target.value)}
                  required
                />
              </div>
            </div>
          </ContentCard>

          {/* Section 5 */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '755', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiGlobe color="#F5C451" /> 5. Uploads &amp; Links
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>College ID Card (Link / Path) *</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="https://drive.google.com/... or path"
                  value={collegeId}
                  onChange={e => setCollegeId(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Resume (Optional)</label>
                <input
                  type="text"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="Resume link"
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>LinkedIn Profile URL *</label>
                <input
                  type="url"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Portfolio URL *</label>
                <input
                  type="url"
                  style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px' }}
                  placeholder="Portfolio link"
                  value={portfolio}
                  onChange={e => setPortfolio(e.target.value)}
                  required
                />
              </div>
            </div>
          </ContentCard>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
            <SecondaryButton type="button" onClick={() => navigate('/student/dashboard')}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              type="submit"
              loading={submitting}
              disabled={organizerStatus === 'PENDING' || organizerStatus === 'APPROVED'}
            >
              Submit Organizer Application
            </PrimaryButton>
          </div>
        </form>
      </PageContainer>
    </StudentLayout>
  );
}
