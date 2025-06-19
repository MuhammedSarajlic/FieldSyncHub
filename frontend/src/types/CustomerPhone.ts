import { PhoneType } from '../constants/Enumeration/CustomerEnum/CustomerPhone';

export type TCustomerPhone = {
  id: string;
  phoneType: PhoneType;
  phoneNumber: string;
  isReceiveMessage: boolean;
  customerId: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddCustomerPhone = {
  phoneType: PhoneType;
  phoneNumber: string;
  isReceiveMessage: boolean;
  customerId?: string;
};

export type TUpdateCustomerPhone = {
  id: string;
  phoneType?: PhoneType;
  phoneNumber?: string;
  isReceiveMessage?: boolean;
};
