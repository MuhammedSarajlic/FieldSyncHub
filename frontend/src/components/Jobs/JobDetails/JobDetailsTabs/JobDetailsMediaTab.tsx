// src/components/Jobs/JobDetails/JobDetailsTabs/JobDetailsMediaTab.tsx
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { TJob } from '../../../../types/Job'; // Assuming TJob might be needed, though not directly used by jobMedia for now.

interface JobMedia {
  id: string;
  type: 'photo' | 'document';
  title: string;
  url: string;
  uploaded_at: string;
}

interface JobDetailsMediaTabProps {
  jobMedia: JobMedia[];
  jobDetails: TJob; // Passed for potential future use or context
}

const JobDetailsMediaTab: React.FC<JobDetailsMediaTabProps> = ({
  jobMedia,
  jobDetails,
}) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Photos</h3>
        {jobMedia.filter((item) => item.type === 'photo').length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {jobMedia
              .filter((item) => item.type === 'photo')
              .map((photo) => (
                <div
                  key={photo.id}
                  className='relative group overflow-hidden rounded-lg shadow-sm border border-gray-200'
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className='w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <p className='text-sm font-medium text-white'>
                      {photo.title}
                    </p>
                    <button
                      className='absolute top-2 right-2 p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100'
                      onClick={() => window.open(photo.url, '_blank')}
                      title='View Photo'
                    >
                      <Download className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className='text-gray-500'>No photos available for this job.</p>
        )}
      </div>

      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Documents</h3>
        {jobMedia.filter((item) => item.type === 'document').length > 0 ? (
          <div className='space-y-3'>
            {jobMedia
              .filter((item) => item.type === 'document')
              .map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center'>
                    <FileText className='w-5 h-5 text-blue-500 mr-3' />
                    <div>
                      <p className='text-sm font-medium text-gray-800'>
                        {doc.title}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Uploaded:{' '}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Download className='w-4 h-4 text-gray-500 group-hover:text-blue-600' />
                </a>
              ))}
          </div>
        ) : (
          <p className='text-gray-500'>No documents available for this job.</p>
        )}
      </div>
    </div>
  );
};

export default JobDetailsMediaTab;
