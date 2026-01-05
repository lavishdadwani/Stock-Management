import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  register,
  className = '',
  ...props
}) => {
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
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...inputProps}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
};

export default Input;

