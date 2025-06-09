import { useState } from 'react';
import { TAddProperty } from '../../../types/Property';
import { TCustomer } from '../../../types/Customer';
import { X, Plus, Trash2, Mail, Phone, Home, Check } from 'lucide-react';
import { TAddCustomerPhone } from '../../../types/CustomerPhone';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { UpdateCustomer } from '../../../services/Customer';

interface ICustomerEditModal {
  customer: TCustomer;
  onClose: () => void;
  isOpen: boolean;
  fetchCustomer: () => void;
}

const emptyPhone = (): TAddCustomerPhone => ({
  phoneType: 'mobile',
  phoneNumber: '',
  isReceiveMessage: false,
});

const emptyProperty = (): TAddProperty => ({
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  isBillingAddress: false,
  customerId: '',
});

const CustomerEditModal = ({
  customer,
  onClose,
  isOpen,
  fetchCustomer,
}: ICustomerEditModal) => {
  const [form, setForm] = useState<TCustomer>({ ...customer });
  const [error, setError] = useState('');

  const setField = (k: keyof TCustomer, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim())
      return 'First name and last name are required.';
    if (form.isCompany && !form.companyName?.trim())
      return 'Company name is required for company customers.';
    return '';
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    console.log(form);
    const response = await UpdateCustomer(form);
    if (response.status !== 200) {
      setError('Failed to update customer. Please try again.');
      return;
    }
    console.log(response);

    setError('');
    fetchCustomer();
    onClose();
  };

  const updatePhone = (index: number, partial: Partial<TAddCustomerPhone>) => {
    setField(
      'customerPhones',
      form.customerPhones.map((p, i) =>
        i === index ? { ...p, ...partial } : p
      )
    );
  };

  const updateProp = (index: number, partial: Partial<TAddProperty>) => {
    setField(
      'properties',
      form.properties.map((p, i) => (i === index ? { ...p, ...partial } : p))
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4'>
      <div className='bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden'>
        {/* Header */}
        <div className='bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-heading'>Edit Customer</h2>
          <button
            onClick={() => {
              setError('');
              onClose();
              setForm({ ...customer });
            }}
            className='text-gray-500 hover:text-gray-700 transition-colors cursor-pointer'
            aria-label='Close'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {error && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4'>
            <div className='flex items-center'>
              <X className='h-5 w-5 text-red-500' />
              <p className='ml-3 text-sm text-red-700'>{error}</p>
            </div>
          </div>
        )}

        <div className='p-6 overflow-y-auto max-h-[calc(100vh-250px)] space-y-8'>
          {/* Basic Info Section */}
          <section>
            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
              {/* <Check className='h-5 w-5 text-blue-500' /> */}
              Basic Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  First Name*
                </label>
                <input
                  type='text'
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Last Name*
                </label>
                <input
                  type='text'
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Company Name
              </label>
              <input
                type='text'
                value={form.companyName || ''}
                onChange={(e) => setField('companyName', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='mt-4 flex items-center'>
              <input
                id='isCompany'
                type='checkbox'
                checked={form.isCompany}
                onChange={(e) => setField('isCompany', e.target.checked)}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='isCompany'
                className='ml-2 block text-sm text-gray-700'
              >
                Customer is a company
              </label>
            </div>
          </section>

          {/* Contact Info Section */}
          <section>
            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
              {/* <Mail className='h-5 w-5 text-blue-500' /> */}
              Emails
            </h3>
            <div className='space-y-3'>
              {form.email.map((e, idx) => (
                <div key={idx} className='flex items-center gap-3'>
                  <input
                    type='email'
                    value={e}
                    onChange={(ev) =>
                      setField('email', [
                        ...form.email.slice(0, idx),
                        ev.target.value,
                        ...form.email.slice(idx + 1),
                      ])
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  <button
                    onClick={() =>
                      setField(
                        'email',
                        form.email.filter((_, i) => i !== idx)
                      )
                    }
                    className='text-gray-500 hover:text-red-500 transition-colors'
                    aria-label='Remove email'
                  >
                    <Trash2 className='h-5 w-5' />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setField('email', [...form.email, ''])}
              className='mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-heading bg-bg-primary/10 hover:bg-bg-primary/20 cursor-pointer'
            >
              <Plus className='h-4 w-4 mr-1' />
              Add Email
            </button>
          </section>

          {/* Phone Numbers Section */}
          <section>
            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
              {/* <Phone className='h-5 w-5 text-blue-500' /> */}
              Phone Numbers
            </h3>
            <div className='space-y-4'>
              {form.customerPhones.map((ph, idx) => (
                <div
                  key={ph.id}
                  className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        Type
                      </label>
                      <select
                        value={ph.phoneType}
                        onChange={(e) =>
                          updatePhone(idx, { phoneType: e.target.value as any })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm'
                      >
                        {['Mobile', 'Work', 'Home', 'Other'].map((t) => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='md:col-span-2'>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        Number
                      </label>
                      <input
                        value={ph.phoneNumber}
                        onChange={(e) =>
                          updatePhone(idx, { phoneNumber: e.target.value })
                        }
                        placeholder='Phone number'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <input
                        id={`receive-sms-${ph.id}`}
                        type='checkbox'
                        checked={ph.isReceiveMessage}
                        onChange={(e) =>
                          updatePhone(idx, {
                            isReceiveMessage: e.target.checked,
                          })
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor={`receive-sms-${ph.id}`}
                        className='ml-2 block text-sm text-gray-700'
                      >
                        Receive SMS on this number
                      </label>
                    </div>
                    <button
                      onClick={() =>
                        setField(
                          'customerPhones',
                          form.customerPhones.filter((_, i) => i !== idx)
                        )
                      }
                      className='text-gray-500 hover:text-red-500 transition-colors'
                      aria-label='Remove phone'
                    >
                      <Trash2 className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setField('customerPhones', [
                  ...form.customerPhones,
                  emptyPhone(),
                ])
              }
              className='mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-heading bg-bg-primary/10 hover:bg-bg-primary/20 cursor-pointer'
            >
              <Plus className='h-4 w-4 mr-1' />
              Add Phone
            </button>
          </section>

          {/* Properties Section */}
          <section>
            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
              {/* <Home className='h-5 w-5 text-blue-500' /> */}
              Properties
            </h3>
            <div className='space-y-4'>
              {form.properties.map((pr, idx) => (
                <div
                  key={pr.id}
                  className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        Street
                      </label>
                      <input
                        value={pr.street}
                        onChange={(e) =>
                          updateProp(idx, { street: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        City
                      </label>
                      <input
                        value={pr.city}
                        onChange={(e) =>
                          updateProp(idx, { city: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        State
                      </label>
                      <input
                        value={pr.state}
                        onChange={(e) =>
                          updateProp(idx, { state: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        Country
                      </label>
                      <input
                        value={pr.country}
                        onChange={(e) =>
                          updateProp(idx, { country: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-500 mb-1'>
                        Postal Code
                      </label>
                      <input
                        value={pr.postalCode}
                        onChange={(e) =>
                          updateProp(idx, { postalCode: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                  </div>
                  <div className='flex items-center justify-between mt-4'>
                    <div className='flex items-center'>
                      <input
                        id={`billing-address-${pr.id}`}
                        type='checkbox'
                        checked={pr.isBillingAddress}
                        onChange={(e) =>
                          updateProp(idx, {
                            isBillingAddress: e.target.checked,
                          })
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor={`billing-address-${pr.id}`}
                        className='ml-2 block text-sm text-gray-700'
                      >
                        Billing address
                      </label>
                    </div>
                    <button
                      onClick={() =>
                        setField(
                          'properties',
                          form.properties.filter((_, i) => i !== idx)
                        )
                      }
                      className='text-gray-500 hover:text-red-500 transition-colors'
                      aria-label='Remove property'
                    >
                      <Trash2 className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setField('properties', [...form.properties, emptyProperty()])
              }
              className='mt-3 cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-heading bg-bg-primary/10 hover:bg-bg-primary/20'
            >
              <Plus className='h-4 w-4 mr-1' />
              Add Property
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className='bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3'>
          <ButtonIcon
            name='Cancel'
            handleBtnClick={() => {
              setError('');
              onClose();
              setForm({ ...customer });
            }}
            customStyle='bg-white'
          />
          <ButtonIcon
            name='Save Changes'
            customStyle='bg-bg-primary hover:bg-bg-primary-hover border-transparent'
            customTextStyle='text-white'
            handleBtnClick={handleSave}
          />
          {/* <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Save Changes
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CustomerEditModal;
