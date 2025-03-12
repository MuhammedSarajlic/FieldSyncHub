import CustomerDetailsContactInformationItem from './CustomerDetailsContactInformationItem';
import icons from '../../../constants/icons';

const CustomerInformation = () => {
  return (
    <div className='space-y-4'>
      <p className='font-semibold text-xl'>Contact Information</p>
      <div className='space-y-1.5'>
        <p className='text-sm text-primary font-medium'>Phone</p>
        <div className='px-1 space-y-3'>
          <CustomerDetailsContactInformationItem
            icon={icons.homeIcon}
            informationValue='032-123-456'
          />
          <CustomerDetailsContactInformationItem
            icon={icons.workPhoneIcon}
            informationValue='032-321-654'
          />
          <CustomerDetailsContactInformationItem
            icon={icons.mobilePhoneIcon}
            informationValue='062-409-924'
          />
          <CustomerDetailsContactInformationItem
            icon={icons.phoneIcon}
            informationValue='061-214-635'
          />
        </div>
      </div>
      <div className='space-y-1.5'>
        <p className='text-sm text-primary font-medium'>Email</p>
        <div className='px-1 space-y-3'>
          <CustomerDetailsContactInformationItem
            icon={icons.mailIcon}
            informationValue='muhamed@inat.digital'
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInformation;
