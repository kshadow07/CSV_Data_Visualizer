import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { DataPoint } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: DataPoint[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          return;
        }

        // Results.data is already in the correct format when header: true
        const parsedData = results.data as DataPoint[];
        onDataLoaded(parsedData);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
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
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      {isDragActive ? (
        <p className="mt-2 text-blue-500">Drop the CSV file here...</p>
      ) : (
        <p className="mt-2 text-gray-500">
          Drag and drop a CSV file here, or click to select one
        </p>
      )}
    </div>
  );
};