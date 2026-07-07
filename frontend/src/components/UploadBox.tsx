import React, { useCallback, useState } from 'react';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  onError: (msg: string) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({ onFileSelect, onError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        onFileSelect(file);
      } else {
        onError('Tolong unggah file berformat .csv atau .xlsx');
      }
    }
  }, [onFileSelect, onError]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        onFileSelect(file);
      } else {
        onError('Tolong unggah file berformat .csv atau .xlsx');
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors touch-manipulation ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileInput}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center space-y-4"
      >
        <div className="bg-blue-100 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Sentuh untuk Unggah</p>
          <p className="text-sm text-gray-500 mt-1">Atau seret file .csv / .xlsx ke sini</p>
        </div>
      </label>
    </div>
  );
};

export default UploadBox;
