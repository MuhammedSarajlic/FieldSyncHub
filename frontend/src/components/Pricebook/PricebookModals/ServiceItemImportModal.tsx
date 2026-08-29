// components/Modals/ServiceItemImportModal.tsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Upload,
  X,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Package,
  Calculator,
  FileImage,
  AlertCircle,
} from 'lucide-react';

// Define the TImportServiceItem type and ServiceItemType enum
export type TImportServiceItem = {
  name?: string;
  description?: string;
  type?: ServiceItemType;
  category?: string;
  sku?: string;
  unitPrice?: number;
  cost?: number;
  taxRate?: number;
  isTaxable?: boolean;
  isActive?: boolean;
  imageUrl?: string;
};

export enum ServiceItemType {
  Service = 0,
  Material = 1,
}

// Helper for currency and percentage formatting
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return `${value.toFixed(2)}%`;
};

// Define target columns outside the component to ensure stability
const targetColumns: {
  key: keyof TImportServiceItem;
  label: string;
  icon?: React.ElementType;
  required: boolean;
}[] = [
  { key: 'name', label: 'Name', icon: FileText, required: true },
  { key: 'description', label: 'Description', icon: FileText, required: false },
  { key: 'type', label: 'Type', icon: Package, required: true },
  { key: 'category', label: 'Category', icon: FileText, required: true },
  { key: 'sku', label: 'SKU', icon: Calculator, required: false },
  { key: 'unitPrice', label: 'Unit Price', icon: Calculator, required: true },
  { key: 'cost', label: 'Cost', icon: Calculator, required: true },
  { key: 'taxRate', label: 'Tax Rate', icon: Calculator, required: false },
  { key: 'isTaxable', label: 'Is Taxable', icon: Calculator, required: false },
  { key: 'isActive', label: 'Is Active', icon: Calculator, required: false },
  { key: 'imageUrl', label: 'Image URL', icon: FileImage, required: false },
];

