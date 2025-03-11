import { useState } from 'react';

interface ICustomerModalNotificationItem {
  title: string;
  subtitle: string;
  labelId: string;
}

const CustomerModalNotificationItem = ({
  title,
  subtitle,
  labelId,
}: ICustomerModalNotificationItem) => {
  const [quote, setQuote] = useState<boolean>(true);
  return (
    <div className='flex items-center'>
      <div className='w-full'>
        <p className='text-heading font-semibold'>{title}</p>
        <p className='text-sm text-primary'>{subtitle}</p>
      </div>
      <div>
        <label
          htmlFor={labelId}
          className={`relative flex items-center w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
            quote ? 'bg-bg-primary' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              quote ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></div>
        </label>
        <input
          type='checkbox'
          onChange={(e) => setQuote(e.target.checked)}
          checked={quote}
          id={labelId}
          className='hidden'
        />
      </div>
    </div>
  );
};

export default CustomerModalNotificationItem;
