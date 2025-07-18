import React from 'react';

const ToggleGroup = ({ options, value, onChange, size = 'default' }) => {
  const sizeClasses = {
    small: 'text-sm px-3 py-2',
    default: 'text-base px-4 py-2'
  };

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={`flex-1 rounded-lg transition-all duration-200 font-medium
            ${sizeClasses[size]}
            ${value === option.value 
              ? 'bg-accent text-text-inverse shadow-md' 
              : 'bg-bg-input hover:bg-bg-tertiary'}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;
