import { ChangeEvent, useRef, useState } from 'react';

interface ImportCustomersFileInputProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

const ImportCustomersFileInput = ({
  handleFileChange,
  selectedFile,
  isLoading = false,
}: ImportCustomersFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAreaClick = () => {
    if (!selectedFile && !isLoading) {
      inputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isCSV =
        file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

      if (isCSV) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit. Please choose a smaller file.');
          return;
        }

        const fakeEvent = {
          target: { files: [file] },
        } as unknown as ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      } else {
        alert('Only CSV files are allowed.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fakeEvent = {
      target: { files: null },
    } as unknown as ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className='space-y-4'>
      {/* Instructions */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-start'>
          <svg
            className='w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
          <div>
            <h4 className='text-sm font-medium text-blue-800 mb-1'>
              CSV Requirements
            </h4>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• File must include "First Name" and "Last Name" columns</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Supported format: .csv files only</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onClick={handleAreaClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative transition-all duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {!selectedFile ? (
          <div
            className={`
            flex flex-col items-center justify-center w-full h-48 
            border-2 border-dashed rounded-lg transition-all duration-200
            ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isLoading ? 'pointer-events-none' : ''}
          `}
          >
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              {isLoading ? (
                <div className='w-10 h-10 mb-4'>
                  <div className='animate-spinner w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full'></div>
                </div>
              ) : (
                <svg
                  className={`w-10 h-10 mb-4 transition-colors duration-200 ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                  />
                </svg>
              )}
              <p className='mb-2 text-sm text-gray-600'>
                {isLoading ? (
                  <span>Processing file...</span>
                ) : (
                  <>
                    <span className='font-semibold'>Click to upload</span> or
                    drag and drop
                  </>
                )}
              </p>
              {!isLoading && (
                <p className='text-xs text-gray-500'>CSV file only (Max 5MB)</p>
              )}
            </div>
          </div>
        ) : (
          <div className='border border-gray-200 rounded-lg bg-white shadow-sm'>
            <div className='p-4 flex items-center space-x-4'>
              <div className='flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-900 truncate text-sm'>
                  {selectedFile.name}
                </p>
                <p className='text-sm text-gray-500'>
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isLoading}
                  className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                >
                  Replace
                </button>
                <button
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                  className='inline-flex items-center p-1.5 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
                  title='Remove file'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type='file'
          accept='.csv'
          className='hidden'
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ImportCustomersFileInput;
