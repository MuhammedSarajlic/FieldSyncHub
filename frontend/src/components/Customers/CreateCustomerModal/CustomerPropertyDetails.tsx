import { useEffect, useState } from 'react';
import { TAddCustomer } from '../../../types/Customer';
import CountryDropdown from '../../CustomElements/CountryDropdown';
import ModalInputField from '../../CustomElements/ModalInputField';
import { TAddProperty } from '../../../types/Property';

interface ICustomerPropertyDetails {
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const CustomerPropertyDetails = ({ setCustomer }: ICustomerPropertyDetails) => {
  const [property, setProperty] = useState<TAddProperty>({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isBillingAddress: true,
  });

  const addPropertyToCustomer = () => {
    const isPropertyNotEmpty = Object.entries(property).some(
      ([key, value]) => key !== 'isBillingAddress' && value !== ''
    );

    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      properties: isPropertyNotEmpty ? [property] : [],
    }));
  };

  useEffect(() => {
    addPropertyToCustomer();
  }, [
    property.street,
    property.city,
    property.state,
    property.postalCode,
    property.country,
  ]);

  return (
    <div className='space-y-2'>
      <p className='font-medium text-lg'>Property details</p>
      <ModalInputField
        inputType='text'
        placeholder='Address'
        label='Address'
        value={property.street}
        onChange={(e) => setProperty({ ...property, street: e.target.value })}
      />
      <div className='flex items-center space-x-3'>
        <ModalInputField
          inputType='text'
          placeholder='City'
          label='City'
          value={property.city}
          onChange={(e) => setProperty({ ...property, city: e.target.value })}
        />
        <ModalInputField
          inputType='text'
          placeholder='State'
          label='State'
          value={property.state}
          onChange={(e) => setProperty({ ...property, state: e.target.value })}
        />
      </div>
      <div className='flex items-center space-x-3'>
        <ModalInputField
          inputType='text'
          placeholder='Zip code'
          label='Zip Code'
          value={property.postalCode}
          onChange={(e) =>
            setProperty({ ...property, postalCode: e.target.value })
          }
        />
        <CountryDropdown property={property} setProperty={setProperty} />
      </div>
      <div className='px-1 flex items-center space-x-2'>
        <input
          type='checkbox'
          className='w-4 h-4'
          checked={property.isBillingAddress}
          onChange={(e) =>
            setProperty({ ...property, isBillingAddress: e.target.checked })
          }
        />
        <p className='text-sm text-primary'>
          Billing address is the same as property address
        </p>
      </div>
    </div>
  );
};

export default CustomerPropertyDetails;
