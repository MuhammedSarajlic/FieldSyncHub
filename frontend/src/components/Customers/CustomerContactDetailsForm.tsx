import ModalInputField from '../CustomElements/ModalInputField';

const CustomerContactDetailsForm = () => {
  return (
    <div>
      <p className='font-medium text-lg'>Contact details</p>
      <div className='mt-2 space-y-4'>
        <div className='space-y-2'>
          <div className='flex h-10 items-center border-[1px] border-border-primary rounded-lg'>
            <select
              name='customer_phone_attributes'
              id='customer_phone_attributes'
              className='h-full px-2 text-sm min-w-[100px] outline-none text-heading border-r-[1px] border-border-primary'
            >
              <option value='Main'>Main</option>
              <option value='Work'>Work</option>
              <option value='Mobile'>Mobile</option>
              <option value='Home'>Home</option>
              <option value='Fax'>Fax</option>
              <option value='Other'>Other</option>
            </select>
            <ModalInputField
              inputType='text'
              placeholder='Phone number'
              customStyle='h-full border-transparent'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <input type='checkbox' className='w-4 h-4' />
            <p className='text-sm text-primary'>Receives text messages</p>
          </div>
          <button
            className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
          >
            <p className={`text-sm font-semibold text-text-secondary `}>
              Add Phone Number
            </p>
          </button>
        </div>
        <div className='space-y-2'>
          <div className='flex h-10 items-center border-[1px] border-border-primary rounded-lg'>
            <select
              name='customer_email_attributes'
              id='customer_email_attributes'
              className='h-full px-2 text-sm min-w-[100px] outline-none text-heading border-r-[1px] border-border-primary'
            >
              <option value='Main'>Main</option>
              <option value='Work'>Work</option>
              <option value='Mobile'>Personal</option>
              <option value='Other'>Other</option>
            </select>
            <ModalInputField
              inputType='email'
              placeholder='Email address'
              customStyle='h-full border-transparent'
            />
          </div>
          <button
            className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
          >
            <p className={`text-sm font-semibold text-text-secondary `}>
              Add Email Address
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerContactDetailsForm;
