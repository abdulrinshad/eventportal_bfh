import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from '../Icons';

function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(17, 24, 39, 0.08), 0 1px 3px rgba(17, 24, 39, 0.04)',
            border: `1px solid ${type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: '#111827',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: type === 'success' ? '#22C55E' : '#EF4444',
            }}
          >
            {type === 'success' ? <FiCheck size={14} /> : <span style={{ fontWeight: 'bold' }}>!</span>}
          </div>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
