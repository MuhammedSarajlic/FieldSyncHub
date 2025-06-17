export type TCustomerPhone = {
  id: string;
  phoneType: string;
  phoneNumber: string;
  isReceiveMessage: boolean;
  customerId: string;
};

export type TAddCustomerPhone = {
  phoneType: string;
  phoneNumber: string;
  isReceiveMessage: boolean;
};
