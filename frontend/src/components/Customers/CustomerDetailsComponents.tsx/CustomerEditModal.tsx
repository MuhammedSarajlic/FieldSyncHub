import { useState } from 'react';
import { TAddCustomer, TCustomer } from '../../../types/Customer';
import icons from '../../../constants/icons';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomButton from '../../CustomElements/CustomButton';

interface ICustomerEditModal {
  customer: TCustomer;
  onClose: () => void;
  //   onSave: (updatedCustomer: TCustomer) => void;
}

const CustomerEditModal = ({
  customer,
  onClose,
}: //   onSave,
ICustomerEditModal) => {
  const [formData, setFormData] = useState<TCustomer>(customer);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (formData.isCompany && !formData.companyName?.trim()) {
      setError('Company name is required for company customers.');
      return;
    }

    setError('');
    // onSave(formData);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center'>
      <div className='bg-white w-full max-w-2xl rounded-lg p-6 shadow-md'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-heading'>Edit Customer</h2>
          <button
            onClick={onClose}
            className='p-2 rounded hover:bg-gray-100 transition'
          >
            <img src={icons.closeIcon} alt='Close' className='w-4 h-4' />
          </button>
        </div>

        {error && (
          <div className='mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm font-medium'>
            {error}
          </div>
        )}

        {/* Form */}
        <div className='space-y-4'>
          {/* Name fields */}
          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='block text-sm text-gray-600 mb-1'>
                First Name
              </label>
              <input
                type='text'
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-sm text-gray-600 mb-1'>
                Last Name
              </label>
              <input
                type='text'
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
              />
            </div>
          </div>

          {/* Company name */}
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Company Name
            </label>
            <input
              type='text'
              value={formData.companyName || ''}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
            />
          </div>

          {/* Is Company */}
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.isCompany}
              onChange={(e) =>
                setFormData({ ...formData, isCompany: e.target.checked })
              }
              className='w-4 h-4'
            />
            <label className='text-sm text-gray-700'>
              Is this a company customer?
            </label>
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm text-gray-600 mb-1'>Email</label>
            <input
              type='text'
              value={formData.email?.[0] || ''}
              onChange={(e) =>
                setFormData({ ...formData, email: [e.target.value] })
              }
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
            />
          </div>
        </div>

        {/* Actions */}
        <div className='mt-6 flex justify-end space-x-3'>
          <ButtonIcon name='Cancel' handleBtnClick={onClose} />
          <CustomButton title='Save Changes' handleBtnClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default CustomerEditModal;
