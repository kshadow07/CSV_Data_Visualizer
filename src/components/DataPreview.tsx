import React from 'react';
import { DataPoint } from '../types';

interface DataPreviewProps {
  data: DataPoint[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(0, 5).map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td
                  key={`${index}-${header}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 5 && (
        <p className="text-sm text-gray-500 mt-2">
          Showing first 5 rows of {data.length} total rows
        </p>
      )}
    </div>
  );
};