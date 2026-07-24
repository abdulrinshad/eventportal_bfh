import React from 'react';
import { motion } from 'framer-motion';

function AuthCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '20px',
        padding: '40px 32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        width: '100%',
        boxSizing: 'border-box',
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </motion.div>
  );
}

export default AuthCard;
