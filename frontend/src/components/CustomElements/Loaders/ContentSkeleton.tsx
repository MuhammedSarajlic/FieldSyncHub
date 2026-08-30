interface ContentSkeletonProps {
  rows?: number;
  fullScreen?: boolean;
}

const ContentSkeleton = ({ rows = 4, fullScreen = false }: ContentSkeletonProps) => (
  <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[22rem]'} w-full animate-pulse p-6`} aria-label='Loading content' role='status'>
    <div className='mx-auto max-w-6xl space-y-6'>
      <div className='h-7 w-52 rounded bg-gray-200 dark:bg-gray-700' />
      <div className='h-4 w-80 max-w-full rounded bg-gray-100 dark:bg-gray-800' />
      <div className='overflow-hidden rounded-lg border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className='grid grid-cols-4 gap-4 border-b border-gray-100 px-5 py-5 last:border-0 dark:border-gray-800'>
            <div className='h-4 rounded bg-gray-100 dark:bg-gray-800' />
            <div className='h-4 rounded bg-gray-100 dark:bg-gray-800' />
            <div className='h-4 rounded bg-gray-100 dark:bg-gray-800' />
            <div className='h-4 rounded bg-gray-100 dark:bg-gray-800' />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ContentSkeleton;
