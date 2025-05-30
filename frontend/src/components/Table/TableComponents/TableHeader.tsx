import { TTableColumns } from '../../../types/Table';

interface ITableHeader {
  columns: TTableColumns;
  customStyle?: string;
}

const TableHeader = ({ columns, customStyle }: ITableHeader) => {
  return (
    <thead className={`bg-gray-50 ${customStyle}`}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.align === 'right'
                ? 'text-right'
                : column.align === 'center'
                ? 'text-center'
                : 'text-left'
            } ${column.customColumnStyle || ''}`}
            style={{ width: column.width }}
          >
            {typeof column === 'string' ? column : column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
