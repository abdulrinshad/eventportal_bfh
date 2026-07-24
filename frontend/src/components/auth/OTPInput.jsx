import React, { useRef, useEffect } from 'react';

function OTPInput({ value = '', onChange }) {
  const inputsRef = useRef([]);

  // Create an array of 6 elements for mapping
  const otpArray = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!val) {
      // Clear value
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onChange(newOtp.join(''));
      return;
    }

    // Take the last character entered
    const char = val.substring(val.length - 1);
    if (!/[0-9]/.test(char)) return; // Only allow numbers

    const newOtp = [...otpArray];
    newOtp[index] = char;
    const combinedVal = newOtp.join('');
    onChange(combinedVal);

    // Auto next focus
    if (index < 5 && char) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      // If backspace pressed on empty box, focus previous and clear it
      const newOtp = [...otpArray];
      newOtp[index - 1] = '';
      onChange(newOtp.join(''));
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      onChange(pasteData);
      // Focus on the appropriate field
      const targetIndex = Math.min(pasteData.length, 5);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  // Initial auto focus
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '24px 0' }} onPaste={handlePaste}>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2} // allow typing over existing
            value={otpArray[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              color: '#111827',
              background: '#FFFFFF',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563EB';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
    </div>
  );
}

export default OTPInput;
