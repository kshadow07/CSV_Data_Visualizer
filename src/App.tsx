import { useRef, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChartControls } from './components/ChartControls';
import Chart from './components/Chart';
import DataCleaningTools from './components/DataCleaningTools';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import DataPreview from './components/DataPreview';
import { ChartConfig, DataPoint } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { RegressionAnalysis } from './components/RegressionAnalysis';

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
  const [showRegression, setShowRegression] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleDataLoaded = (newData: DataPoint[]) => {
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
      setConfig(prev => ({
        ...prev,
        xAxis: columns[0],
        yAxis: columns[1] || columns[0],
      }));
    }
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (!chartContainerRef.current || exporting) return;

    try {
      setExporting(true);
      const element = chartContainerRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-chart-container]');
          if (clonedElement) {
            clonedElement.className = 'bg-white p-4 rounded-lg';
          }
        }
      });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const widthRatio = pageWidth / canvas.width;
        const heightRatio = pageHeight / canvas.height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        const centerX = (pageWidth - canvas.width * ratio) / 2;
        const centerY = (pageHeight - canvas.height * ratio) / 2;
        
        pdf.addImage(imgData, 'PNG', centerX, centerY, canvas.width * ratio, canvas.height * ratio);
        pdf.save(`chart-${Date.now()}.pdf`);
      } else {
        const link = document.createElement('a');
        const timestamp = Date.now();
        link.download = `chart-${timestamp}.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = canvas.toDataURL(`image/${format}`, 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[98%] mx-auto py-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Main Content */}
        {data.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Data Tools and Preview */}
            <div className="grid grid-cols-12 gap-6">
              {/* Data Cleaning Tools */}
              <div className="col-span-3">
                <div className="bg-white shadow-sm rounded-lg p-6 h-full">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Data Tools
                  </h2>
                  <DataCleaningTools
                    data={data}
                    onDataUpdate={(newData) => {
                      setData(newData);
                      setOriginalData(newData);
                    }}
                    columns={columns}
                  />
                </div>
              </div>

              {/* Data Preview */}
              <div className="col-span-9">
                <div className="bg-white shadow-sm rounded-lg p-6">
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
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Chart Visualization
              </h2>
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
                      <button
                        onClick={() => setShowRegression(!showRegression)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        {showRegression ? 'Hide Regression' : 'Show Regression'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExport('png')}
                          disabled={exporting}
                          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Export as PNG
                        </button>
                        <button
                          onClick={() => handleExport('jpeg')}
                          disabled={exporting}
                          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Export as JPEG
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          disabled={exporting}
                          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  <div ref={chartContainerRef} data-chart-container className="bg-white p-4 rounded-lg shadow">
                    <Chart data={data} config={config} />
                    {showRegression && (
                      <RegressionAnalysis
                        data={data}
                        selectedXColumn={config.xAxis}
                        selectedYColumn={config.yAxis}
                      />
                    )}
                  </div>
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