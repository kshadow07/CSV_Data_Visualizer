import { useRef, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChartControls } from './components/ChartControls';
import Chart from './components/Chart';
import { ExportOptions } from './components/ExportOptions';
import { ErrorBoundary } from './components/ErrorBoundary';
import DataCleaningTools from './components/DataCleaningTools';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import DataPreview from './components/DataPreview';
import { ChartConfig, DataPoint } from './types';
import { FileSpreadsheet } from 'lucide-react';

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [originalData, setOriginalData] = useState<DataPoint[]>([]);
  const [config, setConfig] = useState<ChartConfig>({
    type: 'line',
    xAxis: '',
    yAxis: '',
    title: '',
    color: '#3B82F6',
    showGrid: true,
  });
  const [showStats, setShowStats] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDataLoaded = (newData: DataPoint[]) => {
    // Ensure numeric values are properly stored
    const processedData = newData.map(row => {
      const newRow = { ...row };
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (!isNaN(Number(value))) {
          newRow[key] = Number(value);
        }
      });
      return newRow;
    });
    
    setData(processedData);
    setOriginalData(processedData);
    
    if (processedData.length > 0) {
      const columns = Object.keys(processedData[0]);
      setConfig((prev) => ({
        ...prev,
        xAxis: columns[0],
        yAxis: columns[1] || columns[0],
      }));
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-[98%] mx-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CSV Data Visualizer</h1>
              <p className="text-sm text-gray-500">Upload your CSV file and create beautiful, interactive visualizations</p>
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Data Preview and Cleaning Section */}
            <div className="grid grid-cols-12 gap-6">
              {/* Data Cleaning Tools */}
              <div className="col-span-3 bg-white rounded-lg shadow p-4">
                <DataCleaningTools
                  data={data}
                  onDataUpdate={(newData) => {
                    setData(newData);
                    setOriginalData(newData);
                  }}
                  columns={columns}
                />
              </div>
              {/* Data Preview */}
              <div className="col-span-9">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Data Preview
                  </h2>
                  <DataPreview 
                    data={data} 
                    columns={columns}
                    onDataUpdate={(newData) => {
                      setData(newData);
                      setOriginalData(newData);
                    }}
                    onRowDelete={(index) => {
                      const newData = [...data];
                      newData.splice(index, 1);
                      setData(newData);
                      setOriginalData(newData);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200" ref={chartRef}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Visualization</h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setShowStats(!showStats)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                          showStats 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {showStats ? 'Hide Statistics' : 'Show Statistics'}
                      </button>
                      <ExportOptions chartRef={chartRef} />
                    </div>
                  </div>
                  <Chart data={data} config={config} />
                </div>

                <div className="w-full lg:w-64 xl:w-72 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Chart Controls</h3>
                  <ChartControls
                    config={config}
                    columns={columns}
                    onConfigChange={setConfig}
                  />
                </div>
              </div>
              
              {showStats && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                  <StatisticalAnalysis
                    data={data}
                    originalData={originalData}
                    onTransformedDataChange={setData}
                    columns={Object.keys(data[0])}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;