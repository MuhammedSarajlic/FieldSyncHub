import { useState, useEffect } from 'react';
import { Check, MapPin, X } from 'lucide-react';
import { TAddProperty, TProperty } from '../../../../../types/Property';
import CountryDropdown from '../../../../CustomElements/CountryDropdown';
import CustomButton from '../../../../CustomElements/CustomButton';

interface AddPropertyModalProps {
  existingProperties: TProperty[] | [];
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: TAddProperty) => Promise<void>;
}

const CustomerAddPropertyModal = ({
  existingProperties,
  isOpen,
  onClose,
  onSave,
}: AddPropertyModalProps) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    customerId: '',
    isBillingAddress: existingProperties.length === 0,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        customerId: '',
        isBillingAddress: existingProperties.length === 0,
      });
    }
  }, [isOpen, existingProperties.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-xl'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-bold text-heading flex items-center gap-2'>
              <MapPin className='w-5.5 h-5.5' />
              Add New Property
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 cursor-pointer'
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Street Address
                </label>
                <input
                  type='text'
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    City
                  </label>
                  <input
                    type='text'
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    State/Province
                  </label>
                  <input
                    type='text'
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Postal Code
                  </label>
                  <input
                    type='text'
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>
                {/* <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Country
                  </label>
                  <input
                    type='text'
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div> */}
                <CountryDropdown
                  value={formData.country}
                  onChange={(country) => setFormData({ ...formData, country })}
                />
              </div>

              {existingProperties.length === 0 && (
                <div className='flex items-center bg-blue-50 p-3 rounded-md'>
                  <Check className='w-5 h-5 text-blue-500 mr-2' />
                  <span className='text-sm text-blue-700'>
                    This will be set as the billing address (first property)
                  </span>
                </div>
              )}
            </div>

            <div className='mt-6 flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              >
                Cancel
              </button>
              <CustomButton title='Add property' />
              {/* <button
                type='submit'
                className='px-4 py-2 text-sm font-medium cursor-pointer text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Save Property
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerAddPropertyModal;
