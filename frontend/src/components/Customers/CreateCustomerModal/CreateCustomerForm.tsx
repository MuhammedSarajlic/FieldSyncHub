import AdditionalCustomerDetails from './AdditionalCustomerDetails';
import CustomerAutomatedNotificationsForm from './CustomerAutomatedNotificationsForm';
import CustomerContactDetailsForm from './CustomerContactDetailsForm';
import CustomerDetailsForm from './CustomerDetailsForm';
import CustomerPropertyDetails from './CustomerPropertyDetails';

const CreateCustomerForm = () => {
  return (
    <div className='px-6 py-2 h-full flex items-start justify-between overflow-y-auto space-x-8'>
      <div className='w-1/2 space-y-4'>
        <CustomerDetailsForm />
        <CustomerContactDetailsForm />
        <CustomerAutomatedNotificationsForm />
      </div>
      <div className='w-1/2 space-y-4'>
        <CustomerPropertyDetails />
        <AdditionalCustomerDetails />
      </div>
    </div>
  );
};

export default CreateCustomerForm;
