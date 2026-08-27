import { useState, ChangeEvent } from 'react';
import Papa from 'papaparse';
import ImportCustomersFileInput from './ImportCustomersFileInput';
import { ImportCustomers } from '../../../services/Customer';
import { useAuth } from '../../../context/AuthProvider';
import { transformToImportCustomers } from '../../../utils/FuntionHelpers/transformToImportCustomers';

interface IImportCustomersModal {
  setIsImportCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ParsedCustomerRow {
  rowNumber: number;
  data: Record<string, string>;
  hasErrors?: boolean;
  errors?: string[];
}

interface HeaderMapping {
  csvHeader: string;
  mappedTo: string;
}

const normalizeHeader = (header: string) =>
  header
    .replace(/"/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ');

const formatHeader = (key: string) =>
  key
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const CUSTOMER_FIELDS = [
  { key: 'first name', required: true },
  { key: 'last name', required: true },
  { key: 'company name', required: false },
  { key: 'is company', required: false },
  { key: 'email', required: false },
  { key: 'visit reminders', required: false },
  { key: 'job follow ups', required: false },
  { key: 'quote follow ups', required: false },
  { key: 'invoice follow ups', required: false },
  { key: 'archived', required: false },
  { key: 'tags', required: false },
  { key: 'created at', required: false },
];

const ImportCustomersModal = ({
  setIsImportCustomerModalOpen,
}: IImportCustomersModal) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedCustomerRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [headerMappings, setHeaderMappings] = useState<HeaderMapping[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'upload' | 'mapping' | 'preview'
  >('upload');
  const [importProgress, setImportProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      parseCSV(file);
    } else {
      // Handle file removal
      setSelectedFile(null);
      setCurrentStep('upload');
      setCsvHeaders([]);
      setHeaderMappings([]);
      setPreviewData([]);
      setError('');
    }
  };

  const parseCSV = (file: File) => {
    setIsLoading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        setIsLoading(false);

        if (!result.meta.fields || result.meta.fields.length === 0) {
          setError('The CSV file contains no data or headers.');
          setSelectedFile(null);
          return;
        }

        const headers = result.meta.fields.map(normalizeHeader);
        setCsvHeaders(headers);

        // Initialize mappings with better matching
        const initialMappings: HeaderMapping[] = headers.map((csvHeader) => {
          const matchedField = CUSTOMER_FIELDS.find(
            (field) => normalizeHeader(field.key) === normalizeHeader(csvHeader)
          );
          return {
            csvHeader,
            mappedTo: matchedField ? matchedField.key : '',
          };
        });

        setHeaderMappings(initialMappings);
        setCurrentStep('mapping');
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error parsing CSV: ${error.message}`);
        setSelectedFile(null);
      },
    });
  };

  const handleMappingChange = (index: number, value: string) => {
    const newMappings = [...headerMappings];
    newMappings[index].mappedTo = value;
    setHeaderMappings(newMappings);
    setError(''); // Clear errors when user makes changes
  };

  const validateMappings = () => {
    const requiredFields = CUSTOMER_FIELDS.filter((f) => f.required).map(
      (f) => f.key
    );
    const mappedFields = headerMappings
      .filter((m) => m.mappedTo)
      .map((m) => m.mappedTo);

    // Check for required fields
    const missingFields = requiredFields.filter(
      (required) => !mappedFields.includes(required)
    );

    if (missingFields.length > 0) {
      setError(
        `Required fields missing: ${missingFields
          .map((f) => formatHeader(f))
          .join(', ')}`
      );
      return false;
    }

    // Check for duplicate mappings
    const duplicates = mappedFields.filter(
      (field, index) => mappedFields.indexOf(field) !== index
    );

    if (duplicates.length > 0) {
      setError(
        `Duplicate field mappings detected: ${duplicates
          .map((f) => formatHeader(f))
          .join(', ')}`
      );
      return false;
    }

    return true;
  };

  const validateRowData = (
    data: Record<string, string>
  ): { hasErrors: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!data['first name']?.trim()) {
      errors.push('First Name is required');
    }
    if (!data['last name']?.trim()) {
      errors.push('Last Name is required');
    }

    // Basic email validation if email is provided
    if (
      data['email'] &&
      data['email'].trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['email'].trim())
    ) {
      errors.push('Invalid email format');
    }

    return {
      hasErrors: errors.length > 0,
      errors,
    };
  };

  const proceedToPreview = () => {
    if (!validateMappings()) return;
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: ParsedCustomerRow[] = (result.data as any[]).map(
          (row, i) => {
            const mappedData: Record<string, string> = {};

            headerMappings.forEach((mapping) => {
              if (mapping.mappedTo) {
                const originalHeader = result.meta.fields?.find(
                  (f) => normalizeHeader(f) === mapping.csvHeader
                );
                if (originalHeader) {
                  mappedData[mapping.mappedTo] =
                    row[originalHeader]?.toString().trim() || '';
                }
              }
            });

            const validation = validateRowData(mappedData);

            return {
              rowNumber: i + 2,
              data: mappedData,
              hasErrors: validation.hasErrors,
              errors: validation.errors,
            };
          }
        );

        setPreviewData(parsed);
        setCurrentStep('preview');
        setIsLoading(false);
      },
    });
  };

  const handleImportCustomers = async () => {
    if (!user) return;
    setIsLoading(true);
    setImportProgress(0);

    try {
      // Filter out rows with errors
      const customersToSend = transformToImportCustomers(previewData);
      const validRows = previewData.filter((row) => !row.hasErrors);

      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(
        'Importing customers:',
        validRows.map((r) => r.data)
      );
      const response = await ImportCustomers(customersToSend);
      if (response.status === 200) {
        // Success - close modal
        setIsImportCustomerModalOpen(false);
      }
      console.log(response);
    } catch (error) {
      setError('Failed to import customers. Please try again.');
    } finally {
      setIsLoading(false);
      setImportProgress(0);
    }
  };

  const goBackToMapping = () => {
    setCurrentStep('mapping');
    setError('');
  };

  const goBackToUpload = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setCsvHeaders([]);
    setHeaderMappings([]);
    setPreviewData([]);
    setError('');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload CSV File';
      case 'mapping':
        return 'Map Columns';
      case 'preview':
        return 'Review & Import';
      default:
        return 'Import Customers';
    }
  };

  const validRows = previewData.filter((row) => !row.hasErrors);
  const errorRows = previewData.filter((row) => row.hasErrors);

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='px-6 pb-4 pt-6 border-b border-gray-200'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-heading'>
                Import Customers from CSV
              </h2>
              <p className='text-sm text-gray-500 mt-1'>{getStepTitle()}</p>
            </div>
            <button
              onClick={() => setIsImportCustomerModalOpen(false)}
              className='text-gray-400 hover:text-gray-500 p-1 cursor-pointer'
              disabled={isLoading}
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className='mt-4'>
            <div className='flex items-center space-x-4'>
              {['upload', 'mapping', 'preview'].map((step, index) => (
                <div key={step} className='flex items-center'>
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      currentStep === step ||
                      (['mapping', 'preview'].includes(currentStep) &&
                        step === 'upload') ||
                      (currentStep === 'preview' && step === 'mapping')
                        ? 'bg-bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`
                      w-12 h-0.5 mx-2
                      ${
                        (['mapping', 'preview'].includes(currentStep) &&
                          index === 0) ||
                        (currentStep === 'preview' && index === 1)
                          ? 'bg-bg-primary'
                          : 'bg-gray-200'
                      }
                    `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mx-6 mt-4 bg-red-50 border border-red-200 p-4 rounded-md'>
            <div className='flex'>
              <svg
                className='h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <p className='mt-1 text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='flex-1 overflow-auto p-6'>
          {currentStep === 'upload' && (
            <ImportCustomersFileInput
              handleFileChange={handleFileChange}
              selectedFile={selectedFile}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'mapping' && (
            <div className='space-y-6'>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-medium text-gray-900 mb-2'>
                  Instructions
                </h4>
                <p className='text-sm text-gray-600'>
                  Map your CSV columns to the appropriate customer fields.
                  Required fields must be mapped to proceed.
                </p>
              </div>

              <div className='overflow-hidden border border-gray-200 rounded-lg'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        CSV Column
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Maps To
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {headerMappings.map((mapping, index) => (
                      <tr key={mapping.csvHeader} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='text-sm font-medium text-gray-900'>
                            {formatHeader(mapping.csvHeader)}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <select
                            value={mapping.mappedTo}
                            onChange={(e) =>
                              handleMappingChange(index, e.target.value)
                            }
                            className='block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary'
                          >
                            <option value=''>-- Skip this column --</option>
                            {CUSTOMER_FIELDS.map((field) => {
                              const isUsed = headerMappings.some(
                                (m, i) =>
                                  i !== index && m.mappedTo === field.key
                              );
                              return (
                                <option
                                  key={field.key}
                                  value={field.key}
                                  disabled={isUsed}
                                >
                                  {formatHeader(field.key)}
                                  {field.required && ' *'}
                                  {isUsed && ' (Already mapped)'}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className='space-y-6'>
              {/* Summary */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-blue-900'>
                    {previewData.length}
                  </div>
                  <div className='text-sm text-blue-700'>Total Records</div>
                </div>
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-green-900'>
                    {validRows.length}
                  </div>
                  <div className='text-sm text-green-700'>Valid Records</div>
                </div>
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-red-900'>
                    {errorRows.length}
                  </div>
                  <div className='text-sm text-red-700'>
                    Records with Errors
                  </div>
                </div>
              </div>

              {/* Error Summary */}
              {errorRows.length > 0 && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <h4 className='text-sm font-medium text-yellow-800 mb-2'>
                    ⚠️ {errorRows.length} records have errors and will be
                    skipped
                  </h4>
                  <p className='text-sm text-yellow-700'>
                    Only valid records will be imported. Review the preview
                    below to see which records have issues.
                  </p>
                </div>
              )}

              {/* Preview Table */}
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <div className='overflow-auto max-h-96'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50 sticky top-0'>
                      <tr>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Row
                        </th>
                        {headerMappings
                          .filter((m) => m.mappedTo)
                          .map((mapping) => (
                            <th
                              key={mapping.mappedTo}
                              className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            >
                              {formatHeader(mapping.mappedTo)}
                              {CUSTOMER_FIELDS.find(
                                (f) => f.key === mapping.mappedTo
                              )?.required && ' *'}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {previewData.slice(0, 20).map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-gray-50 ${
                            row.hasErrors ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className='px-4 py-3 whitespace-nowrap'>
                            {row.hasErrors ? (
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                Error
                              </span>
                            ) : (
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                Valid
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                            {row.rowNumber}
                            {row.hasErrors && row.errors && (
                              <div className='text-xs text-red-600 mt-1'>
                                {row.errors.join(', ')}
                              </div>
                            )}
                          </td>
                          {headerMappings
                            .filter((m) => m.mappedTo)
                            .map((mapping) => (
                              <td
                                key={mapping.mappedTo}
                                className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'
                              >
                                {row.data[mapping.mappedTo] || '-'}
                              </td>
                            ))}
                        </tr>
                      ))}
                      {previewData.length > 20 && (
                        <tr>
                          <td
                            colSpan={
                              headerMappings.filter((m) => m.mappedTo).length +
                              2
                            }
                            className='px-4 py-3 text-center text-sm text-gray-500'
                          >
                            Showing first 20 of {previewData.length} rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Progress */}
              {isLoading && importProgress > 0 && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-blue-900'>
                      Importing customers...
                    </span>
                    <span className='text-sm text-blue-700'>
                      {importProgress}%
                    </span>
                  </div>
                  <div className='w-full bg-blue-200 rounded-full h-2'>
                    <div
                      className='bg-bg-primary h-2 rounded-full transition-all duration-300'
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <div className='flex space-x-3'>
              {currentStep === 'mapping' && (
                <button
                  type='button'
                  onClick={goBackToUpload}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 cursor-pointer border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary disabled:opacity-50'
                >
                  ← Back
                </button>
              )}
              {currentStep === 'preview' && (
                <button
                  type='button'
                  onClick={goBackToMapping}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 cursor-pointer border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary disabled:opacity-50'
                >
                  ← Back to Mapping
                </button>
              )}
            </div>

            <div className='flex items-center space-x-3'>
              <button
                type='button'
                onClick={() => setIsImportCustomerModalOpen(false)}
                disabled={isLoading}
                className='inline-flex items-center px-4 py-2 border border-gray-300 cursor-pointer shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary disabled:opacity-50'
              >
                Cancel
              </button>

              {currentStep === 'mapping' && (
                <button
                  type='button'
                  onClick={proceedToPreview}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium cursor-pointer rounded-md shadow-sm text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary disabled:opacity-50'
                >
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Preview Import'
                  )}
                </button>
              )}

              {currentStep === 'preview' && validRows.length > 0 && (
                <button
                  type='button'
                  onClick={handleImportCustomers}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent cursor-pointer text-sm font-medium rounded-md shadow-sm text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
                >
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    `Import ${validRows.length} Customer${
                      validRows.length !== 1 ? 's' : ''
                    }`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCustomersModal;
