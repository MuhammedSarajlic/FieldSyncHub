import { useState } from 'react';
import { CreateServiceItem } from '../../../services/ServiceItem';
import { TAddServiceItem } from '../../../types/ServiceItem';
import { addServiceItemInitialState } from '../../../const/states';

interface IPricebookItemModal {
  onClose: () => void;
  fetchServiceItems: () => void;
}

const PricebookItemModal = ({
  onClose,
  fetchServiceItems,
}: IPricebookItemModal) => {
  const [serviceItem, setServiceItem] = useState<TAddServiceItem>(
    addServiceItemInitialState
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setServiceItem((prev) => {
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        return {
          ...prev,
          [name]: e.target.checked,
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(serviceItem);
    const response = await CreateServiceItem(serviceItem);
    if (response.status === 200) {
      fetchServiceItems();
      onClose();
    }
    console.log(response);
  };

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden'>
        {/* Header */}
        <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Create New Item
            </h2>
            <button
              onClick={onClose}
              className='rounded-full p-1 hover:bg-gray-200 transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form content */}
          <div className='p-6 max-h-[60vh] overflow-y-auto space-y-6'>
            {/* Item type selector */}
            <div className='flex space-x-4 mb-2'>
              <div
                className={`flex-1 py-3 px-4 text-center rounded-lg cursor-pointer border-2 transition-all ${
                  serviceItem.type === 'service'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setServiceItem((prev) => ({ ...prev, type: 'service' }))
                }
              >
                <div className='font-medium'>Service</div>
                <div className='text-xs text-gray-500'>
                  For labor & time-based items
                </div>
              </div>
              <div
                className={`flex-1 py-3 px-4 text-center rounded-lg cursor-pointer border-2 transition-all ${
                  serviceItem.type === 'material'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setServiceItem((prev) => ({ ...prev, type: 'material' }))
                }
              >
                <div className='font-medium'>Material</div>
                <div className='text-xs text-gray-500'>
                  For physical products
                </div>
              </div>
            </div>

            {/* Main form fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left column */}
              <div className='space-y-5'>
                {/* Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Name *
                  </label>
                  <input
                    name='name'
                    value={serviceItem.name}
                    onChange={handleChange}
                    required
                    placeholder='Enter item name'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    SKU
                  </label>
                  <input
                    name='sku'
                    value={serviceItem.sku}
                    onChange={handleChange}
                    placeholder='e.g., SRV-001'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  />
                </div>

                {/* Unit Price & Cost */}
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Unit Price ($) *
                    </label>
                    <input
                      name='unitPrice'
                      type='number'
                      value={serviceItem.unitPrice}
                      onChange={handleChange}
                      required
                      placeholder='0.00'
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Cost ($)
                    </label>
                    <input
                      name='cost'
                      type='number'
                      placeholder='0.00'
                      value={serviceItem.cost}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                    />
                  </div>
                </div>

                {/* Tax settings */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium text-gray-700'>
                      Is Taxable
                    </label>
                    <div className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='isTaxable'
                        checked={serviceItem.isTaxable}
                        onChange={handleChange}
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </div>
                  </div>

                  {serviceItem.isTaxable && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tax Rate (%)
                      </label>
                      <input
                        name='taxRate'
                        type='number'
                        value={serviceItem.taxRate}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className='space-y-5'>
                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={serviceItem.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder='Enter item description'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  />
                </div>

                {/* Category */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Category
                  </label>
                  <select
                    name='category'
                    value={serviceItem.category}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  >
                    <option value=''>Select a category</option>
                    <option value='cat1'>General Services</option>
                    <option value='cat2'>Maintenance</option>
                    <option value='cat3'>Installation</option>
                    <option value='cat4'>Repairs</option>
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Image URL
                  </label>
                  <input
                    name='imageUrl'
                    value={serviceItem.imageUrl}
                    onChange={handleChange}
                    placeholder='https://...'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  />
                </div>

                {/* Status */}
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium text-gray-700'>
                    Active Status
                  </label>
                  <div className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      name='isActive'
                      checked={serviceItem.isActive}
                      onChange={handleChange}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className='bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricebookItemModal;
