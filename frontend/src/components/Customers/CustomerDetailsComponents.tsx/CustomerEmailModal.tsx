import { useState } from 'react';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { SendCustomerEmail } from '../../../services/Customer';

interface ICustomerEmailModal {
  isOpen: boolean;
  customerEmail: string;
  onClose: () => void;
  // onSend: (emailData: {
  //   to: string;
  //   subject: string;
  //   message: string;
  //   attachments?: File[];
  // }) => void;
}

const CustomerEmailModal = ({
  isOpen,
  customerEmail,
  onClose,
}: // onSend,
ICustomerEmailModal) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  // const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.');
      return;
    }

    const response = await SendCustomerEmail(customerEmail, subject, message);
    if (response.status !== 200) {
      setError('Failed to send email. Please try again later.');
      return;
    }
    setError('');
    // onSend({ to: customerEmail, subject, message });
    onClose();
    setSubject('');
    setMessage('');
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     setAttachments([...attachments, ...Array.from(e.target.files)]);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
      <div className='bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Send Email</h2>
          <button
            onClick={onClose}
            className='py-1.5 px-3 rounded-full hover:bg-gray-100 transition cursor-pointer'
          >
            <span className='text-gray-500 text-xl'>&times;</span>
          </button>
        </div>

        {error && (
          <div className='mb-3 text-red-600 text-sm font-medium bg-red-50 p-2 rounded'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {/* To */}
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              To
            </label>
            <input
              type='text'
              value={customerEmail}
              disabled
              className='w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm'
            />
          </div>

          {/* Subject */}
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Subject
            </label>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
              placeholder='Subject of the email'
            />
          </div>

          {/* Message */}
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
              placeholder='Write your message here...'
            />
          </div>

          {/* Attachments (optional UI only) */}
          {/* <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Attach Files
            </label>
            <input
              type='file'
              multiple
              onChange={handleFileChange}
              className='block w-full text-sm text-gray-700'
            />
            {attachments.length > 0 && (
              <ul className='mt-2 text-sm text-gray-600 list-disc pl-4'>
                {attachments.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div> */}
        </div>

        {/* Buttons */}
        <div className='flex justify-end mt-6 space-x-3'>
          <ButtonIcon name='Cancel' handleBtnClick={onClose} />
          <ButtonIcon
            name='Send Email'
            customStyle='bg-bg-primary hover:bg-bg-primary-hover border-transparent'
            customTextStyle='text-white'
            handleBtnClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerEmailModal;
