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

  const [billingProperty, setBillingProperty] = useState<TAddProperty>({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isBillingAddress: true,
  });

  const clearBillingProperty = () => {
    setBillingProperty({
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      isBillingAddress: true,
    });
  };

  const addPropertyToCustomer = () => {
    const propertyList: TAddProperty[] = [];

    const isMainPropertyNotEmpty = Object.entries(property).some(
      ([key, value]) => key !== 'isBillingAddress' && value !== ''
    );
    const isBillingPropertyNotEmpty = Object.entries(billingProperty).some(
      ([key, value]) => key !== 'isBillingAddress' && value !== ''
    );

    if (isMainPropertyNotEmpty)
      propertyList.push({
        ...property,
        isBillingAddress: property.isBillingAddress,
      });

    if (!property.isBillingAddress && isBillingPropertyNotEmpty)
      propertyList.push({ ...billingProperty, isBillingAddress: true });

    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      properties: propertyList,
    }));
  };

  // Watch for billing checkbox toggle to reset billing property if needed
  useEffect(() => {
    if (property.isBillingAddress) {
      clearBillingProperty();
    }
  }, [property.isBillingAddress]);

  useEffect(() => {
    addPropertyToCustomer();
  }, [
    property,
    billingProperty.street,
    billingProperty.city,
    billingProperty.state,
    billingProperty.postalCode,
    billingProperty.country,
  ]);

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

      {!property.isBillingAddress && (
        <div className='mt-4 space-y-2 pt-4'>
          <p className='font-medium text-lg'>Billing Address</p>
          <ModalInputField
            inputType='text'
            placeholder='Billing Address'
            label='Street'
            value={billingProperty.street}
            onChange={(e) =>
              setBillingProperty({ ...billingProperty, street: e.target.value })
            }
          />
          <div className='flex items-center space-x-3'>
            <ModalInputField
              inputType='text'
              placeholder='City'
              label='City'
              value={billingProperty.city}
              onChange={(e) =>
                setBillingProperty({ ...billingProperty, city: e.target.value })
              }
            />
            <ModalInputField
              inputType='text'
              placeholder='State'
              label='State'
              value={billingProperty.state}
              onChange={(e) =>
                setBillingProperty({
                  ...billingProperty,
                  state: e.target.value,
                })
              }
            />
          </div>
          <div className='flex items-center space-x-3'>
            <ModalInputField
              inputType='text'
              placeholder='Zip code'
              label='Zip Code'
              value={billingProperty.postalCode}
              onChange={(e) =>
                setBillingProperty({
                  ...billingProperty,
                  postalCode: e.target.value,
                })
              }
            />
            <CountryDropdown
              property={billingProperty}
              setProperty={setBillingProperty}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerPropertyDetails;
