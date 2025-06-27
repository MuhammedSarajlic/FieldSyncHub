import { Construction } from 'lucide-react';

const PageUnderDevelopment = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 lg:px-8'>
      <div className='bg-white rounded-xl shadow-lg p-8 sm:p-10 text-center max-w-md w-full border border-gray-100'>
        <div className='flex justify-center mb-6'>
          <Construction className='h-16 w-16 text-blue-500 animate-spin-slow' />{' '}
          {/* Slow spin animation */}
        </div>
        <h1 className='text-3xl font-extrabold text-gray-900 mb-4'>
          Page Under Construction
        </h1>
        <p className='text-lg text-gray-600 mb-8'>
          We're diligently working to bring you this new page. Please check back
          soon!
        </p>
        <div className='text-sm text-gray-500'>
          Your patience is greatly appreciated.
        </div>
      </div>
    </div>
  );
};

export default PageUnderDevelopment;
