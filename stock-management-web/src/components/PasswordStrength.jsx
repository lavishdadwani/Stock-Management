import React from 'react';

const PasswordStrength = ({ password }) => {
  if (!password || password.length === 0) {
    return null;
  }

  const calculateStrength = (pwd) => {
    let strength = 0;
    let feedback = [];

    // Length check
    if (pwd.length >= 8) {
      strength += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Lowercase check
    if (/[a-z]/.test(pwd)) {
      strength += 1;
    } else {
      feedback.push('one lowercase letter');
    }

    // Uppercase check
    if (/[A-Z]/.test(pwd)) {
      strength += 1;
    } else {
      feedback.push('one uppercase letter');
    }

    // Number check
    if (/\d/.test(pwd)) {
      strength += 1;
    } else {
      feedback.push('one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      strength += 1;
    }

    // Length bonus
    if (pwd.length >= 12) {
      strength += 0.5;
    }

    return { strength, feedback };
  };

  const { strength, feedback } = calculateStrength(password);

  const getStrengthLabel = () => {
    if (strength <= 1) return { label: 'Very Weak', color: 'bg-red-500' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-orange-500' };
    if (strength <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const { label, color } = getStrengthLabel();
  const strengthPercentage = Math.min((strength / 5) * 100, 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">Password Strength:</span>
        <span className={`text-xs font-semibold ${
          strength <= 1 ? 'text-red-600' :
          strength <= 2 ? 'text-orange-600' :
          strength <= 3 ? 'text-yellow-600' :
          strength <= 4 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      
      {/* Strength bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="text-xs text-gray-600">
          <p className="mb-1">Password must contain:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {feedback.map((item, index) => (
              <li key={index} className="text-gray-500">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strength indicators */}
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              strength >= level
                ? level <= 1
                  ? 'bg-red-500'
                  : level <= 2
                  ? 'bg-orange-500'
                  : level <= 3
                  ? 'bg-yellow-500'
                  : level <= 4
                  ? 'bg-blue-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;

