import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

interface ExportOptionsProps {
  chartRef: React.RefObject<HTMLDivElement>;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ chartRef }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (!chartRef.current || exporting) return;

    try {
      setExporting(true);
      const element = chartRef.current;
      
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

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('png')}
        disabled={exporting}
        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4 mr-2" />
        Export as PNG
      </button>
      <button
        onClick={() => handleExport('jpeg')}
        disabled={exporting}
        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4 mr-2" />
        Export as JPEG
      </button>
      <button
        onClick={() => handleExport('pdf')}
        disabled={exporting}
        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4 mr-2" />
        Export as PDF
      </button>
    </div>
  );
};