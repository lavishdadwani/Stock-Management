import React from 'react';

const TONE_STYLES = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-600',
  info: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800'
};

const Badge = ({ tone = 'neutral', children, className = '' }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${TONE_STYLES[tone] || TONE_STYLES.neutral} ${className}`}>
    {children}
  </span>
);

export default Badge;
