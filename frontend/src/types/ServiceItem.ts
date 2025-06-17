export type TServiceItemType = 'Service' | 'Product';

export type TServiceItem = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: TServiceItemType;
  category: string;
  sku: string;
  unitPrice: number;
  cost: number;
  taxRate: number;
  isTaxable: boolean;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddServiceItem = {
  workspaceId: string;
  name: string;
  description?: string;
  type: TServiceItemType;
  category: string;
  sku: string;
  unitPrice: number;
  cost: number;
  taxRate: number;
  isTaxable: boolean;
  isActive: boolean;
  imageUrl?: string;
};

export type TServiceItemFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  hasImage?: boolean;
  description?: string;
};

export type TSortOption = {
  id: string;
  label: string;
  sortBy: string;
  sort: string;
};
