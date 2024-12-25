import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { DataPoint } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: { fullData: DataPoint[], visualizationData: DataPoint[] }) => void;
}

// Constants for file size and row limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_ROW_COUNT = 100000;
const MAX_VISUALIZATION_POINTS = 10000; // Maximum points to display in visualization

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);

  const downsampleData = (data: DataPoint[], targetSize: number): DataPoint[] => {
    if (data.length <= targetSize) return data;
    
    const step = Math.ceil(data.length / targetSize);
    return data.filter((_, index) => index % step === 0);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          setError('Error parsing CSV file. Please check the file format.');
          return;
        }

        if (!results.data || results.data.length === 0) {
          setError('The CSV file appears to be empty');
          return;
        }

        // Check row count
        if (results.data.length > MAX_ROW_COUNT) {
          setError(`File exceeds the maximum limit of ${MAX_ROW_COUNT.toLocaleString()} rows`);
          return;
        }

        try {
          // Validate data structure
          const parsedData = results.data as DataPoint[];
          if (!Array.isArray(parsedData)) {
            throw new Error('Invalid data format');
          }

          // Check if we have at least one row and it has properties
          if (parsedData.length === 0 || Object.keys(parsedData[0]).length === 0) {
            throw new Error('No data found in CSV');
          }

          // Downsample data for visualization if necessary
          const visualizationData = downsampleData(parsedData, MAX_VISUALIZATION_POINTS);
          
          // Pass both full data and downsampled data
          onDataLoaded({
            fullData: parsedData,
            visualizationData: visualizationData
          });
        } catch (err) {
          console.error('Data processing error:', err);
          setError('Error processing CSV data. Please check the file format.');
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Error reading CSV file. Please try again.');
      },
    });
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        {isDragActive ? (
          <p className="mt-2 text-blue-500">Drop the CSV file here...</p>
        ) : (
          <div>
            <p className="mt-2 text-gray-600">Drag and drop a CSV file here, or click to select</p>
            <p className="mt-1 text-sm text-gray-500">Only CSV files are supported</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};