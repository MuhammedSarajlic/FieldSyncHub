export type TCustomerPhone = {
  id: string;
  phoneType: string;
  phoneNumber: string;
  isReceiveMessage: string;
  customerId: string;
};

export type TAddCustomerPhone = {
  phoneType: 'mobile' | 'work' | 'home' | 'other';
  phoneNumber: string;
  isReceiveMessage: boolean;
};
