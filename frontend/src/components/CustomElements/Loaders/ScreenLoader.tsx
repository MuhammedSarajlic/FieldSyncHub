import { Loader2 } from 'lucide-react';

const ScreenLoader = () => {
  return (
    <div className='absolute top-0 left-0 z-10 w-full h-screen flex flex-col items-center justify-center'>
      <Loader2 className='h-10 w-10 animate-spin text-bg-primary' />
      <p>Loading</p>
    </div>
  );
};

export default ScreenLoader;
