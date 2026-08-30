import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  X,
  Image,
  File,
  Video,
} from 'lucide-react';
import { useState } from 'react';


interface JobMedia {
  id: string;
  type: 'photo' | 'document';
  title: string;
  url: string;
  uploaded_at: string;
  size?: string;
  uploadedBy?: string;
  email?: string;
}

interface IJobDetailsMediaTab {
  jobMedia?: JobMedia[];
  jobDetails?: any;
}

const JobDetailsMediaTab = ({
  jobMedia = [],
  jobDetails,
}: IJobDetailsMediaTab) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (type: string, filename: string) => {
    // Image files
    if (
      type === 'photo' ||
      filename.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)
    ) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <Image className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // Video files
    if (filename.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i)) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <Video className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // PDF files
    if (filename.match(/\.pdf$/i)) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <FileText className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // CSV files
    if (filename.match(/\.csv$/i)) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <File className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // Text files
    if (filename.match(/\.(txt|doc|docx|rtf)$/i)) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <FileText className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // Design files
    if (filename.match(/\.(fig|sketch|xd|psd|ai)$/i)) {
      return (
        <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
          <File className='w-4.5 h-4.5 text-gray-500' />
        </div>
      );
    }

    // Default file icon
    return (
      <div className='w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center'>
        <File className='w-4.5 h-4.5 text-gray-500' />
      </div>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }
      }, 200);
    }
  };

  const filteredMedia = jobMedia.filter((media) => {
    if (activeTab === 'your' || activeTab === 'shared') return false;
    return media.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Files and assets
            </h1>
            <p className='text-gray-600'>
              Documents and attachments that have been uploaded as part of this
              project.
            </p>
          </div>
        </div>
      </div>
      {/* Upload Area */}
      <div className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center relative mb-6'>
        <div className='flex flex-col items-center'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <Upload className='w-6 h-6 text-gray-400' />
          </div>
          <div className='mb-2'>
            <label htmlFor='file-upload' className='cursor-pointer'>
              <span className='text-blue-600 hover:text-blue-500 font-medium'>
                Click to upload
              </span>
              <span className='text-gray-600'> or drag and drop</span>
            </label>
            <input
              id='file-upload'
              type='file'
              className='hidden'
              multiple
              onChange={handleFileUpload}
            />
          </div>
          <p className='text-sm text-gray-500'>Maximum file size 5 MB</p>
        </div>
      </div>
      {/* Upload Progress */}
      {isUploading && (
        <div className='mb-6'>
          <div className='bg-white p-3 rounded-lg shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <FileText className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium'>
                  Dashboard prototype recording 01.mp4
                </span>
              </div>
              <button className='text-gray-400 hover:text-gray-600 cursor-pointer'>
                <X className='w-4 h-4' />
              </button>
            </div>
            <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
              <span>16 MB</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-1'>
              <div
                className='bg-blue-500 h-1 rounded-full transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {/* Files Section */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900 mb-1'>
              Attached files
            </h2>
            <p className='text-gray-600 text-sm mb-4'>
              Files and assets that have been attached to this project.
            </p>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* File List Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  File name
                </th>
                <th className='text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Date uploaded
                </th>
                <th className='text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Last updated
                </th>
                <th className='text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Uploaded by
                </th>
                <th className='text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {filteredMedia.map((media) => (
                <tr key={media.id} className='hover:bg-gray-50'>
                  <td className='py-4 px-6'>
                    <div className='flex items-center gap-3'>
                      {getFileIcon(media.type, media.title)}
                      <div className='space-y-1'>
                        <div className='font-medium text-heading'>
                          {media.title}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {media.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-6 text-sm text-gray-600'>
                    {formatDate(media.uploaded_at)}
                  </td>
                  <td className='py-4 px-6 text-sm text-gray-600'>
                    {formatDate(media.uploaded_at)}
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                        <span className='text-xs font-medium text-purple-600'>
                          {media.uploadedBy
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {media.uploadedBy}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {media.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-6 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <button className='text-sm text-gray-500 hover:text-red-600'>
                        Delete
                      </button>
                      <button className='text-sm text-gray-500 hover:text-blue-600'>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsMediaTab;
