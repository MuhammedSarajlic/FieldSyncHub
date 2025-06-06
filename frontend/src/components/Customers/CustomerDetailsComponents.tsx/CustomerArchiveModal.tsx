import { AlertTriangle, Archive } from 'lucide-react';
import { useState } from 'react';

interface ArchiveCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  customerName: string;
}

const CustomerArchiveModal = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
}: ArchiveCustomerModalProps) => {
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsArchiving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='p-6'>
          <div className='flex items-start'>
            <div className='flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center'>
              <AlertTriangle className='h-5 w-5 text-red-600' />
            </div>
            <div className='ml-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                Archive Customer
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  Are you sure you want to archive{' '}
                  <span className='font-semibold text-gray-800'>
                    {customerName}
                  </span>
                  ? This action will:
                </p>
                <ul className='list-disc text-sm text-gray-500 pl-5 mt-2 space-y-1'>
                  <li>Mark the customer as inactive</li>
                  <li>Preserve all historical data</li>
                  <li>Remove from active customer lists</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              disabled={isArchiving}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleArchive}
              disabled={isArchiving}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center'
            >
              {isArchiving ? (
                'Archiving...'
              ) : (
                <>
                  <Archive className='w-4 h-4 mr-2' />
                  Archive Customer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerArchiveModal;
