import React from 'react';

interface RowsPerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
}

export const RowsPerPageSelect: React.FC<RowsPerPageSelectProps> = ({
  value,
  onChange,
  options,
}) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600">Rows per page:</span>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border border-gray-300 rounded-md text-sm p-1 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === -1 ? 'All' : option}
        </option>
      ))}
    </select>
  </div>
);