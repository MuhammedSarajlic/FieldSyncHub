import { useRef, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import CustomSmallButton from '../CustomElements/CustomSmallButton';

interface NoteFileUploadProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const NoteFileUpload = ({
  selectedFile,
  setSelectedFile,
}: NoteFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getFileExtension = (filename: string) =>
    filename.split('.').pop()?.toUpperCase() ?? 'FILE';

  return (
    <div>
      <div
        className='flex items-center justify-center space-x-3 mt-4 p-2 border-2 border-border-primary border-dashed rounded-lg cursor-pointer'
        onClick={() => fileInputRef.current?.click()}
      >
        <p className='text-sm text-primary'>Click to select file</p>
        <CustomSmallButton title='Select File' customStyle='px-4' />
        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          accept='*'
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <div className='mt-3 p-3 border border-border-primary rounded-lg space-y-2'>
          <div className='flex justify-between items-start'>
            <div className='flex items-center space-x-3'>
              <div className='bg-gray-200 p-2 rounded-md'>
                <span className='text-gray-700'>
                  {getFileExtension(selectedFile.name)}
                </span>
              </div>
              <div>
                <p className='text-sm font-medium'>{selectedFile.name}</p>
                <p className='text-xs text-gray-500'>
                  {Math.round(selectedFile.size / 1024)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className='cursor-pointer'
            >
              <X className='w-3 h-3 m-0.5' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteFileUpload;
