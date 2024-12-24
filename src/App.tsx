import React, { useRef, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { ChartControls } from './components/ChartControls';
import { Chart } from './components/Chart';
import { ExportOptions } from './components/ExportOptions';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChartConfig, DataPoint } from './types';
import { FileSpreadsheet } from 'lucide-react';

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [config, setConfig] = useState<ChartConfig>({
    type: 'line',
    xAxis: '',
    yAxis: '',
    title: '',
    color: '#3B82F6',
    showGrid: true,
  });
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDataLoaded = (newData: DataPoint[]) => {
    setData(newData);
    if (newData.length > 0) {
      const columns = Object.keys(newData[0]);
      setConfig((prev) => ({
        ...prev,
        xAxis: columns[0],
        yAxis: columns[1] || columns[0],
      }));
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            CSV Data Visualizer
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Upload your CSV file and create beautiful, interactive visualizations
          </p>
        </div>

        {data.length === 0 ? (
          <div className="max-w-xl mx-auto">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-8">
            <ErrorBoundary>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h2>
                <DataPreview data={data} />
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Chart Controls</h2>
                <ChartControls
                  config={config}
                  columns={columns}
                  onConfigChange={setConfig}
                />
              </div>

              <div className="bg-white shadow rounded-lg p-6" ref={chartRef}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Visualization</h2>
                  <ExportOptions chartRef={chartRef} />
                </div>
                <Chart data={data} config={config} />
              </div>
            </ErrorBoundary>

            <div className="text-center">
              <button
                onClick={() => {
                  setData([]);
                  setConfig({
                    type: 'line',
                    xAxis: '',
                    yAxis: '',
                    title: '',
                    color: '#3B82F6',
                    showGrid: true,
                  });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;