import React, { useState } from 'react';
import { DataPoint } from '../types';

interface DataPreviewProps {
  data: DataPoint[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate indices for slicing data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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
          {currentItems.map((row, index) => (
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
      <div className="flex flex-col items-center mt-2">
        <div className="flex items-center">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded-l hover:bg-blue-600 disabled:opacity-50"
          >
            Previous
          </button>
          
          <input 
            type="number" 
            value={currentPage} 
            onChange={(e) => {
              const pageNumber = Number(e.target.value);
              if (pageNumber > 0 && pageNumber <= Math.ceil(data.length / itemsPerPage)) {
                setCurrentPage(pageNumber);
              }
            }} 
            className="mx-2 w-16 text-center border rounded"
          />

          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={indexOfLastItem >= data.length}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} total rows
        </p>
      </div>
    </div>
  );
};