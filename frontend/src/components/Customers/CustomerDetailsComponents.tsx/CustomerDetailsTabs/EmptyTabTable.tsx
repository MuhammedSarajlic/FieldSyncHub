import { Plus } from 'lucide-react';
import { TCustomerTab } from '../../../../types/Customer';

interface IEmptyTabTableProps {
  tab: TCustomerTab;
  onButtonClick: () => void;
}

const EmptyTabTable = ({ tab, onButtonClick }: IEmptyTabTableProps) => {
  return (
    <div className='flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg mx-4 my-4'>
      <div className='bg-white rounded-full p-4 shadow-sm mb-2'>
        <tab.icon className='h-8 w-8 text-gray-400' />
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
        No {tab.label.toLowerCase()} found
      </h3>
      <p className='text-sm text-gray-600 text-center max-w-sm'>
        {`There are no current ${tab.label.toLowerCase()} for this client yet`}
      </p>

      <button
        onClick={onButtonClick}
        className='mt-4 cursor-pointer inline-flex items-center px-3.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
      >
        <Plus className='mr-1.5 h-3.5 w-3.5' />
        {`Create ${tab.label.toLowerCase().slice(0, -1)}`}
      </button>
    </div>
  );
};

export default EmptyTabTable;
