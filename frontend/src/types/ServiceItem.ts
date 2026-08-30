import { ServiceItemType } from '../constants/Enumeration/ServiceItem/ServiceItem';

export type TServiceItem = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: ServiceItemType;
  category: string;
  sku: string;
  unitOfMeasure: string;
  stockLevel: number;
  reorderPoint: number;
  defaultDurationMinutes?: number;
  markupPercentage: number;
  vendor?: string;
  unitPrice: number;
  cost: number;
  taxRate?: number;
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
  type: ServiceItemType;
  category: string;
  sku?: string;
  unitOfMeasure: string;
  stockLevel?: number;
  reorderPoint?: number;
  defaultDurationMinutes?: number;
  markupPercentage?: number;
  vendor?: string;
  unitPrice: number;
  cost: number;
  taxRate?: number;
  isTaxable: boolean;
  isActive: boolean;
  imageUrl?: string;
};

export type TUpdateServiceItem = {
  id: string;
  name?: string;
  description?: string;
  type?: ServiceItemType;
  category?: string;
  sku?: string;
  unitOfMeasure?: string;
  stockLevel?: number;
  reorderPoint?: number;
  defaultDurationMinutes?: number;
  markupPercentage?: number;
  vendor?: string;
  unitPrice?: number;
  cost?: number;
  taxRate?: number;
  isTaxable?: boolean;
  isActive?: boolean;
  imageUrl?: string;
};

export type TImportServiceItem = {
  workspaceId: string;
  name?: string;
  description?: string;
  type?: ServiceItemType;
  category?: string;
  sku?: string;
  unitOfMeasure?: string;
  stockLevel?: number;
  reorderPoint?: number;
  defaultDurationMinutes?: number;
  markupPercentage?: number;
  vendor?: string;
  unitPrice?: number;
  cost?: number;
  taxRate?: number;
  isTaxable?: boolean;
  isActive?: boolean;
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

export type TServiceItemStats = {
  totalItems: number;
  totalMaterialItems: number;
  totalServiceItems: number;
  totalPricebookValue: number;
  averageItemPrice: number;

  totalItemsChange: string;
  materialItemsChange: string;
  serviceItemsChange: string;
  averageItemPriceChange: string;
};

export type TSortOption = {
  id: string;
  label: string;
  sortBy: string;
  sort: string;
};
