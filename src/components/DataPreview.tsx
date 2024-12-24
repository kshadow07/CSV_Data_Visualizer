import React, { useState } from 'react';

interface DataPreviewProps {
  data: any[];
  columns: string[];
  onDataUpdate: (newData: any[]) => void;
  onRowDelete?: (index: number) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, columns, onDataUpdate, onRowDelete }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentData = data.slice(startIndex, endIndex);

  const handleEdit = (rowIndex: number, column: string, value: any) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(value?.toString() || '');
  };

  const handleSave = (rowIndex: number, column: string) => {
    const newData = [...data];
    const actualRowIndex = startIndex + rowIndex;
    newData[actualRowIndex] = {
      ...newData[actualRowIndex],
      [column]: editValue
    };
    onDataUpdate(newData);
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, rowIndex: number, column: string) => {
    if (e.key === 'Enter') {
      handleSave(rowIndex, column);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap cursor-pointer"
                    onClick={() => handleEdit(rowIndex, column, row[column])}
                  >
                    {editingCell?.row === rowIndex && editingCell?.column === column ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(rowIndex, column)}
                        onKeyDown={(e) => handleKeyPress(e, rowIndex, column)}
                        className="w-full p-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span className="block w-full hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1">
                        {row[column]}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onRowDelete?.(startIndex + rowIndex)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 rounded px-2 py-1 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">First Page</span>
              ⟪
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous Page</span>
              ←
            </button>
            <div className="flex items-center gap-1 px-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= totalPages) {
                    setCurrentPage(value);
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500 text-sm">/ {totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next Page</span>
              →
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Last Page</span>
              ⟫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;