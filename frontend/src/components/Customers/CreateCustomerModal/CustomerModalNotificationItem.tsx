interface ICustomerModalNotificationItem {
  title: string;
  subtitle: string;
  labelId: string;
  value: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerModalNotificationItem = ({
  title,
  subtitle,
  labelId,
  value,
  onChange,
}: ICustomerModalNotificationItem) => {
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
            value ? 'bg-bg-primary' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              value ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></div>
        </label>
        <input
          type='checkbox'
          onChange={onChange}
          checked={value}
          id={labelId}
          className='hidden'
        />
      </div>
    </div>
  );
};

export default CustomerModalNotificationItem;
