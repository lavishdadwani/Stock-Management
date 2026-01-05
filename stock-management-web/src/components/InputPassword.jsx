import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const InputPassword = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  register,
  className = '',
  showStrength = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // If register is provided (from react-hook-form), use it directly
  // It's already the result of registerForm('name', {...})
  const inputProps = register 
    ? {
        ...register,
        onChange: (e) => {
          register.onChange(e);
          if (onChange) {
            onChange(e);
          }
        }
      }
    : {
        name,
        value,
        onChange,
        onBlur,
        required,
      };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...inputProps}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
              <FaEye className="w-5 h-5" />
        ) : (
            <FaEyeSlash className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
};

export default InputPassword;

