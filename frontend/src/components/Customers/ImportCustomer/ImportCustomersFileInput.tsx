import { ChangeEvent, useRef } from 'react';
import icons from '../../../constants/icons';
import ButtonIcon from '../../CustomElements/ButtonIcon';

interface ImportCustomersFileInputProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
}

const ImportCustomersFileInput = ({
  handleFileChange,
  selectedFile,
}: ImportCustomersFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAreaClick = () => {
    if (!selectedFile) {
      inputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      const isCSV =
        file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

      if (isCSV) {
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
  };

  return (
    <div className='flex-grow flex items-center justify-center px-6'>
      <div
        onClick={handleAreaClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className='w-full'
      >
        {!selectedFile ? (
          <div className='flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition'>
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              <p className='mb-2 text-sm text-gray-500'>
                <span className='font-semibold'>Click to upload</span> or drag
                and drop
              </p>
              <p className='text-xs text-gray-500'>CSV file only</p>
            </div>
          </div>
        ) : (
          <div className='h-26 flex items-center border-[1px] border-gray-300 rounded-lg w-full overflow-hidden'>
            <div className='h-full min-w-26 flex items-center justify-center bg-[#f6f5f8]'>
              <img src={icons.csvFileIcon} alt='csv' className='w-10 h-10' />
            </div>
            <div className='mx-5 flex-1 flex justify-between items-center'>
              <div className='flex-1 max-w-2sm'>
                <p className='font-semibold text-heading line-clamp-2'>
                  {selectedFile.name}
                </p>
                <p className='text-sm text-gray-500 truncate'>
                  {selectedFile.type || 'Unknown type'} •{' '}
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <div className='flex-shrink-0 ml-4'>
                <ButtonIcon
                  name='Replace file'
                  handleBtnClick={() => inputRef.current?.click()}
                />
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
        />
      </div>
    </div>
  );
};

export default ImportCustomersFileInput;
