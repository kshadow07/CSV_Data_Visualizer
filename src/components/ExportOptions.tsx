import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

interface ExportOptionsProps {
  chartRef: React.RefObject<HTMLDivElement>;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ chartRef }) => {
  const exportChart = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    
    if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('chart.pdf');
    } else {
      const link = document.createElement('a');
      link.download = `chart.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    }
  };

  return (
    <div className="flex space-x-2">
      {(['png', 'jpeg', 'pdf'] as const).map((format) => (
        <button
          key={format}
          onClick={() => exportChart(format)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as {format.toUpperCase()}
        </button>
      ))}
    </div>
  );
};