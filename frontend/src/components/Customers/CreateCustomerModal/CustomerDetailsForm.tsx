import { TAddCustomer } from '../../../types/Customer';
import ModalInputField from '../../CustomElements/ModalInputField';

interface ICustomerDetailsForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
  errors: { [key: string]: string };
}

const CustomerDetailsForm = ({
  customer,
  setCustomer,
  errors,
}: ICustomerDetailsForm) => {
  return (
    <div className='space-y-2'>
      <p className='font-medium text-lg'>Customer details</p>
      <div className='space-y-2'>
        <div className='flex items-start space-x-3'>
          <ModalInputField
            inputType='text'
            placeholder='First name'
            label='First Name'
            value={customer.firstName}
            onChange={(e) =>
              setCustomer({ ...customer, firstName: e.target.value })
            }
            error={errors.firstName}
          />

          <ModalInputField
            inputType='text'
            placeholder='Last name'
            label='Last Name'
            value={customer.lastName}
            onChange={(e) =>
              setCustomer({ ...customer, lastName: e.target.value })
            }
            error={errors.lastName}
          />
        </div>
        <div className='space-y-2'>
          <ModalInputField
            inputType='text'
            placeholder='Company name'
            label='Company Name'
            value={customer.companyName}
            onChange={(e) =>
              setCustomer({ ...customer, companyName: e.target.value })
            }
            error={errors.companyName}
          />
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              className='w-4 h-4'
              checked={customer.isCompany}
              onChange={(e) =>
                setCustomer({ ...customer, isCompany: e.target.checked })
              }
            />
            <p className='text-sm text-primary'>
              Use company name as the primary name
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsForm;
