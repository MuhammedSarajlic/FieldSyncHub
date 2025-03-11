interface ICustomerDetailsContactInformationItem {
  icon: string;
  informationValue: string;
}

const CustomerDetailsContactInformationItem = ({
  icon,
  informationValue,
}: ICustomerDetailsContactInformationItem) => {
  return (
    <div className='flex items-center space-x-3'>
      <div className=''>
        <img src={icon} alt='phone' className='w-5 h-5' />
      </div>
      <div>
        <p className='text-heading font-medium text-sm'>{informationValue}</p>
      </div>
    </div>
  );
};

export default CustomerDetailsContactInformationItem;
