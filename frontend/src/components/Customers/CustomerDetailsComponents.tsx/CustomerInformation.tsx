import { TCustomer } from '../../../types/Customer';
import { PhoneType } from '../../../constants/Enumeration/CustomerEnum/CustomerPhone';
import { getPhoneIcon } from '../../../utils/FuntionHelpers/CustomerUtils/getPhoneIcon';

interface ICustomerInformation {
  customer: TCustomer;
}

const CustomerInformation = ({ customer }: ICustomerInformation) => {
  return (
    <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        Contact Information
      </h3>
      <div className='space-y-4'>
        {customer.emails && customer.emails.length > 0 ? (
          <div>
            <div className='flex items-center space-x-3 mb-1'>
              <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
              </div>
              <span className='text-gray-700 font-medium'>Email</span>
            </div>
            <div className='pl-12 space-y-1'>
              {customer.emails.map((email, index) => (
                <p key={index} className='text-gray-600 text-sm'>
                  {email}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className='text-gray-500 text-sm'>
            No contact information provided
          </p>
        )}

        {customer.customerPhones && customer.customerPhones.length > 0 && (
          <div>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                </svg>
              </div>
              <span className='text-gray-700 font-medium'>Phone</span>
            </div>
            <div className='pl-11 space-y-4'>
              {Object.entries(
                customer.customerPhones.reduce((acc, phone) => {
                  const type = PhoneType[phone.phoneType];
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(phone.phoneNumber);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([type, numbers]) => (
                <div key={type} className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mt-0.5'>
                    {getPhoneIcon(type)}
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>{type}</p>
                    <div className='space-y-1'>
                      {numbers.map((number, idx) => (
                        <p key={idx} className='text-gray-600 text-sm'>
                          {number}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInformation;
