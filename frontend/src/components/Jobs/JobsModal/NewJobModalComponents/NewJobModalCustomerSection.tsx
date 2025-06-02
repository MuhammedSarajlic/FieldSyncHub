import { useState } from 'react';
import { TCustomer } from '../../../../types/Customer';
import { TAddJob } from '../../../../types/Job';
import { TProperty } from '../../../../types/Property';
import { UserPlus } from 'lucide-react';

interface INewJobModalCustomerSection {
  customers: TCustomer[];
  setNewJob: React.Dispatch<React.SetStateAction<TAddJob>>;
  setIsNewCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCustomer: React.Dispatch<
    React.SetStateAction<TCustomer | undefined>
  >;
  setSelectedProperty: React.Dispatch<
    React.SetStateAction<TProperty | undefined>
  >;
  setActiveSection: React.Dispatch<
    React.SetStateAction<'details' | 'customer' | 'schedule' | 'team' | 'items'>
  >;
}

const NewJobModalCustomerSection = ({
  customers,
  setNewJob,
  setIsNewCustomerModalOpen,
  setSelectedCustomer,
  setSelectedProperty,
  setActiveSection,
}: INewJobModalCustomerSection) => {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Select Customer</h3>
        <p className='text-sm text-gray-500'>
          Search for an existing customer or add a new one
        </p>
      </div>

      <div className='relative'>
        <input
          type='text'
          placeholder='Search customers by name, phone, or email'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setIsNewCustomerModalOpen(true)}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center cursor-pointer'
        >
          <UserPlus className='h-4 w-4 mr-1' />
          New
        </button>
      </div>

      {customers.length > 0 ? (
        <div className='space-y-2 max-h-96 overflow-y-auto'>
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => {
                setNewJob((prev) => ({
                  ...prev,
                  customerId: customer.id,
                  propertyId: customer.properties[0]?.id,
                }));
                setSelectedCustomer(customer);
                setSelectedProperty(customer.properties[0]);
                setActiveSection('details');
              }}
              className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
            >
              <div className='flex justify-between'>
                <h4 className='font-medium'>
                  {customer.firstName} {customer.lastName}
                </h4>
                <span className='text-sm text-gray-500'>
                  {customer.customerPhones[0]?.phoneNumber}
                </span>
              </div>
              <p className='text-sm text-gray-500'>{customer.email[0]}</p>
              <div className='mt-2 text-xs text-gray-400'>
                {customer.properties.length}{' '}
                {customer.properties.length === 1 ? 'property' : 'properties'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          No customers found. Try a different search or create a new customer.
        </div>
      )}
    </div>
  );
};

export default NewJobModalCustomerSection;
