import { Loader2 } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className='z-10 w-full h-[90vh] flex flex-col items-center justify-center'>
      <Loader2 className='w-10 h-10 animate-spin text-bg-primary' />
      <p>Loading</p>
    </div>
  );
};

export default PageLoader;