interface IServiceItemImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceItemImportModal: React.FC<IServiceItemImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Preview & Edit
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawParsedData, setRawParsedData] = useState<any[]>([]); // To store original parsed data before mapping
  const [previewData, setPreviewData] = useState<TImportServiceItem[]>([]); // Data shown in the preview table
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  ); // Maps CSV header to TImportServiceItem key
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // Stores indices of selected rows
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State for the cell currently being edited (input mode)
  const [activeCell, setActiveCell] = useState<{
    rowIndex: number;
    columnKey: keyof TImportServiceItem;
  } | null>(null);

  // Ref for the actively editing input element container
  const activeCellContentRef = useRef<HTMLDivElement | null>(null);

  // States for the persistent hover preview in Step 2
  const [hoveredColumnData, setHoveredColumnData] = useState<string[] | null>(
    null
  );
  const [hoveredColumnName, setHoveredColumnName] = useState<string | null>(
    null
  );

  // Effect to handle click outside for the active input cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeCellContentRef.current &&
        !activeCellContentRef.current.contains(event.target as Node)
      ) {
        setActiveCell(null);
      }
    };

    if (activeCell) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCell]);

  // Effect to set default hover preview for the first column when entering Step 2
  useEffect(() => {
    if (
      step === 2 &&
      csvHeaders.length > 0 &&
      rawParsedData.length > 0 &&
      !hoveredColumnData
    ) {
      const firstHeader = csvHeaders[0];
      setHoveredColumnName(firstHeader);
      setHoveredColumnData(
        rawParsedData.map((row) => String(row[firstHeader] || ''))
      );
    }
  }, [step, csvHeaders, rawParsedData, hoveredColumnData]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    setCsvHeaders(headers);

    const dataRows = lines.slice(1);
    const parsed: any[] = dataRows.map((row) => {
      const values = row.split(',').map((v) => v.trim());
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });
    return parsed;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      setFile(uploadedFile);
      readAndParseFile(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      readAndParseFile(uploadedFile);
    }
  };

  const readAndParseFile = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const csvText = event.target.result as string;
        const parsed = parseCSV(csvText);
        setRawParsedData(parsed);

        const initialMapping: Record<string, string> = {};
        const usedTargetColumnsKeys = new Set<string>();

        csvHeaders.forEach((header) => {
          const lower = header.toLowerCase();
          const match = targetColumns.find(
            (col) => col.label.toLowerCase() === lower
          );
          if (match && !usedTargetColumnsKeys.has(match.key)) {
            initialMapping[header] = match.key;
            usedTargetColumnsKeys.add(match.key);
          }
        });

        setColumnMapping(initialMapping);
        setStep(2);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleMappingChange = (csvHeader: string, targetKey: string) => {
    setColumnMapping((prev) => {
      const newMapping = { ...prev };
      // If the targetKey was previously mapped by another CSV header, unmap it
      for (const [key, value] of Object.entries(newMapping)) {
        if (value === targetKey && key !== csvHeader) {
          newMapping[key] = ''; // Unmap the previous CSV header
        }
      }
      newMapping[csvHeader] = targetKey;
      return newMapping;
    });
  };

  const applyMapping = useCallback(() => {
    const mappedData: TImportServiceItem[] = rawParsedData.map((row) => {
      const newRow: Partial<TImportServiceItem> = {};

      targetColumns.forEach((targetCol) => {
        const csvHeader = Object.keys(columnMapping).find(
          (key) => columnMapping[key] === targetCol.key
        );

        if (csvHeader && row[csvHeader] !== undefined) {
          const originalValue = row[csvHeader];
          let processedValue: any = originalValue;

          // Type conversion
          if (['unitPrice', 'cost', 'taxRate'].includes(targetCol.key)) {
            processedValue = parseFloat(originalValue) || 0;
          } else if (['isTaxable', 'isActive'].includes(targetCol.key)) {
            processedValue = String(originalValue).toLowerCase() === 'true';
          } else if (targetCol.key === 'type') {
            const typeValue = String(originalValue).toLowerCase();
            if (typeValue === 'service') {
              processedValue = ServiceItemType.Service;
            } else if (typeValue === 'material') {
              processedValue = ServiceItemType.Material;
            } else {
              processedValue = undefined;
            }
          }
          (newRow as any)[targetCol.key] = processedValue;
        } else {
          (newRow as any)[targetCol.key] = undefined; // Ensure unmapped fields are undefined
        }
      });
      return newRow as TImportServiceItem;
    });

    setPreviewData(mappedData);
    setStep(3); // Move to preview step
  }, [rawParsedData, columnMapping]);

  const handleCellDoubleClick = (
    rowIndex: number,
    columnKey: keyof TImportServiceItem
  ) => {
    setActiveCell({ rowIndex, columnKey });
  };

  const handleCellEdit = (
    rowIndex: number,
    columnKey: keyof TImportServiceItem,
    value: string | number | boolean | undefined
  ) => {
    setPreviewData((prevData) =>
      prevData.map((row, rIdx) =>
        rIdx === rowIndex ? { ...row, [columnKey]: value } : row
      )
    );
  };

  const handleSelectRow = (index: number, isSelected: boolean) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(index);
      } else {
        newSelection.delete(index);
      }
      return newSelection;
    });
  };

  const handleSelectAllRows = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(new Set(previewData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleDeleteSelected = () => {
    const newPreviewData = previewData.filter(
      (_, index) => !selectedRows.has(index)
    );
    setPreviewData(newPreviewData);
    setSelectedRows(new Set());
    if (newPreviewData.length === 0) {
      setStep(1); // Go back to upload if all rows are deleted
      setFile(null);
      setCsvHeaders([]);
      setRawParsedData([]);
      setColumnMapping({});
      setHoveredColumnData(null); // Clear hover preview data
      setHoveredColumnName(null); // Clear hover preview name
    }
  };

  const handleDownloadSelected = () => {
    if (selectedRows.size === 0) return;

    const selectedItems = previewData.filter((_, index) =>
      selectedRows.has(index)
    );

    if (selectedItems.length === 0) return;

    const headerKeys = targetColumns.map((col) => col.key);

    const csvContent =
      headerKeys
        .map((key) => targetColumns.find((tc) => tc.key === key)?.label || key)
        .join(',') +
      '\n' +
      selectedItems
        .map((item) =>
          headerKeys
            .map((key) => {
              let value = (item as any)[key];
              if (key === 'type' && typeof value === 'number') {
                value = ServiceItemType[value];
              }
              if (typeof value === 'boolean') {
                return value ? 'TRUE' : 'FALSE';
              }
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value === undefined || value === null ? '' : String(value);
            })
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'selected_service_items.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleNextStep = () => {
    if (step === 1 && file) {
      setStep(2);
    } else if (step === 2) {
      applyMapping();
    } else if (step === 3) {
      onClose();
    }
  };

  const handleBackStep = () => {
    if (step === 3) {
      setStep(2);
      setPreviewData([]);
      setSelectedRows(new Set());
    } else if (step === 2) {
      setStep(1);
      setFile(null);
      setCsvHeaders([]);
      setRawParsedData([]);
      setColumnMapping({});
      setSelectedRows(new Set());
      setHoveredColumnData(null);
      setHoveredColumnName(null);
    }
  };

  const downloadTemplate = () => {
    const templateHeaders = targetColumns.map((col) => col.label).join(',');
    const blob = new Blob([templateHeaders], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'service_item_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const filteredHoverData = useMemo(() => {
    return hoveredColumnData ? hoveredColumnData.filter(Boolean) : []; // Filter out falsy values
  }, [hoveredColumnData]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className='p-6'>
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Upload File
                </h3>
                <button
                  onClick={downloadTemplate}
                  className='flex items-center space-x-2 text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors'
                >
                  <Download className='w-4 h-4' />
                  <span>Download Template</span>
                </button>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-[#356852] bg-[#f0fdf4]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />

                <div className='space-y-4'>
                  <div
                    className='mx-auto w-16 h-16 rounded-full flex items-center justify-center'
                    style={{ backgroundColor: '#356852' }}
                  >
                    <FileText className='w-8 h-8 text-white' />
                  </div>

                  <div>
                    <p className='text-lg font-medium text-gray-900 mb-2'>
                      Drop your file here, or{' '}
                      <span className='text-[#356852]'>browse</span>
                    </p>
                    <p className='text-sm text-gray-500'>Supports CSV files.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='flex'>
                <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0' />
                <div className='text-sm'>
                  <p className='font-medium text-blue-900 mb-1'>
                    File Format Requirements:
                  </p>
                  <ul className='text-blue-800 space-y-1 list-disc pl-5'>
                    <li>
                      Required fields: Name, Type, Category, Unit Price, Cost
                    </li>
                    <li>Service Type must be: SERVICE or MATERIAL</li>
                    <li>Prices should be in decimal format (e.g., 75.00)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className='flex flex-col md:flex-row flex-1 p-6 gap-6'>
            {/* Left Half: Column Mapping */}
            <div className='md:w-1/2 flex flex-col'>
              <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                Map Your Columns
              </h3>
              <p className='text-gray-600 mb-4 text-sm'>
                Match columns from your CSV file to the corresponding fields for
                Service Items.
              </p>
              <div className='flex-1 border border-gray-200 rounded-lg overflow-y-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50 sticky top-0'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Your CSV Header
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Maps to Service Item Field
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {csvHeaders.length > 0 ? (
                      csvHeaders.map((header, index) => (
                        <tr
                          key={index}
                          onMouseEnter={() => {
                            setHoveredColumnName(header);
                            setHoveredColumnData(
                              rawParsedData.map((row) =>
                                String(row[header] || '')
                              )
                            );
                          }}
                          onMouseLeave={() => {
                            // On mouse leave, do not clear, keep the last hovered item
                          }}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {header}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <select
                              className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#356852] focus:border-[#356852] sm:text-sm rounded-md'
                              value={columnMapping[header] || ''}
                              onChange={(e) =>
                                handleMappingChange(header, e.target.value)
                              }
                            >
                              <option value=''>Do Not Import</option>
                              {targetColumns.map((col) => (
                                <option
                                  key={col.key}
                                  value={col.key}
                                  disabled={
                                    Object.values(columnMapping).includes(
                                      col.key
                                    ) && columnMapping[header] !== col.key
                                  }
                                  className={
                                    Object.values(columnMapping).includes(
                                      col.key
                                    ) && columnMapping[header] !== col.key
                                      ? 'text-gray-400 bg-gray-100'
                                      : ''
                                  }
                                >
                                  {col.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className='px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No headers found in the uploaded CSV.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Half: Live Data Preview on Hover */}
            <div className='md:w-1/2 flex flex-col'>
              <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                Live Preview
              </h3>
              <p className='text-gray-600 mb-4 text-sm'>
                Preview of data for the selected or hovered column.
              </p>
              <div className='flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto'>
                {hoveredColumnData ? (
                  <>
                    <h4 className='font-semibold text-lg text-gray-800 mb-3'>
                      Preview for {hoveredColumnName}
                    </h4>
                    {filteredHoverData.length > 1 ? (
                      <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
                        {filteredHoverData.slice(0, 10).map((value, index) => (
                          <li key={index} className='truncate'>
                            {value}
                          </li>
                        ))}
                        {filteredHoverData.length > 10 && (
                          <li className='italic text-gray-500'>
                            ... {filteredHoverData.length - 10} more items
                          </li>
                        )}
                      </ul>
                    ) : filteredHoverData.length === 1 ? (
                      <p className='text-sm text-gray-700'>
                        {filteredHoverData[0]}
                      </p>
                    ) : (
                      <p className='italic text-gray-500 text-sm'>
                        No non-empty values found for this column.
                      </p>
                    )}
                  </>
                ) : (
                  <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                    <FileText className='w-10 h-10 mb-3' />
                    <p>Hover over a CSV header to see a preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className='p-6 flex-1 flex flex-col'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Preview & Edit Data
            </h3>
            <p className='text-gray-600 mb-4 text-sm'>
              Review the imported data. Double-click a cell to edit.
            </p>
            {selectedRows.size > 0 && (
              <div className='mb-4 flex gap-3'>
                <button
                  onClick={handleDeleteSelected}
                  className='px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center'
                >
                  <Trash2 className='w-4 h-4 mr-2' /> Delete Selected (
                  {selectedRows.size})
                </button>
                <button
                  onClick={handleDownloadSelected}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center'
                >
                  <Download className='w-4 h-4 mr-2' /> Download Selected (
                  {selectedRows.size})
                </button>
              </div>
            )}
            <div className='flex-1 border border-gray-200 rounded-lg overflow-auto'>
              <table className='min-w-full divide-y divide-gray-200 table-fixed'>
                <thead className='bg-gray-50 sticky top-0 z-10'>
                  <tr>
                    <th
                      scope='col'
                      className='w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <input
                        type='checkbox'
                        className='h-4 w-4 text-[#356852] border-gray-300 rounded'
                        checked={
                          selectedRows.size === previewData.length &&
                          previewData.length > 0
                        }
                        onChange={(e) => handleSelectAllRows(e.target.checked)}
                      />
                    </th>
                    {targetColumns.map((col) => (
                      <th
                        key={col.key}
                        scope='col'
                        className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap'
                        style={{ width: '120px' }}
                      >
                        {col.label}
                        {col.required && (
                          <span className='text-red-500 ml-1'>*</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {previewData.length > 0 ? (
                    previewData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          selectedRows.has(rowIndex) ? 'bg-blue-50' : ''
                        }
                      >
                        <td className='w-12 px-2 py-2 text-center'>
                          <input
                            type='checkbox'
                            className='h-4 w-4 text-[#356852] border-gray-300 rounded'
                            checked={selectedRows.has(rowIndex)}
                            onChange={(e) =>
                              handleSelectRow(rowIndex, e.target.checked)
                            }
                          />
                        </td>
                        {targetColumns.map((col) => {
                          const columnKey = col.key;
                          const value = (row as any)[columnKey];
                          const isActiveCell =
                            activeCell?.rowIndex === rowIndex &&
                            activeCell?.columnKey === columnKey;

                          let displayValue:
                            | string
                            | number
                            | boolean
                            | undefined = value;
                          if (
                            columnKey === 'type' &&
                            typeof value === 'number'
                          ) {
                            displayValue = ServiceItemType[value];
                          } else if (
                            columnKey === 'unitPrice' ||
                            columnKey === 'cost'
                          ) {
                            displayValue = formatCurrency(value as number);
                          } else if (columnKey === 'taxRate') {
                            displayValue = formatPercentage(value as number);
                          } else if (typeof value === 'boolean') {
                            displayValue = value ? 'True' : 'False';
                          }

                          const isEmptyAndRequired = !value && col.required;

                          return (
                            <td
                              key={columnKey}
                              className={`p-1 text-sm text-gray-800 border border-gray-200 relative whitespace-nowrap overflow-hidden ${
                                isEmptyAndRequired ? 'bg-red-50' : ''
                              }`}
                              style={{ width: '120px', height: '38px' }}
                              onDoubleClick={() =>
                                handleCellDoubleClick(rowIndex, columnKey)
                              }
                            >
                              {isActiveCell ? (
                                <div
                                  ref={activeCellContentRef}
                                  className='absolute top-0 left-0 bg-white p-2 rounded-md shadow-lg border border-blue-300 text-sm z-50 whitespace-normal'
                                  style={{
                                    minWidth: '120px',
                                    width: 'max-content',
                                    maxWidth: '400px',
                                  }}
                                >
                                  {columnKey === 'type' ? (
                                    <select
                                      value={
                                        value === 0
                                          ? 'SERVICE'
                                          : value === 1
                                          ? 'MATERIAL'
                                          : ''
                                      }
                                      onChange={(e) =>
                                        handleCellEdit(
                                          rowIndex,
                                          columnKey,
                                          e.target.value === 'SERVICE'
                                            ? ServiceItemType.Service
                                            : ServiceItemType.Material
                                        )
                                      }
                                      onBlur={() => setActiveCell(null)}
                                      className='w-full text-sm p-0.5 outline-none box-border'
                                      autoFocus
                                    >
                                      <option value=''>Select Type</option>
                                      <option value='SERVICE'>Service</option>
                                      <option value='MATERIAL'>Material</option>
                                    </select>
                                  ) : columnKey === 'isTaxable' ||
                                    columnKey === 'isActive' ? (
                                    <input
                                      type='checkbox'
                                      checked={
                                        typeof value === 'boolean'
                                          ? (value as boolean)
                                          : false
                                      }
                                      onChange={(e) =>
                                        handleCellEdit(
                                          rowIndex,
                                          columnKey,
                                          e.target.checked
                                        )
                                      }
                                      onBlur={() => setActiveCell(null)}
                                      className='h-4 w-4 text-[#356852] border-gray-300 rounded'
                                      autoFocus
                                    />
                                  ) : (
                                    <input
                                      type={
                                        [
                                          'unitPrice',
                                          'cost',
                                          'taxRate',
                                        ].includes(columnKey)
                                          ? 'number'
                                          : 'text'
                                      }
                                      value={
                                        [
                                          'unitPrice',
                                          'cost',
                                          'taxRate',
                                        ].includes(columnKey)
                                          ? (
                                              value as number | undefined
                                            )?.toFixed(2) || ''
                                          : String(value || '')
                                      }
                                      onChange={(e) => {
                                        let newValue:
                                          | string
                                          | number
                                          | undefined = e.target.value;
                                        if (
                                          [
                                            'unitPrice',
                                            'cost',
                                            'taxRate',
                                          ].includes(columnKey)
                                        ) {
                                          newValue =
                                            parseFloat(e.target.value) || 0;
                                        }
                                        handleCellEdit(
                                          rowIndex,
                                          columnKey,
                                          newValue
                                        );
                                      }}
                                      onBlur={() => setActiveCell(null)}
                                      className='w-full text-sm p-0.5 outline-none box-border'
                                      autoFocus
                                    />
                                  )}
                                </div>
                              ) : (
                                <div
                                  className='truncate w-full h-full flex items-center p-1'
                                  title={String(value || '')}
                                >
                                  {String(displayValue || '')}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={targetColumns.length + 1}
                        className='px-6 py-4 text-center text-sm text-gray-500'
                      >
                        No data available. Please upload a CSV file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 font-inter'>
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${
          step === 1 ? 'max-w-4xl' : 'max-w-none'
        } max-h-[95vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className='bg-white flex justify-between items-center px-8 py-6 border-b border-gray-200 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Import Service Items
            </h2>
            <p className='text-gray-600 text-sm mt-1'>
              Streamline your service item management by importing from a CSV
              file.
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
            aria-label='Close modal'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Main Content Area */}
        <div className='flex-1 overflow-y-auto'>{renderStepContent()}</div>

        {/* Actions */}
        <div className='flex justify-between items-center px-8 py-6 bg-white border-t border-gray-200 shadow-sm'>
          {step > 1 && (
            <button
              onClick={handleBackStep}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center'
            >
              <ChevronLeft className='w-4 h-4 mr-2' /> Back
            </button>
          )}
          {step === 1 && <div />}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              disabled={
                (step === 1 && !file) ||
                (step === 2 &&
                  !Object.values(columnMapping).some((val) => val !== '')) ||
                (step === 3 && previewData.length === 0)
              }
              className='px-6 py-2.5 text-sm font-medium text-white bg-[#356852] rounded-lg hover:bg-[#2d5a44] transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {step === 3 ? 'Import All Items' : 'Next'}{' '}
              <ChevronRight className='w-4 h-4 ml-2 inline-block' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceItemImportModal;
