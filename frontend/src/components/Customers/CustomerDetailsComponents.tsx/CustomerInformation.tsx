import CustomerDetailsContactInformationItem from './CustomerDetailsContactInformationItem';
import icons from '../../../constants/icons';
import { TCustomer } from '../../../types/Customer';

interface ICustomerInformation {
  customer: TCustomer;
}

const CustomerInformation = ({ customer }: ICustomerInformation) => {
  const phoneGroups: Record<string, string[]> = {
    Home: [],
    Work: [],
    Mobile: [],
    Other: [],
  };

  customer?.customerPhones?.forEach((phone) => {
    if (phoneGroups[phone.phoneType]) {
      phoneGroups[phone.phoneType].push(phone.phoneNumber);
    } else {
      phoneGroups.Other.push(phone.phoneNumber);
    }
  });

  const phoneTypeIcons: Record<string, string> = {
    Home: icons.homeIcon,
    Work: icons.workPhoneIcon,
    Mobile: icons.mobilePhoneIcon,
    Other: icons.phoneIcon,
  };

  return (
    <div className='space-y-4'>
      <p className='font-semibold text-xl'>Contact Information</p>

      {customer.customerPhones.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-sm text-primary font-medium'>Phone</p>
          <div className='px-1 space-y-3'>
            {Object.entries(phoneGroups).map(([type, numbers]) =>
              numbers.length > 0 ? (
                <CustomerDetailsContactInformationItem
                  key={type}
                  icon={phoneTypeIcons[type] || icons.phoneIcon}
                  informationValues={numbers}
                />
              ) : null
            )}
          </div>
        </div>
      )}

      {customer.email.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-sm text-primary font-medium'>Email</p>
          <div className='px-1 space-y-3'>
            <CustomerDetailsContactInformationItem
              icon={icons.mailIcon}
              informationValues={customer.email}
            />
          </div>
        </div>
      )}

      {customer.email.length === 0 && customer.customerPhones?.length === 0 && (
        <p className='text-primary'>No contact information</p>
      )}
    </div>
  );
};

export default CustomerInformation;
