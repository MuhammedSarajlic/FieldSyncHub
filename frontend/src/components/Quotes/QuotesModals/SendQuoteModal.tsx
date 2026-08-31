import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  FileText,
  Mail,
  Paperclip,
  Send,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { TCustomer } from '../../../types/Customer';
import { TQuote } from '../../../types/Quote';
import { TUser } from '../../../types/User';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import Modal from '../../CustomElements/Modal';

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

const fieldClass = 'h-10 w-full rounded-md border border-[#cbd5d0] bg-white px-3 text-sm text-[#17211d] outline-none placeholder:text-[#829088] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15';
const textareaClass = 'w-full resize-y rounded-md border border-[#cbd5d0] bg-white px-3 py-2.5 text-sm leading-6 text-[#17211d] outline-none placeholder:text-[#829088] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15';

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
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const companyName = user.workspace?.companyName || user.workspace?.name || 'your team';
  const customerName = getCustomerName(customer);
  const totalAttachmentSize = additionalFiles.reduce((total, file) => total + file.size, 0);
  const maxTotalSize = 10 * 1024 * 1024;
  const filteredEmails = customer.emails.filter(
    (email) => email.toLowerCase().includes(newRecipientInput.toLowerCase()) && !recipients.includes(email)
  );

  useEffect(() => {
    if (!isOpen) return;

    const defaultRecipient = customer.emails[0] || '';
    setRecipients(defaultRecipient ? [defaultRecipient] : []);
    setSubject(`Quote from ${companyName} - ${quote.title}`);
    setMessage(
      `Dear ${customerName},

Thank you for considering ${companyName} for your needs. We're pleased to provide you with a quote for your requested services.

Your quote total is ${formatCurrency(quote.total)}

This quote is valid for 30 days from the date of issue.

Should you have any questions or require any modifications, please don't hesitate to contact us directly at ${user.email}.

Best regards,
${user.firstName} ${user.lastName}
${companyName}`
    );
    setNewRecipientInput('');
    setAttachQuotePdf(true);
    setAdditionalFiles([]);
    setSendError(null);
    setSendSuccess(false);
  }, [isOpen, customer, quote, user, companyName, customerName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEmailDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addRecipient = () => {
    const email = newRecipientInput.trim();
    if (!email) return;

    if (!isValidEmail(email)) {
      setSendError('Please enter a valid email address.');
      return;
    }

    if (recipients.includes(email)) {
      setSendError('This email has already been added.');
      return;
    }

    setRecipients((current) => [...current, email]);
    setNewRecipientInput('');
    setSendError(null);
    setShowEmailDropdown(false);
  };

  const addSuggestedRecipient = (email: string) => {
    if (recipients.includes(email)) return;
    setRecipients((current) => [...current, email]);
    setNewRecipientInput('');
    setSendError(null);
    setShowEmailDropdown(false);
    inputRef.current?.focus();
  };

  const removeRecipient = (index: number) => {
    setRecipients((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleRecipientKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addRecipient();
    }
    if (event.key === 'Backspace' && !newRecipientInput && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newTotalSize = totalAttachmentSize + files.reduce((sum, file) => sum + file.size, 0);

    if (newTotalSize > maxTotalSize) {
      setSendError('Total attachment size exceeds 10MB. Remove a file before adding another.');
      return;
    }

    setAdditionalFiles((current) => [...current, ...files]);
    setSendError(null);
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setAdditionalFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async () => {
    if (recipients.length === 0) {
      setSendError('Add at least one recipient before sending.');
      return;
    }

    if (!recipients.every(isValidEmail)) {
      setSendError('Please ensure all email addresses are valid.');
      return;
    }

    if (!subject.trim()) {
      setSendError('Add a subject before sending.');
      return;
    }

    if (!message.trim()) {
      setSendError('Add a message before sending.');
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
        attachments: { quotePdf: attachQuotePdf, additionalFiles },
        quoteId: quote.id,
      });

      setSendSuccess(true);
      window.setTimeout(onClose, 1800);
    } catch (error) {
      console.error('Failed to send quote:', error);
      setSendError(error instanceof Error && error.message ? error.message : 'Failed to send quote. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title='Send quote'
      labelledBy='send-quote-dialog-label'
      className='flex h-[min(900px,calc(100vh-2rem))] max-w-[1180px] flex-col !overflow-hidden'
    >
      <header className='flex shrink-0 items-start justify-between border-b border-[#d9e0dc] bg-white px-5 py-4 sm:px-7'>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e8f1ed] text-[#0d5944]'>
            <Send className='h-5 w-5' />
          </span>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <h2 id='send-quote-dialog-label' className='text-xl font-semibold text-[#17211d]'>Send quote</h2>
              <span className='text-sm font-medium text-[#65736c]'>#{quote.quoteNumber}</span>
            </div>
            <p className='mt-1 truncate text-sm text-[#65736c]'>Prepare an email for {customerName} and include the estimate they will review.</p>
          </div>
        </div>
        <button type='button' onClick={onClose} aria-label='Close send quote' className='ml-4 rounded-md p-2 text-[#65736c] hover:bg-[#f0f3f1] hover:text-[#17211d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'>
          <X className='h-5 w-5' />
        </button>
      </header>

      <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }} className='flex min-h-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='grid min-h-full lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div className='min-w-0 px-5 py-6 sm:px-7 lg:pr-8'>
              <section aria-labelledby='send-recipient-heading'>
                <SectionHeading id='send-recipient-heading' icon={Mail} title='Recipients' description='Add everyone who should receive this estimate.' />
                <div className='relative mt-4' ref={dropdownRef}>
                  <span id='send-quote-recipient-label' className='mb-1.5 block text-sm font-semibold text-[#33423a]'>To</span>
                  <div className='flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-[#cbd5d0] bg-white px-2 py-1.5 focus-within:border-[#0d5944] focus-within:ring-2 focus-within:ring-[#0d5944]/15'>
                    {recipients.map((email, index) => (
                      <span key={email} className='inline-flex max-w-full items-center gap-1 rounded-md border border-[#b8d0c4] bg-[#edf5f1] py-1 pl-2 pr-1 text-xs font-semibold text-[#24533f]'>
                        <span className='max-w-[230px] truncate'>{email}</span>
                        <button type='button' onClick={(event) => { event.stopPropagation(); removeRecipient(index); }} aria-label={`Remove ${email}`} className='rounded p-0.5 text-[#527363] hover:bg-[#dceae3] hover:text-[#174d3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'>
                          <X className='h-3.5 w-3.5' />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={inputRef}
                      id='send-quote-recipient'
                      type='email'
                      value={newRecipientInput}
                      onChange={(event) => { setNewRecipientInput(event.target.value); setShowEmailDropdown(true); }}
                      onKeyDown={handleRecipientKeyDown}
                      onBlur={() => window.setTimeout(addRecipient, 120)}
                      onFocus={() => setShowEmailDropdown(newRecipientInput.length > 0 && filteredEmails.length > 0)}
                      className='min-w-[180px] flex-1 border-0 px-1 py-1 text-sm text-[#17211d] outline-none placeholder:text-[#829088]'
                      placeholder={recipients.length === 0 ? 'name@company.com' : 'Add another email'}
                      aria-labelledby='send-quote-recipient-label'
                      aria-describedby='send-recipient-hint'
                    />
                  </div>
                  {showEmailDropdown && filteredEmails.length > 0 && (
                    <div className='absolute left-0 top-[76px] z-30 w-full max-w-[420px] overflow-hidden rounded-md border border-[#cbd5d0] bg-white py-1 shadow-[0_10px_28px_rgba(23,33,29,0.16)]'>
                      <p className='px-3 py-2 text-xs font-semibold text-[#718078]'>Customer contacts</p>
                      {filteredEmails.map((email) => (
                        <button key={email} type='button' onMouseDown={(event) => event.preventDefault()} onClick={() => addSuggestedRecipient(email)} className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-[#33423a] hover:bg-[#f2f6f3]'>
                          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f1ed] text-[#0d5944]'><Mail className='h-3.5 w-3.5' /></span>
                          {email}
                        </button>
                      ))}
                    </div>
                  )}
                  <p id='send-recipient-hint' className='mt-1.5 text-xs text-[#718078]'>Press Enter or comma after each address.</p>
                </div>
              </section>

              <section aria-labelledby='send-message-heading' className='mt-8 border-t border-[#dfe5e1] pt-7'>
                <SectionHeading id='send-message-heading' icon={Mail} title='Email message' description='The quote total and PDF are ready to go. Adjust the note to sound like your team.' />
                <div className='mt-4 space-y-4'>
                  <Field label='Subject' htmlFor='send-quote-subject'>
                    <input id='send-quote-subject' aria-labelledby='send-quote-subject-label' type='text' value={subject} onChange={(event) => setSubject(event.target.value)} className={fieldClass} placeholder='Quote subject' />
                  </Field>
                  <Field label='Message' htmlFor='send-quote-message'>
                    <textarea id='send-quote-message' aria-labelledby='send-quote-message-label' value={message} onChange={(event) => setMessage(event.target.value)} rows={10} className={textareaClass} placeholder='Write a message for your customer...' />
                  </Field>
                </div>
              </section>

              <section aria-labelledby='send-attachments-heading' className='mt-8 border-t border-[#dfe5e1] pt-7'>
                <SectionHeading id='send-attachments-heading' icon={Paperclip} title='Attachments' description='Keep the official estimate attached, then add supporting files if needed.' />
                <div className='mt-4 space-y-3'>
                  <label htmlFor='send-quote-pdf' className='flex cursor-pointer items-center gap-3 rounded-md border border-[#b8d0c4] bg-[#edf5f1] px-3 py-3 hover:bg-[#e4f0ea]'>
                    <input id='send-quote-pdf' type='checkbox' checked={attachQuotePdf} onChange={(event) => setAttachQuotePdf(event.target.checked)} className='h-4 w-4 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' />
                    <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-[#0d5944]'><FileText className='h-4 w-4' /></span>
                    <span className='min-w-0 flex-1'><span className='block text-sm font-semibold text-[#24533f]'>Quote PDF</span><span className='block text-xs text-[#527363]'>Official estimate for {quote.quoteNumber}</span></span>
                    {attachQuotePdf && <Check className='h-4 w-4 shrink-0 text-[#0d5944]' />}
                  </label>

                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <input ref={fileInputRef} id='send-additional-files' type='file' multiple onChange={handleFileUpload} className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif' aria-label='Choose additional attachments' />
                    <button type='button' onClick={() => fileInputRef.current?.click()} className='inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md border border-[#cbd5d0] bg-white px-3 text-sm font-semibold text-[#34443c] hover:bg-[#f2f5f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'><Upload className='h-4 w-4' /> Add attachment</button>
                    <p className='text-xs text-[#718078]'>Up to 10MB total · {formatFileSize(totalAttachmentSize)} used</p>
                  </div>

                  {additionalFiles.length > 0 && (
                    <ul className='divide-y divide-[#dfe5e1] rounded-md border border-[#dfe5e1]'>
                      {additionalFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className='flex items-center gap-3 px-3 py-3'>
                          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f2f5f3] text-[#65736c]'><Paperclip className='h-4 w-4' /></span>
                          <span className='min-w-0 flex-1'><span className='block truncate text-sm font-semibold text-[#33423a]'>{file.name}</span><span className='block text-xs text-[#718078]'>{formatFileSize(file.size)}</span></span>
                          <button type='button' onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`} className='rounded-md p-1.5 text-[#718078] hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600'><Trash2 className='h-4 w-4' /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            <aside aria-label='Send summary' className='border-t border-[#d9e0dc] bg-[#f6f8f7] px-5 py-6 lg:border-l lg:border-t-0 lg:px-6'>
              <div className='lg:sticky lg:top-0'>
                <div className='flex items-start gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#0d5944]'><FileText className='h-5 w-5' /></span>
                  <div className='min-w-0'><h3 className='text-base font-semibold text-[#17211d]'>Send summary</h3><p className='mt-1 text-sm text-[#65736c]'>A quick check before this leaves your workspace.</p></div>
                </div>

                <dl className='mt-5 space-y-4 border-y border-[#d9e0dc] py-4 text-sm'>
                  <SummaryRow icon={UserRound} label='Customer' value={customerName} />
                  <SummaryRow icon={Mail} label='Recipients' value={`${recipients.length} ${recipients.length === 1 ? 'address' : 'addresses'}`} />
                  <SummaryRow icon={CalendarDays} label='Quote expiry' value={formatDate(quote.expiresAt)} />
                </dl>

                <div className='mt-5'>
                  <p className='text-xs font-semibold uppercase tracking-[0.08em] text-[#718078]'>Quote total</p>
                  <p className='mt-1 text-3xl font-semibold tabular-nums text-[#17211d]'>{formatCurrency(quote.total)}</p>
                  <p className='mt-1 text-sm text-[#65736c]'>#{quote.quoteNumber} · {quote.title}</p>
                </div>

                <div className='mt-6 border-t border-[#d9e0dc] pt-5'>
                  <p className='text-sm font-semibold text-[#33423a]'>Included in this email</p>
                  <ul className='mt-3 space-y-3 text-sm text-[#536159]'>
                    <ChecklistItem checked={attachQuotePdf}>{attachQuotePdf ? 'Official quote PDF' : 'Quote PDF not attached'}</ChecklistItem>
                    <ChecklistItem checked={additionalFiles.length > 0}>{additionalFiles.length > 0 ? `${additionalFiles.length} additional ${additionalFiles.length === 1 ? 'file' : 'files'}` : 'No additional files'}</ChecklistItem>
                    <ChecklistItem checked={Boolean(message.trim())}>Personal message</ChecklistItem>
                  </ul>
                </div>

                <div className='mt-6 flex items-start gap-2 rounded-md bg-[#e8f1ed] p-3 text-xs leading-5 text-[#28513f]'><CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' /><span>The customer will receive the message and any selected attachments at the same time.</span></div>
              </div>
            </aside>
          </div>
        </div>

        <footer className='shrink-0 border-t border-[#d9e0dc] bg-white px-5 py-3 sm:px-7'>
          {sendError && <div role='alert' className='mb-3 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800'><CircleAlert className='mt-0.5 h-4 w-4 shrink-0' /><span>{sendError}</span></div>}
          {sendSuccess && <div role='status' className='mb-3 flex items-start gap-2 rounded-md bg-[#e8f1ed] px-3 py-2 text-sm text-[#28513f]'><CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' /><span>Quote sent successfully. Closing this window...</span></div>}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs text-[#718078]'>Review the recipient list and attachments before sending.</p>
            <div className='flex gap-2'>
              <button type='button' onClick={onClose} disabled={isSending} className='h-10 flex-1 rounded-md border border-[#cbd5d0] bg-white px-4 text-sm font-semibold text-[#34443c] hover:bg-[#f2f5f3] disabled:opacity-50 sm:flex-none'>Cancel</button>
              <button type='submit' disabled={isSending || sendSuccess} className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0d5944] px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,89,68,0.18)] hover:bg-[#084936] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'><Send className='h-4 w-4' />{isSending ? 'Sending...' : 'Send quote'}</button>
            </div>
          </div>
        </footer>
      </form>
    </Modal>
  );
};

const SectionHeading = ({ id, icon: Icon, title, description }: { id: string; icon: typeof Mail; title: string; description: string }) => (
  <div className='flex items-start gap-3'>
    <Icon className='mt-0.5 h-4 w-4 shrink-0 text-[#456157]' />
    <div><h3 id={id} className='text-base font-semibold text-[#17211d]'>{title}</h3><p className='mt-1 text-sm leading-6 text-[#65736c]'>{description}</p></div>
  </div>
);

const Field = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) => (
  <div className='block text-sm font-semibold text-[#33423a]'><span id={`${htmlFor}-label`} className='mb-1.5 block'>{label}</span>{children}</div>
);

const SummaryRow = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) => (
  <div className='grid grid-cols-[18px_82px_minmax(0,1fr)] items-start gap-2'><Icon className='mt-0.5 h-4 w-4 text-[#456157]' /><dt className='text-[#718078]'>{label}</dt><dd className='truncate text-right font-medium text-[#33423a]' title={value}>{value}</dd></div>
);

const ChecklistItem = ({ checked, children }: { checked: boolean; children: string }) => (
  <li className='flex items-start gap-2'><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${checked ? 'bg-[#dceae3] text-[#0d5944]' : 'bg-[#e6ebe8] text-[#7a8780]'}`}>{checked ? <Check className='h-3 w-3' /> : <span className='h-1.5 w-1.5 rounded-full bg-current' />}</span><span>{children}</span></li>
);

const getCustomerName = (customer: TCustomer) => customer.isCompany && customer.companyName
  ? customer.companyName
  : customer.fullName || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || 'Unnamed customer';

const formatDate = (value?: string) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${parseFloat((bytes / Math.pow(1024, index)).toFixed(2))} ${units[index]}`;
};

export default SendQuoteModal;
