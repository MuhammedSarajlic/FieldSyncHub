import React from 'react';
import { TProperty } from '../../../../types/Property';
import { MapPin } from 'lucide-react';

interface ICustomerProperties {
  properties: TProperty[];
  setIsAddPropertyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerProperties = ({
  properties,
  setIsAddPropertyModalOpen,
}: ICustomerProperties) => {
  return (
    <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
          <MapPin className='w-5 h-5 text-gray-600' />
          Properties
        </h3>
        <button
          onClick={() => setIsAddPropertyModalOpen(true)}
          className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
        >
          + Add property
        </button>
      </div>
      {properties && properties.length > 0 ? (
        <div className='space-y-4'>
          {properties.map((property, index) => (
            <div
              key={index}
              className='p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-xs hover:shadow-sm'
            >
              <div className='flex items-center justify-between pb-2'>
                <h3 className='text-lg font-semibold text-gray-900 truncate max-w-[80%]'>
                  {property.street}
                </h3>
                {property.isBillingAddress && (
                  <div className='px-2.5 py-1 bg-blue-50 rounded-full flex items-center'>
                    <svg
                      className='w-3 h-3 text-blue-500 mr-1.5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-xs font-medium text-blue-700'>
                      Billing Address
                    </span>
                  </div>
                )}
              </div>

              <div className='space-y-1 text-sm text-gray-600'>
                <p className='flex items-start'>
                  <svg
                    className='w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  {property.street}
                </p>
                <p className='pl-6'>{`${property.city}, ${property.state} ${property.postalCode}`}</p>
                <p className='pl-6'>{property.country}</p>
              </div>

              <div className='mt-3 pt-3 border-t border-gray-100 flex space-x-3'>
                <button className='text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'>
                  View Details
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${property.street}, ${property.city}, ${property.state} ${property.postalCode}, ${property.country}`
                  )}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline'
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-8 text-center'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1'
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
          <p className='mt-2 text-sm text-gray-500'>
            No properties listed for this customer
          </p>
          <button
            onClick={() => setIsAddPropertyModalOpen(true)}
            className='mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
          >
            Add Property
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerProperties;
