import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Upload } from 'lucide-react';
import { TCustomer } from '../../../types/Customer';
import { TQuote } from '../../../types/Quote';
import { TUser } from '../../../types/User';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';

interface ISendQuoteModal {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: {
    recipients: string[];
    subject: string;
    message: string;
    attachments: {
      quotePdf: boolean;
      additionalFiles: File[];
    };
    quoteId: string;
  }) => Promise<void>;
  customer: TCustomer;
  quote: TQuote;
  user: TUser;
}

const SendQuoteModal = ({
  isOpen,
  onClose,
  onSend,
  customer,
  quote,
  user,
}: ISendQuoteModal) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachQuotePdf, setAttachQuotePdf] = useState(true);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total attachment size
  const totalAttachmentSize = additionalFiles.reduce(
    (total, file) => total + file.size,
    0
  );
  const maxTotalSize = 10 * 1024 * 1024; // 10MB

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      const companyName = user.workspace?.companyName || user.workspace?.name;
      const defaultRecipient = customer.emails[0] || '';
      setRecipients(defaultRecipient ? [defaultRecipient] : []);
      setSubject(`Quote from ${companyName} - ${quote.title}`);
      setMessage(
        `Dear ${customer.fullName},

Thank you for considering ${companyName} for your needs. We're pleased to provide you with a quote for your requested services.

Your quote total is ${formatCurrency(quote.total)}

This quote is valid for 30 days from the date of issue. 

Should you have any questions or require any modifications, please don't hesitate to contact us directly at ${
          user.email
        }.

Best regards,
${user.firstName} ${user.lastName}
${companyName}`
      );
      setAttachQuotePdf(true);
      setAdditionalFiles([]);
      setSendError(null);
      setSendSuccess(false);
    }
  }, [isOpen, customer, quote, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowEmailDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter emails based on input
  const filteredEmails = customer.emails.filter(
    (email) =>
      email.toLowerCase().includes(newRecipientInput.toLowerCase()) &&
      !recipients.includes(email)
  );

  // Show dropdown only when typing and there are matching emails
  useEffect(() => {
    if (newRecipientInput.length > 0 && filteredEmails.length > 0) {
      setShowEmailDropdown(true);
    } else {
      setShowEmailDropdown(false);
    }
  }, [newRecipientInput, filteredEmails]);

  if (!isOpen) return null;

  const addRecipient = () => {
    const email = newRecipientInput.trim();
    if (!email) return;

    if (!isValidEmail(email)) {
      setSendError('Please enter a valid email address');
      return;
    }

    if (recipients.includes(email)) {
      setSendError('This email has already been added');
      return;
    }

    setRecipients([...recipients, email]);
    setNewRecipientInput('');
    setSendError(null);
    setShowEmailDropdown(false);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newTotalSize =
      totalAttachmentSize + files.reduce((sum, file) => sum + file.size, 0);

    if (newTotalSize > maxTotalSize) {
      setSendError(
        'Total attachment size exceeds 10MB limit. Please reduce file sizes.'
      );
      return;
    }

    setAdditionalFiles((prev) => [...prev, ...files]);
    setSendError(null);
  };

  const removeFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    // Validation
    if (recipients.length === 0) {
      setSendError('Please add at least one recipient.');
      return;
    }

    if (!recipients.every((email) => isValidEmail(email))) {
      setSendError('Please ensure all email addresses are valid.');
      return;
    }

    if (!subject.trim()) {
      setSendError('Please enter a subject.');
      return;
    }

    if (!message.trim()) {
      setSendError('Please enter a message.');
      return;
    }

    setSendError(null);
    setSendSuccess(false);
    setIsSending(true);

    try {
      await onSend({
        recipients,
        subject,
        message,
        attachments: {
          quotePdf: attachQuotePdf,
          additionalFiles,
        },
        quoteId: quote.id,
      });

      setSendSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send quote:', error);
      setSendError(
        error instanceof Error && error.message
          ? error.message
          : 'Failed to send quote. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h2 className='text-2xl font-bold text-[#1a2e35]'>Send Quote</h2>
          <CustomButton
            onClick={onClose}
            customStyle='hover:bg-gray-100 !p-2 !border-none'
          >
            <X size={20} />
          </CustomButton>
        </div>

        <div className='flex flex-col h-[calc(90vh-120px)]'>
          {/* Form Content */}
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {/* Recipients - Gmail style */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>To</label>
              <div
                className='min-h-[40px] mt-2 border border-gray-300 rounded-lg p-2 focus-within:ring-1 focus-within:ring-[#356852] focus-within:border-transparent'
                onClick={() => inputRef.current?.focus()}
              >
                <div className='flex flex-wrap gap-1 items-center'>
                  {recipients.map((email, index) => (
                    <div
                      key={index}
                      className='flex items-center bg-blue-50 rounded-full px-3 py-1 text-sm border border-blue-100'
                    >
                      <span className='text-blue-800'>{email}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecipient(index);
                        }}
                        className='cursor-pointer ml-2 text-blue-500 hover:text-blue-700'
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className='relative flex-1'>
                    <input
                      ref={inputRef}
                      type='text'
                      value={newRecipientInput}
                      onChange={(e) => setNewRecipientInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onBlur={addRecipient}
                      className='flex-1 min-w-[200px] outline-none bg-transparent text-sm text-[#1a2e35]'
                      placeholder={
                        recipients.length === 0 ? 'Enter email addresses' : ''
                      }
                    />
                    {showEmailDropdown && filteredEmails.length > 0 && (
                      <div
                        ref={dropdownRef}
                        className='absolute py-2 left-0 top-full mt-1 w-full max-w-[350px] max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl z-10'
                      >
                        {filteredEmails.map((email, index) => (
                          <div
                            key={index}
                            className='px-3 py-3 text-sm text-[#1a2e35] hover:bg-blue-50 cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!recipients.includes(email)) {
                                setRecipients([...recipients, email]);
                                setNewRecipientInput('');
                                setShowEmailDropdown(false);
                              }
                            }}
                          >
                            {email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className=''>
              <label className='text-sm font-medium text-gray-700'>
                Subject
              </label>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='w-full mt-2 px-3 py-2 text-[#1a2e35] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#356852] focus:border-transparent'
                placeholder='Enter subject...'
              />
            </div>

            {/* Message */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                className='w-full mt-2 px-3 py-2 text-[#1a2e35] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#356852] focus:border-transparent resize-none'
                placeholder='Enter your message...'
              />
            </div>

            {/* Attachments */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-gray-700'>Attachments</h3>

              {/* Quote PDF */}
              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                <input
                  type='checkbox'
                  id='quotePdf'
                  checked={attachQuotePdf}
                  onChange={(e) => setAttachQuotePdf(e.target.checked)}
                  className='h-4 w-4 text-[#356852] border-gray-300 rounded focus:ring-[#356852]'
                />
                <Paperclip size={16} className='text-gray-500' />
                <label htmlFor='quotePdf' className='text-sm text-gray-700'>
                  Attach Quote PDF
                </label>
              </div>

              {/* Additional Files */}
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <input
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                    className='hidden'
                    id='additional-files'
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif'
                  />
                  <label htmlFor='additional-files'>
                    <CustomButton
                      onClick={() =>
                        document.getElementById('additional-files')?.click()
                      }
                      customStyle='hover:bg-gray-100 flex items-center gap-2 px-4 py-2'
                    >
                      <Upload size={16} />
                      <span>Add attachment</span>
                    </CustomButton>
                  </label>
                </div>
                <p className='text-xs text-gray-500'>
                  Maximum total attachment size: 10MB (Current:{' '}
                  {formatFileSize(totalAttachmentSize)})
                </p>
              </div>

              {/* File List */}
              {additionalFiles.length > 0 && (
                <div className='space-y-2'>
                  {additionalFiles.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      <div className='w-8 h-8 bg-gray-200 rounded flex items-center justify-center'>
                        <Paperclip size={16} className='text-gray-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {file.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className='text-gray-400 hover:text-red-500 p-1 cursor-pointer'
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {sendError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-800'>{sendError}</p>
              </div>
            )}

            {sendSuccess && (
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <p className='text-sm text-green-800'>
                  Quote sent successfully!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 p-4'>
            <div className='flex justify-end gap-3'>
              <CustomButton
                onClick={onClose}
                customStyle='hover:bg-gray-100 px-4 py-2'
                disabled={isSending}
              >
                Discard
              </CustomButton>
              <CustomButton
                onClick={handleSubmit}
                customStyle='bg-[#356852] text-white border-[#356852] hover:bg-[#2d5943] disabled:opacity-50 px-4 py-2'
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;
