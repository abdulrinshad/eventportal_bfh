import React from 'react';
import { motion } from 'framer-motion';

function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: '#FFFFFF',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* Left Column: Visual Brand Banner (Hidden on small screens) */}
      <div
        className="auth-sidebar-panel"
        style={{
          flex: '1.2',
          position: 'relative',
          background: '#111827',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Background Image with rich overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            zIndex: 0,
          }}
        />
        
        {/* Top-down dark overlay gradient for editorial readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.4) 50%, rgba(17, 24, 39, 0.9) 100%)',
            zIndex: 1,
          }}
        />

        {/* Brand logo header */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>📅</span>
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            CompilVision
          </span>
        </div>

        {/* Central visual text & floating stats */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px', marginTop: 'auto', marginBottom: 'auto' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-1px', marginBottom: '16px' }}>
            Coordinate high-stakes summits, flawlessly.
          </h2>
          <p style={{ fontSize: '16px', color: '#E2E8F0', lineHeight: '1.6', marginBottom: '32px' }}>
            Join the premium community of event coordinators managing ticketing, scheduling, and engagement metrics inside a single luxury workspace.
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F5C451' }}>12k+</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Events Hosted</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F5C451' }}>1.2M+</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Tickets Sold</div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial box */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '480px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#F1F5F9', fontStyle: 'italic', margin: '0 0 12px 0', lineHeight: '1.5' }}>
            "CompilVision completely transformed how we handle registration success and ticket tiers for our yearly Global Tech summits. The interface is exceptionally clean."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5C451', color: '#111827', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContext: 'center', fontSize: '11px', paddingLeft: '8px' }}>
              SR
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Sarah Jenkins</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Director of Operations, FutureTech</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div
        style={{
          flex: '0.8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: '#F8FAFC',
          position: 'relative',
        }}
      >
        {/* Subtle decorative blob */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 196, 81, 0.05) 0%, rgba(245, 196, 81, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>

      {/* Scoped CSS to hide left banner on mobile/tablet viewports */}
      <style>{`
        @media (max-width: 1024px) {
          .auth-sidebar-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AuthLayout;
