import CountryDropdown from '../../CustomElements/CountryDropdown';
import ModalInputField from '../../CustomElements/ModalInputField';

const CustomerPropertyDetails = () => {
  return (
    <div className='space-y-2'>
      <p className='font-medium text-lg'>Property details</p>
      <ModalInputField
        inputType='text'
        placeholder='Address line 1'
        label='Address Line 1'
      />
      <ModalInputField
        inputType='text'
        placeholder='Address line 2'
        label='Address Line 2'
      />
      <div className='flex items-center space-x-3'>
        <ModalInputField inputType='text' placeholder='City' label='City' />
        <ModalInputField inputType='text' placeholder='State' label='State' />
      </div>
      <div className='flex items-center space-x-3'>
        <ModalInputField
          inputType='text'
          placeholder='Zip code'
          label='Zip Code'
        />
        <CountryDropdown />
      </div>
    </div>
  );
};

export default CustomerPropertyDetails;
