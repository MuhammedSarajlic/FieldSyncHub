import { useState, ChangeEvent } from 'react';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import icons from '../../../constants/icons';
import ImportCustomersFileInput from './ImportCustomersFileInput';

interface IImportCustomersModal {
  setIsImportCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImportCustomersModal = ({
  setIsImportCustomerModalOpen,
}: IImportCustomersModal) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImportCustomers = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file.');
      return;
    }

    const missingHeaders = await getMissingHeaders(selectedFile);

    if (missingHeaders.length === 0) {
      setError('');
      console.log('CSV is valid!');
    } else {
      const missingText = missingHeaders.join(', ');
      setError(
        `Your CSV file wasn't uploaded. Missing a required header. At least one of the following headers must be present: ${missingText}. [Learn more](#)`
      );
      setSelectedFile(null);
    }
  };

  const getMissingHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0].trim();

        const headers = firstLine
          .split(',')
          .map((header) => header.replace(/"/g, '').trim().toLowerCase());

        const requiredHeaders = ['first name', 'last name', 'email'];

        const missing = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        const formattedMissing = missing.map((h) =>
          h
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')
        );

        resolve(formattedMissing);
      };

      reader.readAsText(file);
    });
  };

  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center'>
      <div className='py-6 bg-white rounded-lg w-2/5 flex flex-col'>
        <div className='px-6 pb-4 h-14 flex items-center justify-between'>
          <p className='text-xl font-bold text-heading'>
            Import customers by CSV
          </p>
          <div
            onClick={() => setIsImportCustomerModalOpen(false)}
            className='p-3 cursor-pointer bg-[#ececec] rounded-md hover:bg-[#dddddd] transition-colors duration-200'
          >
            <img src={icons.closeIcon} alt='close' className='w-3.5 h-3.5' />
          </div>
        </div>

        {error && (
          <div className='mx-6 mb-4 bg-[#fee8eb] p-4 text-[#8e0b21] text-sm space-y-1 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <img
                src={icons.exclamationIcon}
                alt='exclamation'
                className='w-4 h-4'
              />
              <p className='font-semibold'>Your CSV file wasn’t uploaded</p>
            </div>
            <div className='flex items-start pl-6 space-x-2'>
              <p>•</p>
              <p className=''>
                {`Missing a required headers. Following headers must be present: First Name, Last Name, Email. `}
                <a
                  href='#'
                  className='underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Learn more.
                </a>
              </p>
            </div>
          </div>
        )}

        <ImportCustomersFileInput
          handleFileChange={handleFileChange}
          selectedFile={selectedFile}
        />

        <div className='px-6 pt-4 space-x-3 flex items-center justify-end'>
          <ButtonIcon
            name='Cancel'
            handleBtnClick={() => setIsImportCustomerModalOpen(false)}
          />
          <ButtonIcon
            name='Import customers'
            handleBtnClick={handleImportCustomers}
            customStyle='border-transparent bg-bg-primary hover:bg-bg-primary-hover'
            customTextStyle='text-white'
            customImageStyle='w-5 h-5'
          />
        </div>
      </div>
    </div>
  );
};

export default ImportCustomersModal;
