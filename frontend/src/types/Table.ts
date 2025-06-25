import { ReactNode } from 'react';

export interface BaseColumn<T = any> {
  header: string;
  accessor: keyof T | ((arg: T) => any);
  align?: 'left' | 'center' | 'right';
  width?: string;
  customColumnStyle?: string;
  cellClassName?: string;
}

export interface StatusConfig {
  label?: string;
  color: string;
  icon: ReactNode | null;
}

export interface TextColumn extends BaseColumn {
  type: 'text';
  bold?: boolean;
}

export interface CurrencyColumn extends BaseColumn {
  type: 'currency';
  bold?: boolean;
}

export interface DateColumn extends BaseColumn {
  type: 'date';
}

export interface StatusColumn extends BaseColumn {
  type: 'status';
  statusConfig?: (value: string | number) => StatusConfig;
  enumMap: Record<number, string>;
}

export interface PriorityColumn extends BaseColumn {
  type: 'priority';
  priorityConfig?: (value: string | number) => string; // This function will return just the color string
  enumMap: Record<number, string>; // To map numerical priority to string labels (e.g., 0 to "Low")
}

export interface ImageColumn extends BaseColumn {
  type: 'image';
  imageSize?: string;
}

export interface UserColumn extends BaseColumn {
  type: 'user';
  imageSize?: string;
  imageAccessor: string;
  subtitle?: string;
}

export interface BadgeColumn extends BaseColumn {
  type: 'badge';
  badgeColor?: (value: any) => string;
}

export interface CustomColumn extends BaseColumn {
  type: 'custom';
  component?: (value: any, item: any, rowIndex: number) => ReactNode;
}

export interface DefaultColumn extends BaseColumn {
  type?: 'default' | undefined;
}

export interface ColumnWithRender extends BaseColumn {
  type?:
    | 'text'
    | 'currency'
    | 'date'
    | 'status'
    | 'image'
    | 'user'
    | 'badge'
    | 'custom'
    | 'default'
    | 'priority';
  render: (value: any, item: any, rowIndex: number) => ReactNode;
  bold?: boolean;
  statusConfig?: (value: string | number) => StatusConfig;
  imageSize?: string;
  imageAccessor?: string;
  subtitle?: string;
  badgeColor?: (value: any) => string;
  component?: (value: any, item: any, rowIndex: number) => ReactNode;
  priorityConfig?: (value: string | number) => string;
  enumMap?: Record<number, string>;
}

export type TTableColumn =
  | TextColumn
  | CurrencyColumn
  | DateColumn
  | StatusColumn
  | ImageColumn
  | UserColumn
  | BadgeColumn
  | CustomColumn
  | DefaultColumn
  | PriorityColumn
  | ColumnWithRender;

export type TTableColumns = TTableColumn[];
