import { TAddCustomer } from '../../../types/Customer';
import AdditionalCustomerDetails from './AdditionalCustomerDetails';
import CustomerAutomatedNotificationsForm from './CustomerAutomatedNotificationsForm';
import CustomerContactDetailsForm from './CustomerContactDetailsForm';
import CustomerDetailsForm from './CustomerDetailsForm';
import CustomerPropertyDetails from './CustomerPropertyDetails';

interface ICreateCustomerForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const CreateCustomerForm = ({ customer, setCustomer }: ICreateCustomerForm) => {
  return (
    <div className='px-6 py-2 h-full flex items-start justify-between overflow-y-auto space-x-8'>
      <div className='w-1/2 space-y-4'>
        <CustomerDetailsForm customer={customer} setCustomer={setCustomer} />
        <CustomerContactDetailsForm
          customer={customer}
          setCustomer={setCustomer}
        />
        <CustomerAutomatedNotificationsForm
          customer={customer}
          setCustomer={setCustomer}
        />
      </div>
      <div className='w-1/2 space-y-4'>
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
