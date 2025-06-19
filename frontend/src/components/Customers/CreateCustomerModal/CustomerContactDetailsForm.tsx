import { useState } from 'react';
import CustomerPhoneInput from '../../CustomElements/CustomerPhoneInput';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import ModalInputField from '../../CustomElements/ModalInputField';
import { TAddCustomer } from '../../../types/Customer';
import { PhoneType } from '../../../constants/Enumeration/CustomerEnum/CustomerPhone';
import { TAddCustomerPhone } from '../../../types/CustomerPhone';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface ICustomerContactDetailsForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const CustomerContactDetailsForm = ({
  customer,
  setCustomer,
}: ICustomerContactDetailsForm) => {
  const [phones, setPhones] = useState<TAddCustomerPhone[]>([
    {
      phoneType: PhoneType.Work,
      phoneNumber: '',
      isReceiveMessage: false,
    },
  ]);

  const [emails, setEmails] = useState<string[]>(['']);
  const [phoneErrors, setPhoneErrors] = useState<Record<number, string>>({});

  const addPhone = () => {
    setPhones([
      ...phones,
      {
        phoneType: PhoneType.Work,
        phoneNumber: '',
        isReceiveMessage: false,
      },
    ]);
  };

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const validatePhoneNumber = (number: string) => {
    const parsed = parsePhoneNumberFromString(number || '', 'BA');
    return parsed?.isValid() ?? false;
  };

  const updatePhone = (
    index: number,
    field: keyof TAddCustomerPhone,
    value: string | boolean | number
  ) => {
    const updatedPhones = phones.map((phone, i) =>
      i === index ? { ...phone, [field]: value } : phone
    );
    setPhones(updatedPhones);
    setCustomer({ ...customer, customerPhones: updatedPhones });

    if (field === 'phoneNumber') {
      const isValid = validatePhoneNumber(value as string);
      setPhoneErrors((prev) => ({
        ...prev,
        [index]: isValid ? '' : 'Invalid phone number',
      }));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const updatedEmails = emails.map((email, i) =>
      i === index ? value : email
    );
    setEmails(updatedEmails);
    setCustomer({ ...customer, emails: updatedEmails });
  };

  return (
    <div>
      <p className='font-medium text-lg'>Contact details</p>
      <div className='mt-2 space-y-4'>
        <div className='space-y-4'>
          {phones.map((phone, index) => (
            <div key={index}>
              <CustomerPhoneInput
                phoneType={phone.phoneType}
                phoneNumber={phone.phoneNumber}
                isReceiveMessage={phone.isReceiveMessage}
                onPhoneTypeChange={(value) =>
                  updatePhone(index, 'phoneType', value)
                }
                onPhoneChange={(value) =>
                  updatePhone(index, 'phoneNumber', value)
                }
                onReceiveMessageChange={(value) =>
                  updatePhone(index, 'isReceiveMessage', value)
                }
              />
              {phoneErrors[index] && (
                <p className='text-red-500 text-sm mt-1'>
                  {phoneErrors[index]}
                </p>
              )}
            </div>
          ))}
          <CustomSmallButton title='Add Phone Number' handleClick={addPhone} />
        </div>

        <div className='space-y-3'>
          {emails.map((email, index) => (
            <ModalInputField
              key={index}
              inputType='email'
              label='Email Address'
              placeholder='Email address'
              value={email}
              onChange={(e) => updateEmail(index, e.target.value)}
            />
          ))}
          <CustomSmallButton title='Add Email Address' handleClick={addEmail} />
        </div>
      </div>
    </div>
  );
};

export default CustomerContactDetailsForm;
