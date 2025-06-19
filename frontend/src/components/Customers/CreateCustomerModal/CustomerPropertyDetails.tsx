import { useEffect, useState } from 'react';
import { TAddCustomer } from '../../../types/Customer';
import CountryDropdown from '../../CustomElements/CountryDropdown';
import ModalInputField from '../../CustomElements/ModalInputField';
import { TAddProperty } from '../../../types/Property';

interface ICustomerPropertyDetails {
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
  customer: TAddCustomer;
}

const CustomerPropertyDetails = ({
  setCustomer,
  customer,
}: ICustomerPropertyDetails) => {
  const [property, setProperty] = useState<TAddProperty>({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isBillingAddress: true,
  });

  const addPropertyToCustomer = () => {
    const hasMainAddress = Object.values(property).some(
      (val, i) => val !== '' && i !== 5
    );

    const properties: TAddProperty[] = [];

    if (hasMainAddress) {
      properties.push(property);
    }

    setCustomer((prev) => ({
      ...prev,
      properties,
    }));
  };

  useEffect(() => {
    addPropertyToCustomer();

    if (property.isBillingAddress) {
      setCustomer((prev) => ({
        ...prev,
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingCountry: '',
        billingPostalCode: '',
      }));
    }
  }, [property]);

  return (
    <>
      <div className='space-y-2'>
        <p className='font-medium text-lg'>Property details</p>
        <ModalInputField
          inputType='text'
          placeholder='Street'
          label='Street'
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
            onChange={(e) =>
              setProperty({ ...property, state: e.target.value })
            }
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
          <CountryDropdown
            value={property.country || ''}
            onChange={(country) => setProperty({ ...property, country })}
          />
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

      {!property.isBillingAddress && (
        <div className='mt-4 space-y-2 pt-4'>
          <p className='font-medium text-lg'>Billing Address</p>
          <ModalInputField
            inputType='text'
            placeholder='Street'
            label='Street'
            value={customer.billingStreet || ''}
            onChange={(e) =>
              setCustomer({ ...customer, billingStreet: e.target.value })
            }
          />
          <div className='flex items-center space-x-3'>
            <ModalInputField
              inputType='text'
              placeholder='City'
              label='City'
              value={customer.billingCity || ''}
              onChange={(e) =>
                setCustomer({ ...customer, billingCity: e.target.value })
              }
            />
            <ModalInputField
              inputType='text'
              placeholder='State'
              label='State'
              value={customer.billingState || ''}
              onChange={(e) =>
                setCustomer({ ...customer, billingState: e.target.value })
              }
            />
          </div>
          <div className='flex items-center space-x-3'>
            <ModalInputField
              inputType='text'
              placeholder='Zip code'
              label='Zip Code'
              value={customer.billingPostalCode || ''}
              onChange={(e) =>
                setCustomer({ ...customer, billingPostalCode: e.target.value })
              }
            />
            <CountryDropdown
              value={customer.billingCountry || ''}
              onChange={(country) =>
                setCustomer({ ...customer, billingCountry: country })
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerPropertyDetails;
