interface ICustomerDetailsContactInformationItem {
  icon: string;
  informationValues: string[];
}

const CustomerDetailsContactInformationItem = ({
  icon,
  informationValues,
}: ICustomerDetailsContactInformationItem) => {
  return (
    <div className='flex items-start space-x-3'>
      <div>
        <img src={icon} alt='icon' className='w-5 h-5' />
      </div>
      <div className='space-y-1.5'>
        {informationValues.map((value, index) => (
          <p key={index} className='text-heading font-medium text-sm'>
            {value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CustomerDetailsContactInformationItem;
