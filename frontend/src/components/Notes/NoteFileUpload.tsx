import React, { useRef, useState, ChangeEvent, DragEvent } from 'react';
import icons from '../../constants/icons';
import CustomSmallButton from '../CustomElements/CustomSmallButton';

interface FileWithProgress {
  file: File;
  progress: number;
  status: string;
}

const NoteFileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processFiles(event.dataTransfer.files);
  };

  const processFiles = (files: FileList) => {
    const fileArray = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: 'Uploading...',
    }));

    setUploadedFiles((prevFiles) => [...prevFiles, ...fileArray]);

    fileArray.forEach((fileObj, index) => {
      simulateUpload(fileObj, index);
    });
  };

  const simulateUpload = (fileObj: FileWithProgress, index: number) => {
    const totalSize = fileObj.file.size;
    let uploaded = 0;
    const interval = setInterval(() => {
      setUploadedFiles((prevFiles) =>
        prevFiles.map((f, i) => {
          if (i === index) {
            uploaded += totalSize / 10;
            const newProgress = Math.min((uploaded / totalSize) * 100, 100);
            if (newProgress === 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'Completed' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        })
      );
    }, 500);
  };

  const handleRemove = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div>
      <div
        className='flex items-center justify-center space-x-3 mt-4 p-2 border-2 border-border-primary border-dashed rounded-lg cursor-pointer'
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className='text-sm text-primary'>Drag & drop files here or</p>
        <CustomSmallButton
          title='Select Files'
          customStyle='px-4'
          handleClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div className='mt-2 space-y-2'>
        {uploadedFiles.map((fileObj, index) => (
          <div
            key={index}
            className='p-3 border-[1px] border-border-primary rounded-lg space-y-3'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='bg-gray-200 p-2 rounded-md'>
                  <span className='text-gray-700'>
                    {getFileExtension(fileObj.file.name)}
                  </span>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{fileObj.file.name}</p>
                  <div className='text-xs text-gray-500'>
                    <span>{`${Math.round(fileObj.file.size / 1000)} KB`}</span>
                    <span> • {fileObj.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(index)}
                className='cursor-pointer'
              >
                <img
                  src={
                    fileObj.status === 'Uploading...'
                      ? icons.closeIcon
                      : icons.trashIcon
                  }
                  alt=''
                  className={
                    fileObj.status === 'Uploading...' ? 'w-3 h-3' : 'w-4 h-4'
                  }
                />
              </button>
            </div>
            <div className='mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-blue-500 transition-all'
                style={{ width: `${fileObj.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteFileUpload;
