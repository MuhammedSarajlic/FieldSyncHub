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
    <section aria-labelledby='quote-attachments-title' className='bg-white px-5 py-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 id='quote-attachments-title' className='text-base font-semibold text-[#17211d]'>Attachments</h2>
          <p className='mt-1 text-xs text-[#5f6d66]'>{currentAttachments.length} {currentAttachments.length === 1 ? 'file' : 'files'} on this quote</p>
        </div>
        {!isUploadAreaOpen && (
          <IconButton
            icon={<Plus className='w-4 h-4 mr-1' />}
            onClick={() => setIsUploadAreaOpen(true)}
            customStyle='h-9 rounded-lg bg-[#0d5944] px-3 text-white hover:bg-[#084936] border-none'
          >
            Add
          </IconButton>
        )}
      </div>

      {isUploadAreaOpen && (
        <div className='mb-5 text-center'>
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-5 transition-colors ${
              isDragging
                ? 'border-[#0d5944] bg-[#edf5f1]'
                : 'border-dashed border-[#cbd5d0] bg-[#f8faf9] hover:border-[#8fa198]'
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
              className={`mb-3 h-9 w-9 ${
                isDragging ? 'text-[#0d5944]' : 'text-[#5f6d66]'
              }`}
            />
            <p className='text-sm font-medium text-[#46564e]'>
              Drag & drop files here, or
            </p>
            <button
              type='button'
              onClick={handleButtonClick}
              className='relative z-10 mt-2 rounded-lg bg-[#0d5944] px-3 py-2 text-sm font-semibold text-white hover:bg-[#084936]'
            >
              Browse Files
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className='mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar'>
              {selectedFiles.map((fileWrapper, index) => (
                <div
                  key={fileWrapper.file.name + index}
                className='flex items-center justify-between rounded-lg border border-[#dfe5e1] bg-[#f7f9f8] p-3'
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
                    aria-label={`Remove ${fileWrapper.file.name}`}
                    className='ml-2 cursor-pointer rounded p-1 text-[#5f6d66] hover:bg-red-50 hover:text-red-700'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className='mt-4 flex justify-end space-x-2'>
            <CustomButton
              onClick={handleCancelUpload}
              customStyle='h-9 rounded-lg px-3 hover:bg-[#f1f4f2]'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleUploadFiles}
              disabled={
                selectedFiles.length === 0 ||
                selectedFiles.some((f) => f.uploadStatus.status === 'Uploading')
              }
              customStyle='h-9 rounded-lg bg-[#0d5944] px-3 text-white hover:bg-[#084936] border-none'
            >
              Upload
            </CustomButton>
          </div>
        </div>
      )}

      {currentAttachments.length > 0 ? (
        <div className='divide-y divide-[#e3e8e5] border-y border-[#e3e8e5]'>
          {currentAttachments.map((attachment, index) => (
            <div
              key={attachment.url || index}
              className='flex items-center justify-between gap-3 py-3'
            >
              <div className='flex items-center space-x-3'>
                <FileDown className='h-5 w-5 shrink-0 text-[#65736c]' />
                <span className='truncate text-sm font-medium text-[#33423a]'>
                  {attachment.fileName}
                </span>
              </div>
              {attachment.url && (
                <button
                  onClick={() => handleDownload(attachment.url)}
                  className='hover:opacity-80 cursor-pointer'
                >
                  <Download className='h-4 w-4 text-[#0d5944]' />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='flex min-h-20 items-center justify-center border border-dashed border-[#cbd5d0] bg-[#f8faf9] px-4 text-center'>
          <span className='text-sm text-[#5f6d66]'>
            No attachments added yet
          </span>
        </div>
      )}
    </section>
  );
};

export default QuoteAttachments;
