import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  register,
  className = '',
  ...props
}) => {
  // If register is provided (from react-hook-form), use it directly
  // It's already the result of registerForm('name', {...})
  const selectProps = register
    ? register
    : {
        name,
        value,
        onChange,
        onBlur,
        required,
      };

  // Extract name from register if available, otherwise use name prop
  const fieldName = register?.name || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={fieldName}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...selectProps}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
};

export default Select;

