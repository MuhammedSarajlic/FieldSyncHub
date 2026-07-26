// components/modals/EditPropertyModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TProperty, TUpdateProperty } from '../../../../../types/Property';
import { UpdateProperty } from '../../../../../services/Property';
import Button from '../../../../CustomElements/Button';

interface ICustomerEditPropertyModal {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  propertyToEdit: TProperty | null; // Full TProperty to pre-fill the form
}

const CustomerEditPropertyModal = ({
  isOpen,
  onClose,
  onUpdated,
  propertyToEdit,
}: ICustomerEditPropertyModal) => {
  const [formData, setFormData] = useState<TUpdateProperty>({
    id: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isBillingAddress: false,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for modal content to handle clicks outside

  // Populate form data when propertyToEdit changes or modal opens
  useEffect(() => {
    if (propertyToEdit && isOpen) {
      setFormData({
        id: propertyToEdit.id,
        street: propertyToEdit.street || '',
        city: propertyToEdit.city || '',
        state: propertyToEdit.state || '',
        country: propertyToEdit.country || '',
        postalCode: propertyToEdit.postalCode || '',
        isBillingAddress: propertyToEdit.isBillingAddress || false,
      });
      setFormErrors({}); // Clear errors when a new property is loaded
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        id: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isBillingAddress: false,
      });
      setFormErrors({}); // Clear errors on close
    }
  }, [propertyToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};

    if (!formData.street || formData.street.trim() === '') {
      newErrors.street = 'Street is required.';
      isValid = false;
    }
    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required.';
      isValid = false;
    }
    if (!formData.state || formData.state.trim() === '') {
      newErrors.state = 'State is required.';
      isValid = false;
    }
    if (!formData.country || formData.country.trim() === '') {
      newErrors.country = 'Country is required.';
      isValid = false;
    }
    if (!formData.postalCode || formData.postalCode.trim() === '') {
      newErrors.postalCode = 'Postal code is required.';
      isValid = false;
    }
    // Add more validation as needed (e.g., postal code format, etc.)

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Create the TUpdateProperty object, only including fields that have changed
      const updatedFields: TUpdateProperty = { id: formData.id };

      if (formData.street !== (propertyToEdit?.street || '')) {
        updatedFields.street = formData.street;
      }
      if (formData.city !== (propertyToEdit?.city || '')) {
        updatedFields.city = formData.city;
      }
      if (formData.state !== (propertyToEdit?.state || '')) {
        updatedFields.state = formData.state;
      }
      if (formData.country !== (propertyToEdit?.country || '')) {
        updatedFields.country = formData.country;
      }
      if (formData.postalCode !== (propertyToEdit?.postalCode || '')) {
        updatedFields.postalCode = formData.postalCode;
      }
      if (
        formData.isBillingAddress !==
        (propertyToEdit?.isBillingAddress || false)
      ) {
        updatedFields.isBillingAddress = formData.isBillingAddress;
      }

      setIsLoading(true);
      const result = await UpdateProperty(updatedFields);
      setIsLoading(false);
      if (result.status === 200) {
        onUpdated?.();
        onClose();
      }
    }
  };

  // Close modal when clicking outside of it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className='relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6'
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
      >
        <div className='flex justify-between items-center pb-4 border-b border-gray-200'>
          <h3 id='modal-title' className='text-xl font-semibold text-gray-900'>
            Edit Property
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            disabled={isLoading}
            aria-label='Close modal'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mt-4 space-y-4'>
          {/* Hidden ID field */}
          <input type='hidden' name='id' value={formData.id} />

          <div>
            <label
              htmlFor='street'
              className='block text-sm font-medium text-gray-700'
            >
              Street
            </label>
            <input
              type='text'
              name='street'
              id='street'
              value={formData.street}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.street ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2 focus:ring-bg-primary focus:border-bg-primary sm:text-sm`}
              disabled={isLoading}
            />
            {formErrors.street && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.street}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='city'
              className='block text-sm font-medium text-gray-700'
            >
              City
            </label>
            <input
              type='text'
              name='city'
              id='city'
              value={formData.city}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2 focus:ring-bg-primary focus:border-bg-primary sm:text-sm`}
              disabled={isLoading}
            />
            {formErrors.city && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.city}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='state'
              className='block text-sm font-medium text-gray-700'
            >
              State
            </label>
            <input
              type='text'
              name='state'
              id='state'
              value={formData.state}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.state ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2 focus:ring-bg-primary focus:border-bg-primary sm:text-sm`}
              disabled={isLoading}
            />
            {formErrors.state && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.state}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='country'
              className='block text-sm font-medium text-gray-700'
            >
              Country
            </label>
            <input
              type='text'
              name='country'
              id='country'
              value={formData.country}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.country ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2 focus:ring-bg-primary focus:border-bg-primary sm:text-sm`}
              disabled={isLoading}
            />
            {formErrors.country && (
              <p className='mt-1 text-sm text-red-600'>{formErrors.country}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='postalCode'
              className='block text-sm font-medium text-gray-700'
            >
              Postal Code
            </label>
            <input
              type='text'
              name='postalCode'
              id='postalCode'
              value={formData.postalCode}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2 focus:ring-bg-primary focus:border-bg-primary sm:text-sm`}
              disabled={isLoading}
            />
            {formErrors.postalCode && (
              <p className='mt-1 text-sm text-red-600'>
                {formErrors.postalCode}
              </p>
            )}
          </div>

          <div className='flex items-center'>
            <input
              id='isBillingAddress'
              name='isBillingAddress'
              type='checkbox'
              checked={formData.isBillingAddress}
              onChange={handleChange}
              className='h-4 w-4 text-bg-primary focus:ring-bg-primary border-gray-300 rounded'
              disabled={isLoading}
            />
            <label
              htmlFor='isBillingAddress'
              className='ml-2 block text-sm text-gray-900'
            >
              Is Billing Address?
            </label>
          </div>
        </div>

        <div className='mt-6 flex justify-end space-x-3'>
          <Button
            type='button'
            variant='secondary'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerEditPropertyModal;
