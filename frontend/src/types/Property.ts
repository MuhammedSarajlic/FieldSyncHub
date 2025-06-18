export type TProperty = {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  address: string;
  isBillingAddress: boolean;
  customerId: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddProperty = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isBillingAddress?: boolean;
  customerId: string;
};

export type TUpdateProperty = {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isBillingAddress?: boolean;
};
