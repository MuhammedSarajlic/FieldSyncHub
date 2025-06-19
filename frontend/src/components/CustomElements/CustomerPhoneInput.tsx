import { PhoneType } from '../../constants/Enumeration/CustomerEnum/CustomerPhone';
import ModalInputField from './ModalInputField';

interface ICustomerPhoneInput {
  phoneType: PhoneType;
  phoneNumber: string;
  isReceiveMessage: boolean;
  onPhoneTypeChange: (value: PhoneType) => void;
  onPhoneChange: (value: string) => void;
  onReceiveMessageChange: (value: boolean) => void;
}

const CustomerPhoneInput = ({
  phoneType,
  phoneNumber,
  isReceiveMessage,
  onPhoneTypeChange,
  onPhoneChange,
  onReceiveMessageChange,
}: ICustomerPhoneInput) => {
  return (
    <div className='space-y-1.5'>
      <div className='flex h-10 items-center border-[1px] border-border-primary rounded-lg'>
        <select
          name='customer_phone_attributes'
          id='customer_phone_attributes'
          className='h-full px-2 text-sm min-w-[100px] outline-none text-heading border-r-[1px] border-border-primary'
          value={PhoneType[phoneType]}
          onChange={(e) =>
            onPhoneTypeChange(
              PhoneType[e.target.value as keyof typeof PhoneType]
            )
          }
        >
          {Object.keys(PhoneType)
            .filter((key) => isNaN(Number(key)))
            .map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
        </select>
        <ModalInputField
          inputType='text'
          placeholder='Phone number'
          customStyle='h-full border-transparent'
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>
      <div className='px-1 flex items-center space-x-2'>
        <input
          type='checkbox'
          className='w-3.5 h-3.5'
          checked={isReceiveMessage}
          onChange={(e) => onReceiveMessageChange(e.target.checked)}
        />
        <p className='text-sm text-primary'>Receives text messages</p>
      </div>
    </div>
  );
};

export default CustomerPhoneInput;
