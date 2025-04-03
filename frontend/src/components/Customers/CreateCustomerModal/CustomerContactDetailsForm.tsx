import { useState } from 'react';
import CustomerPhoneInput from '../../CustomElements/CustomerPhoneInput';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import ModalInputField from '../../CustomElements/ModalInputField';
import { TAddCustomer } from '../../../types/Customer';

interface ICustomerContactDetailsForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const CustomerContactDetailsForm = ({
  customer,
  setCustomer,
}: ICustomerContactDetailsForm) => {
  const [phones, setPhones] = useState([
    { phoneType: 'Work', phoneNumber: '', isReceiveMessage: false },
  ]);
  const [emails, setEmails] = useState(['']);

  const addPhone = () => {
    setPhones([
      ...phones,
      { phoneType: 'Work', phoneNumber: '', isReceiveMessage: false },
    ]);
  };

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const updatePhone = (
    index: number,
    field: keyof (typeof phones)[0],
    value: string | boolean
  ) => {
    const updatedPhones = phones.map((phone, i) =>
      i === index ? { ...phone, [field]: value } : phone
    );
    setPhones(updatedPhones);
    setCustomer({ ...customer, customerPhones: updatedPhones });
  };

  const updateEmail = (index: number, value: string) => {
    const updatedEmails = emails.map((email, i) =>
      i === index ? value : email
    );
    setEmails(updatedEmails);
    setCustomer({ ...customer, email: updatedEmails });
  };

  return (
    <div>
      <p className='font-medium text-lg'>Contact details</p>
      <div className='mt-2 space-y-4'>
        <div className='space-y-4'>
          {phones.map((phone, index) => (
            <CustomerPhoneInput
              key={index}
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
