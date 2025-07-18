import React from 'react';

const ToggleGroup = ({ options, value, onChange }) => {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option.value}
          className={`toggle-btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;
