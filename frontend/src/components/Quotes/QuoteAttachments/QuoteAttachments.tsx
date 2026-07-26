import React, { useState, useRef } from 'react';
import {
  Plus,
  CloudUpload,
  Paperclip,
  X,
  FileDown,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import IconButton from '../../CustomElements/Buttons/IconButton';
import CustomButton from '../../CustomElements/Buttons/CustomButton';

import { TAddQuoteAttachment, TQuoteAttachment } from '../../../types/Quote';
import {
  uploadFileToStorage,
  UploadStatus,
} from '../../../storage/uploadToStorage';
import { AddQuoteAttachment } from '../../../services/Quote';

interface FileWithUploadStatus {
  file: File;
  uploadStatus: UploadStatus;
}

interface IQuoteAttachments {
  quoteId: string;
  currentAttachments: TQuoteAttachment[];
  onAttachmentsUpdated: (newAttachment: TQuoteAttachment) => void;
}

const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return 'Invalid Size';
  }
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const QuoteAttachments = ({
  quoteId,
  currentAttachments,
  onAttachmentsUpdated,
}: IQuoteAttachments) => {
  const [isUploadAreaOpen, setIsUploadAreaOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithUploadStatus[]>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles: FileWithUploadStatus[] = Array.from(
        event.target.files
      ).map((file) => ({
        file,
        uploadStatus: { progress: 0, status: 'Pending' },
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles: FileWithUploadStatus[] = Array.from(
        e.dataTransfer.files
      ).map((file) => ({
        file,
        uploadStatus: { progress: 0, status: 'Pending' },
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
    setIsUploadAreaOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadFiles = async () => {
    if (!quoteId) return;

    setSelectedFiles((prev) =>
      prev.map((f) => ({
        ...f,
        uploadStatus: { ...f.uploadStatus, status: 'Uploading' },
      }))
    );

    const uploadPromises = selectedFiles.map((fileWrapper, index) => {
      const onProgress = (progress: number) => {
        setSelectedFiles((prevFiles) =>
          prevFiles.map((f, i) =>
            i === index
              ? {
                  ...f,
                  uploadStatus: {
                    ...f.uploadStatus,
                    progress,
                    status: 'Uploading',
                  },
                }
              : f
          )
        );
      };
      return uploadFileToStorage(
        fileWrapper.file,
        `quotes/attachments`,
        onProgress
      );
    });

    try {
      const results = await Promise.allSettled(uploadPromises);

      for (const [index, result] of results.entries()) {
        if (
          result.status === 'fulfilled' &&
          result.value.status === 'Completed' &&
          result.value.downloadURL
        ) {
          const uploadedFile: TAddQuoteAttachment = {
            fileName: selectedFiles[index].file.name,
            url: result.value.downloadURL,
          };
          try {
            const response = await AddQuoteAttachment(quoteId, uploadedFile);
            onAttachmentsUpdated(response.data);
            setSelectedFiles((prev) =>
              prev.map((f, i) =>
                i === index
                  ? {
                      ...f,
                      uploadStatus: { ...result.value, status: 'Completed' },
                    }
                  : f
              )
            );
          } catch (apiError: any) {
            console.error(`Failed to add to quote:`, apiError);
            setSelectedFiles((prev) =>
              prev.map((f, i) =>
                i === index
                  ? {
                      ...f,
                      uploadStatus: {
                        ...result.value,
                        status: 'Failed',
                        error: apiError.message || 'API error',
                      },
                    }
                  : f
              )
            );
          }
        } else {
          setSelectedFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? {
                    ...f,
                    uploadStatus: {
                      ...f.uploadStatus,
                      status: 'Failed',
                      error:
                        (result as PromiseRejectedResult).reason?.message ||
                        (result as PromiseFulfilledResult<UploadStatus>).value
                          .error ||
                        'Unknown error',
                    },
                  }
                : f
            )
          );
        }
      }

      handleCancelUpload();
    } catch (err) {
      console.error('Batch upload error:', err);
      handleCancelUpload();
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>Attachments</h3>
        {!isUploadAreaOpen && (
          <IconButton
            icon={<Plus className='w-4 h-4 mr-1' />}
            onClick={() => setIsUploadAreaOpen(true)}
            customStyle='bg-bg-primary text-white hover:border-gray-300 border-none'
          >
            Add
          </IconButton>
        )}
      </div>

      {isUploadAreaOpen && (
        <div className='mb-6 border-gray-300 rounded-lg text-center'>
          <div
            className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-colors ${
              isDragging
                ? 'border-bg-primary bg-bg-primary-light'
                : 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type='file'
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className='absolute inset-0 opacity-0 cursor-pointer w-full h-full'
            />
            <CloudUpload
              className={`w-12 h-12 mb-3 ${
                isDragging ? 'text-bg-primary' : 'text-gray-400'
              }`}
            />
            <p className='text-gray-600 font-medium'>
              Drag & drop files here, or
            </p>
            <button
              type='button'
              onClick={handleButtonClick}
              className='mt-2 px-4 py-2 bg-bg-primary text-white text-sm font-medium rounded-md hover:bg-bg-primary-hover'
            >
              Browse Files
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className='mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar'>
              {selectedFiles.map((fileWrapper, index) => (
                <div
                  key={fileWrapper.file.name + index}
                  className='flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-200'
                >
                  <div className='flex items-center space-x-3 truncate'>
                    <Paperclip className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-800 truncate'>
                      {fileWrapper.file.name}
                    </span>
                    <span className='text-xs text-gray-500'>
                      ({formatFileSize(fileWrapper.file.size)})
                    </span>
                    {fileWrapper.uploadStatus.status === 'Uploading' && (
                      <span className='text-xs text-blue-600 ml-2'>
                        {Math.round(fileWrapper.uploadStatus.progress)}%
                      </span>
                    )}
                    {fileWrapper.uploadStatus.status === 'Completed' && (
                      <CheckCircle className='w-4 h-4 text-green-500 ml-2' />
                    )}
                    {fileWrapper.uploadStatus.status === 'Failed' && (
                      <XCircle className='w-4 h-4 text-red-500 ml-2'>
                        <title>{fileWrapper.uploadStatus.error}</title>
                      </XCircle>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveFile(index)}
                    className='text-gray-500 hover:text-red-500 ml-2 cursor-pointer'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className='mt-6 flex justify-end space-x-3'>
            <CustomButton
              onClick={handleCancelUpload}
              customStyle='py-1.5 px-4 hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleUploadFiles}
              disabled={
                selectedFiles.length === 0 ||
                selectedFiles.some((f) => f.uploadStatus.status === 'Uploading')
              }
              customStyle='py-1.5 px-4 bg-bg-primary text-white hover:bg-bg-primary-hover border-none'
            >
              Upload
            </CustomButton>
          </div>
        </div>
      )}

      {currentAttachments.length > 0 ? (
        <div className='space-y-2'>
          {currentAttachments.map((attachment, index) => (
            <div
              key={attachment.url || index}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100'
            >
              <div className='flex items-center space-x-3'>
                <FileDown className='w-5 h-5 text-gray-400' />
                <span className='text-sm font-medium text-gray-900'>
                  {attachment.fileName}
                </span>
              </div>
              {attachment.url && (
                <button
                  onClick={() => handleDownload(attachment.url)}
                  className='hover:opacity-80 cursor-pointer'
                >
                  <Download className='w-4 h-4 text-primary' />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
          <span className='text-sm text-gray-500'>
            No attachments added yet
          </span>
        </div>
      )}
    </div>
  );
};

export default QuoteAttachments;
