import { TAddCustomer } from '../../../types/Customer';
import AdditionalCustomerDetails from './AdditionalCustomerDetails';
import CustomerAutomatedNotificationsForm from './CustomerAutomatedNotificationsForm';
import CustomerContactDetailsForm from './CustomerContactDetailsForm';
import CustomerDetailsForm from './CustomerDetailsForm';
import CustomerPropertyDetails from './CustomerPropertyDetails';

interface ICreateCustomerForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
  errors: { [key: string]: string };
}

const CreateCustomerForm = ({
  customer,
  setCustomer,
  errors,
}: ICreateCustomerForm) => {
  return (
    <div className='px-6 py-4 h-full flex items-start justify-between overflow-y-auto space-x-8'>
      <div className='w-1/2 space-y-6'>
        <CustomerDetailsForm
          customer={customer}
          setCustomer={setCustomer}
          errors={errors}
        />
        <CustomerContactDetailsForm
          customer={customer}
          setCustomer={setCustomer}
        />
        <CustomerAutomatedNotificationsForm
          customer={customer}
          setCustomer={setCustomer}
        />
      </div>
      <div className='border-r border-gray-200 h-full'></div>
      <div className='w-1/2 space-y-6'>
        <CustomerPropertyDetails setCustomer={setCustomer} />
        <AdditionalCustomerDetails
          customer={customer}
          setCustomer={setCustomer}
        />
      </div>
    </div>
  );
};

export default CreateCustomerForm;
