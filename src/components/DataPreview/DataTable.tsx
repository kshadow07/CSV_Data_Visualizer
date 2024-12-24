import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { DataPoint } from '../../types';

interface DataTableProps {
  data: DataPoint[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  sortColumn,
  sortDirection,
  onSort,
}) => {
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
                onClick={() => onSort(header)}
                className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>{header}</span>
                  {sortColumn === header ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4 text-blue-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-blue-500" />
                    )
                  ) : (
                    <div className="flex flex-col opacity-0 group-hover:opacity-100">
                      <ArrowUp className="h-3 w-3 -mb-1" />
                      <ArrowDown className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
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
    </div>
  );
};