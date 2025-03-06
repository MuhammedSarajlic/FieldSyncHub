import ModalInputField from '../../CustomElements/ModalInputField';

const CustomerDetailsForm = () => {
  return (
    <div className='space-y-2'>
      <p className='font-medium text-lg'>Customer details</p>
      <div className='space-y-2'>
        <div className='flex items-center space-x-3'>
          <ModalInputField
            inputType='text'
            placeholder='First name'
            label='First Name'
          />
          <ModalInputField
            inputType='text'
            placeholder='Last name'
            label='Last Name'
          />
        </div>
        <div className='space-y-2'>
          <ModalInputField
            inputType='text'
            placeholder='Company name'
            label='Company Name'
          />
          <div className='flex items-center space-x-2'>
            <input type='checkbox' className='w-4 h-4' />
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
