import { Loader2 } from 'lucide-react';

interface ITabTableLoader {
  label: string;
}

const TabTableLoader = ({ label }: ITabTableLoader) => {
  return (
    <div className='flex items-center justify-center py-8'>
      <Loader2 className='animate-spin mr-2 h-5 w-5 text-gray-400' />
      <span className='text-gray-500 text-sm'>
        Loading {label.toLowerCase()}…
      </span>
    </div>
  );
};

export default TabTableLoader;
