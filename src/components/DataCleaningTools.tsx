import React, { useState } from 'react';

interface DataCleaningToolsProps {
  data: any[];
  onDataUpdate: (newData: any[]) => void;
  columns: string[];
}

const DataCleaningTools: React.FC<DataCleaningToolsProps> = ({ data, onDataUpdate, columns }) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [meanResult, setMeanResult] = useState<string>('');
  const [medianResult, setMedianResult] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showResult = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFillMean = () => {
    const newData = [...data];
    columns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        newData.forEach(row => {
          if (row[column] === null || row[column] === undefined || row[column] === '') {
            row[column] = mean.toFixed(2);
          }
        });
      }
    });
    onDataUpdate(newData);
    showResult('Missing values filled with mean values');
  };

  const handleFillMedian = () => {
    const newData = [...data];
    columns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const median = values.length % 2 === 0
          ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
          : values[Math.floor(values.length / 2)];
        newData.forEach(row => {
          if (row[column] === null || row[column] === undefined || row[column] === '') {
            row[column] = median.toFixed(2);
          }
        });
      }
    });
    onDataUpdate(newData);
    showResult('Missing values filled with median values');
  };

  const handleRemoveRows = () => {
    const newData = data.filter(row => {
      return !columns.some(column => row[column] === null || row[column] === undefined || row[column] === '');
    });
    onDataUpdate(newData);
    showResult(`Removed ${data.length - newData.length} rows with missing values`);
  };

  const handleRemoveDuplicates = () => {
    const seen = new Set();
    const newData = data.filter(row => {
      const key = columns.map(column => row[column]).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    onDataUpdate(newData);
    showResult(`Removed ${data.length - newData.length} duplicate rows`);
  };

  const calculateMean = () => {
    if (!selectedColumn) {
      setMeanResult('Please select a column first');
      return;
    }
    const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
    if (values.length === 0) {
      setMeanResult('No numeric values found in selected column');
      return;
    }
    const mean = values.reduce((a, b) => a + b) / values.length;
    setMeanResult(`Mean: ${mean.toFixed(2)}`);
  };

  const calculateMedian = () => {
    if (!selectedColumn) {
      setMedianResult('Please select a column first');
      return;
    }
    const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
    if (values.length === 0) {
      setMedianResult('No numeric values found in selected column');
      return;
    }
    values.sort((a, b) => a - b);
    const median = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];
    setMedianResult(`Median: ${median.toFixed(2)}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Missing Values</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleFillMean}
            className="text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 transition-colors duration-200"
          >
            Fill with Mean
          </button>
          <button
            onClick={handleFillMedian}
            className="text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded px-2 py-1 transition-colors duration-200"
          >
            Fill with Median
          </button>
          <button
            onClick={handleRemoveRows}
            className="text-left text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded px-2 py-1 transition-colors duration-200"
          >
            Remove Rows
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Duplicates</h3>
        <button
          onClick={handleRemoveDuplicates}
          className="text-left text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded px-2 py-1 transition-colors duration-200 w-full"
        >
          Remove Duplicates
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Statistical Analysis</h3>
        <select 
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
          value={selectedColumn}
          onChange={(e) => {
            setSelectedColumn(e.target.value);
            setMeanResult('');
            setMedianResult('');
          }}
        >
          <option value="">Select Column</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
        <div className="flex flex-col gap-2">
          <button
            onClick={calculateMean}
            className="text-left text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded px-2 py-1 transition-colors duration-200"
          >
            Calculate Mean
          </button>
          {meanResult && (
            <div className="text-sm text-gray-600 px-2">
              {meanResult}
            </div>
          )}
          <button
            onClick={calculateMedian}
            className="text-left text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded px-2 py-1 transition-colors duration-200"
          >
            Calculate Median
          </button>
          {medianResult && (
            <div className="text-sm text-gray-600 px-2">
              {medianResult}
            </div>
          )}
        </div>
      </div>

      <button 
        className="w-full text-sm font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-300 rounded-lg px-3 py-2 transition-colors duration-200"
        onClick={() => onDataUpdate([])}
      >
        Clear Data
      </button>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DataCleaningTools;
