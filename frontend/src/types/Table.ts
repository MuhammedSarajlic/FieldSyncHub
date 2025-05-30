import { ReactNode } from 'react';

interface BaseColumn {
  header: string;
  accessor: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  customColumnStyle?: string;
  cellClassName?: string;
}

interface StatusConfig {
  color: string;
  icon: ReactNode | null;
}

interface TextColumn extends BaseColumn {
  type: 'text';
  bold?: boolean;
}

interface CurrencyColumn extends BaseColumn {
  type: 'currency';
}

interface DateColumn extends BaseColumn {
  type: 'date';
}

interface StatusColumn extends BaseColumn {
  type: 'status';
  statusConfig?: (value: any) => StatusConfig;
}

interface ImageColumn extends BaseColumn {
  type: 'image';
  imageSize?: string;
}

interface UserColumn extends BaseColumn {
  type: 'user';
  imageSize?: string;
  imageAccessor: string;
  subtitle?: string;
}

interface BadgeColumn extends BaseColumn {
  type: 'badge';
  badgeColor?: (value: any) => string;
}

interface CustomColumn extends BaseColumn {
  type: 'custom';
  component?: (value: any, item: any, rowIndex: number) => ReactNode;
}

interface DefaultColumn extends BaseColumn {
  type?: 'default' | undefined;
}

interface ColumnWithRender extends BaseColumn {
  type?:
    | 'text'
    | 'currency'
    | 'date'
    | 'status'
    | 'image'
    | 'user'
    | 'badge'
    | 'custom'
    | 'default';
  render: (value: any, item: any, rowIndex: number) => ReactNode;
  bold?: boolean;
  statusConfig?: (value: any) => StatusConfig;
  imageSize?: string;
  imageAccessor?: string;
  subtitle?: string;
  badgeColor?: (value: any) => string;
  component?: (value: any, item: any, rowIndex: number) => ReactNode;
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
  | ColumnWithRender;

export type TTableColumns = TTableColumn[];
