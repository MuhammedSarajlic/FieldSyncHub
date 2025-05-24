import { X } from 'lucide-react';

interface INewCustomerModal {
  setIsNewCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewCustomerModal = ({ setIsNewCustomerModalOpen }: INewCustomerModal) => {
  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col'>
        <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>New Customer</h3>
          <button
            onClick={() => setIsNewCustomerModalOpen(false)}
            className='text-gray-500 hover:text-gray-700 cursor-pointer'
          >
            <X className='h-6 w-6' />
          </button>
        </div>
        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Full Name
            </label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              type='tel'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Address
            </label>
            <input
              type='text'
              placeholder='Street'
              className='w-full px-3 py-2 border border-gray-300 rounded-md mb-2'
            />
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='text'
                placeholder='City'
                className='px-3 py-2 border border-gray-300 rounded-md'
              />
              <select className='px-3 py-2 border border-gray-300 rounded-md'>
                <option>State</option>
              </select>
            </div>
            <input
              type='text'
              placeholder='ZIP Code'
              className='w-full px-3 py-2 border border-gray-300 rounded-md mt-2'
            />
          </div>
        </div>
        <div className='border-t border-gray-200 px-6 py-4 flex justify-end space-x-3'>
          <button
            onClick={() => setIsNewCustomerModalOpen(false)}
            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium cursor-pointer text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Add customer logic
              setIsNewCustomerModalOpen(false);
            }}
            className='px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700'
          >
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerModal;
