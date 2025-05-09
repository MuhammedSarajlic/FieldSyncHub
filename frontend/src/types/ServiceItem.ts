export type TServiceItem = {
  serviceItemId: string;
  name: string;
  description: string;
  type: string;
  category: string;
  sku: string;
  unitPrice: number;
  cost: number;
  taxRate: number;
  isTaxable: boolean;
  isActive: boolean;
  imageUrl: string;
};

export type TAddServiceItem = {
  name: string;
  description: string;
  type: string;
  category: string;
  sku: string;
  unitPrice: number;
  cost: number;
  taxRate: number;
  isTaxable: boolean;
  isActive: boolean;
  imageUrl: string;
};

export type TServiceItemFilter = {
  category: string;
  price: { min: number | string; max: number | string };
  hours: { min: number | string; max: number | string };
  status: string;
  images: string;
  description: string;
};

export type TSortOption = {
  id: string;
  label: string;
  sortBy: string;
  sort: string;
};
