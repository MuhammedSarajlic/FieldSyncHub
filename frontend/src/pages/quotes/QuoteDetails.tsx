import { useEffect, useState } from 'react';
import {
  Archive, ArrowLeft, Briefcase, CalendarDays, Check, ChevronDown, Copy,
  Download, Edit3, Eye, FileText, HardHat, Mail, MapPin, MoreHorizontal,
  Phone, Plus, Printer, Send, Trash2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DateTime } from 'luxon';
import { Link, useNavigate, useParams } from 'react-router';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import QuoteAttachments from '../../components/Quotes/QuoteAttachments/QuoteAttachments';
import QuoteNote from '../../components/Quotes/QuoteNotes/QuoteNote';
import ActionConfirmationModal from '../../components/Quotes/QuotesModals/ActionConfirmationModal';
import ConvertQuoteToJobModal from '../../components/Quotes/QuotesModals/ConvertQuoteToJobModal';
import DuplicateQuoteModal from '../../components/Quotes/QuotesModals/DuplicateQuoteModal';
import EditQuoteModal from '../../components/Quotes/QuotesModals/EditQuoteModal';
import SendQuoteModal from '../../components/Quotes/QuotesModals/SendQuoteModal';
import { QuoteActivityType, QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { useAuth } from '../../context/AuthProvider';
import { useClickOutside } from '../../hooks/useClickOutside';
import {
  AddQuoteCustomerNote, AddQuoteInternalNote, ArchiveQuote, ChangeQuoteStatus,
  DeleteQuote, GetQuoteById, GetQuotePdf, SendQuote,
} from '../../services/Quote';
import { TAddNote, TNote } from '../../types/Note';
import { TQuote, TQuoteAttachment } from '../../types/Quote';
import { downloadPdfFile, openPdfAndPrint, openPdfInNewTab } from '../../utils/FuntionHelpers/downloadPdfFile';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';
import { getQuoteActivityStyle } from '../../utils/FuntionHelpers/QuoteUtils/getQuoteActivityStyle';

/*
THESIS: The quote is the work surface; the page refuses a dashboard stack of unrelated cards.
OWN-WORLD: Cool paper, register-white sheets, evergreen actions, ruled ledgers, and compact status marks.
STORY: Confirm document state, reconcile the estimate, understand customer context, then send or advance the work.
FIRST VIEWPORT: Identity and actions lead into a four-part lifecycle register above the quote ledger and context rail.
FORM: A contractor quote folder extended from The Working Register; one responsive document, no decorative dashboard chrome.
*/

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    resolve(result.slice(result.indexOf(',') + 1));
  };
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

const QuoteDetails = () => {
  const { user } = useAuth();
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const moreRef = useClickOutside<HTMLDivElement>(() => setIsMoreOpen(false));
  const [quote, setQuote] = useState<TQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [openNote, setOpenNote] = useState<'internal' | 'customer' | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    GetQuoteById(quoteId)
      .then((response) => { if (active && response.status === 200) setQuote(response.data); })
      .catch(() => { if (active) setLoadError('This quote could not be loaded. It may have been removed or you may not have access.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [quoteId]);

  const handleNewAttachmentAdded = (attachment: TQuoteAttachment) => {
    setQuote((current) => current ? { ...current, attachments: [...(current.attachments ?? []), attachment] } : current);
  };

  const handleAddNote = async (type: 'internal' | 'customer') => {
    if (!user || !quote?.customer) return;
    const noteText = type === 'internal' ? internalNote.trim() : customerNote.trim();
    if (!noteText) return;
    const note: TAddNote = { createdBy: user.id, createdByName: user.fullName, noteText };
    setSavingNote(true);
    try {
      const response = type === 'internal' ? await AddQuoteInternalNote(quote.id, note) : await AddQuoteCustomerNote(quote.id, note);
      if (response.status === 200) {
        const created: TNote = response.data;
        setQuote((current) => current ? {
          ...current,
          [type === 'internal' ? 'internalNotes' : 'customerNotes']: [
            ...(type === 'internal' ? current.internalNotes : current.customerNotes), created,
          ],
        } : current);
        if (type === 'internal') setInternalNote('');
        else setCustomerNote('');
        setOpenNote(null);
      }
    } catch {
      toast.error('The note could not be saved');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async () => {
    const response = await DeleteQuote(quoteId as string);
    if (response.status === 204) navigate('/quotes');
  };

  const handleArchive = async () => {
    try {
      const response = await ArchiveQuote(quoteId as string);
      if (response.status === 200) { toast.success('Quote archived'); navigate('/quotes'); }
    } catch { toast.error('Could not archive this quote'); }
  };

  const handleStatus = async (status: QuoteStatus) => {
    setIsMoreOpen(false);
    try {
      const response = await ChangeQuoteStatus(quoteId as string, status);
      setQuote((current) => current ? { ...current, status: response.data.status, activityHistory: response.data.activityHistory } : current);
      toast.success(`Quote marked as ${getQuoteStatusLabel(status)}`);
    } catch { toast.error('Could not update the quote status'); }
  };

  const handleSend = async (data: {
    recipients: string[];
    subject: string;
    message: string;
    attachments: { quotePdf: boolean; additionalFiles: File[] };
    quoteId: string;
  }) => {
    const attachments = await Promise.all(data.attachments.additionalFiles.map(async (file) => ({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      content: await fileToBase64(file),
    })));
    try {
      const response = await SendQuote(data.quoteId, {
        recipients: data.recipients, subject: data.subject, message: data.message,
        attachPdf: data.attachments.quotePdf, attachments,
      });
      const updated = response.data.payload;
      setQuote((current) => current ? { ...current, status: updated.status, sentAt: updated.sentAt, activityHistory: updated.activityHistory } : current);
    } catch (error) {
      const axiosError = error as { response?: { data?: { errorMessage?: string } } };
      throw new Error(axiosError.response?.data?.errorMessage ?? 'Could not send the quote. Please try again.');
    }
  };

  const getPdf = async (action: 'preview' | 'download' | 'print') => {
    setIsMoreOpen(false);
    if (!quoteId) return;
    try {
      const response = await GetQuotePdf(quoteId);
      if (action === 'preview') openPdfInNewTab(response.data);
      if (action === 'download') downloadPdfFile(response.data, `Quote-${quote?.quoteNumber}`);
      if (action === 'print') openPdfAndPrint(response.data);
    } catch { toast.error(`Could not ${action} the quote PDF`); }
  };

  if (loading) return <QuoteDetailsLoading />;
  if (!quote || loadError) return <QuoteUnavailable message={loadError} />;

  const status = getQuoteStatus(quote.status);
  const customerName = getCustomerName(quote);
  const expiry = getExpiryPresentation(quote);

  return (
    <div className='flex min-h-screen bg-[#f3f6f4] text-[#17211d]'>
      <Sidebar />
      <div className='min-w-0 flex-1 md:ml-64'>
        <Navbar />
        <div id='main-content' className='mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8'>
          <header className='border-b border-[#d6ded9] pb-6'>
            <Link to='/quotes' className='inline-flex items-center gap-2 text-sm font-semibold text-[#456157] hover:text-[#0d5944] hover:underline'><ArrowLeft className='h-4 w-4' /> Quotes</Link>
            <div className='mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='min-w-0 text-2xl font-semibold text-[#14201b] sm:text-3xl'>{quote.title}</h1>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.color}`}>{status.icon}{getQuoteStatusLabel(quote.status)}</span>
                </div>
                <p className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#65736c]'>
                  <span className='font-semibold text-[#33423a]'>#{quote.quoteNumber}</span><span aria-hidden='true'>•</span><span>{customerName}</span>
                  {quote.property?.address && <><span aria-hidden='true'>•</span><span>{quote.property.address}</span></>}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <button type='button' onClick={() => setIsSendOpen(true)} className='inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0d5944] px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,89,68,0.18)] hover:bg-[#084936] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] focus-visible:ring-offset-2 sm:flex-none'><Send className='h-4 w-4' /> Send quote</button>
                <button type='button' onClick={() => setIsEditOpen(true)} className='inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#cbd5d0] bg-white px-4 text-sm font-semibold text-[#33423a] hover:bg-[#edf2ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30 sm:flex-none'><Edit3 className='h-4 w-4' /> Edit</button>
                {quote.status === QuoteStatus.Approved && !quote.jobId && <button type='button' onClick={() => setIsConvertOpen(true)} className='inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#9eb5aa] bg-[#e8f1ed] px-4 text-sm font-semibold text-[#174d3a] hover:bg-[#dceae3]'><HardHat className='h-4 w-4' /> Convert to job</button>}
                <div ref={moreRef} className='relative'>
                  <button type='button' onClick={() => setIsMoreOpen((open) => !open)} aria-label='More quote actions' aria-expanded={isMoreOpen} className='inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#cbd5d0] bg-white text-[#536159] hover:bg-[#edf2ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30'><MoreHorizontal className='h-5 w-5' /></button>
                  {isMoreOpen && <QuoteActions onPdf={getPdf} onDuplicate={() => { setIsMoreOpen(false); setIsDuplicateOpen(true); }} onConvert={() => { setIsMoreOpen(false); setIsConvertOpen(true); }} onStatus={handleStatus} onArchive={() => { setIsMoreOpen(false); setIsArchiveOpen(true); }} onDelete={() => { setIsMoreOpen(false); setIsDeleteOpen(true); }} />}
                </div>
              </div>
            </div>
          </header>

          <section aria-label='Quote lifecycle' className='mt-6 overflow-hidden rounded-lg border border-[#d6ded9] bg-white'>
            <div className='grid grid-cols-2 lg:grid-cols-4'>
              <LifecycleItem icon={FileText} label='Created' value={formatDate(quote.createdAt)} detail={quote.createdByUser?.fullName ?? 'Workspace record'} />
              <LifecycleItem icon={Send} label='Sent' value={quote.sentAt ? formatDate(quote.sentAt) : 'Not sent'} detail={quote.sentAt ? formatTime(quote.sentAt) : 'Ready when you are'} />
              <LifecycleItem icon={Eye} label='Customer view' value={quote.viewedAt ? formatDate(quote.viewedAt) : quote.viewed ? 'Viewed' : 'Not viewed'} detail={quote.viewedAt ? formatTime(quote.viewedAt) : 'Portal activity'} />
              <LifecycleItem icon={expiry.icon} label={expiry.label} value={expiry.value} detail={expiry.detail} tone={expiry.tone} />
            </div>
          </section>

          <div className='mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
            <div className='min-w-0 space-y-6'>
              <section aria-labelledby='quote-ledger-title' className='overflow-hidden rounded-lg border border-[#d6ded9] bg-white'>
                <div className='flex flex-col gap-3 border-b border-[#dfe5e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                  <div><h2 id='quote-ledger-title' className='text-base font-semibold text-[#17211d]'>Estimate ledger</h2><p className='mt-1 text-sm text-[#65736c]'>{quote.lineItems.length} {quote.lineItems.length === 1 ? 'line item' : 'line items'} for {customerName}</p></div>
                  <button type='button' onClick={() => void getPdf('preview')} className='inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cbd5d0] bg-white px-3 text-sm font-semibold text-[#3f5047] hover:bg-[#f1f4f2]'><Eye className='h-4 w-4' /> Customer preview</button>
                </div>
                <DesktopLineItems quote={quote} />
                <MobileLineItems quote={quote} />
                <div className='grid border-t border-[#d6ded9] bg-[#f7f9f8] lg:grid-cols-[minmax(0,1fr)_360px]'>
                  <div className='border-b border-[#d6ded9] px-5 py-5 lg:border-b-0 lg:border-r lg:px-6'><p className='text-xs font-semibold text-[#65736c]'>Customer-facing note</p><p className='mt-2 max-w-2xl text-sm leading-6 text-[#33423a]'>{quote.customerNotes[0]?.noteText || 'No customer note is included on this quote.'}</p></div>
                  <dl className='space-y-3 px-5 py-5 text-sm sm:px-6'>
                    <TotalRow label='Subtotal' value={formatCurrency(quote.subtotal)} />
                    {quote.discount > 0 && <TotalRow label={quote.discountType === 0 ? `Discount (${quote.discountValue}%)` : 'Discount'} value={`-${formatCurrency(quote.discount)}`} />}
                    <TotalRow label={`Tax (${formatTaxRate(quote.taxRate)}%)`} value={formatCurrency(quote.taxAmount)} />
                    <div className='flex items-end justify-between gap-4 border-t-2 border-[#8fa198] pt-4'><dt className='font-semibold text-[#24332c]'>Quote total</dt><dd className='text-2xl font-semibold tabular-nums text-[#17211d]'>{formatCurrency(quote.total)}</dd></div>
                  </dl>
                </div>
              </section>

              <section aria-labelledby='notes-title' className='rounded-lg border border-[#d6ded9] bg-white'>
                <div className='border-b border-[#dfe5e1] px-5 py-5 sm:px-6'><h2 id='notes-title' className='text-base font-semibold'>Notes and communication</h2><p className='mt-1 text-sm text-[#65736c]'>Keep team context separate from information the customer can see.</p></div>
                <div className='grid lg:grid-cols-2'>
                  <NoteSection title='Internal notes' description='Visible only to your team' notes={quote.internalNotes} open={openNote === 'internal'} value={internalNote} onOpen={() => setOpenNote('internal')} onCancel={() => { setOpenNote(null); setInternalNote(''); }} onChange={setInternalNote} onSave={() => void handleAddNote('internal')} saving={savingNote} />
                  <NoteSection title='Customer notes' description='May appear on the quote' notes={quote.customerNotes} open={openNote === 'customer'} value={customerNote} onOpen={() => setOpenNote('customer')} onCancel={() => { setOpenNote(null); setCustomerNote(''); }} onChange={setCustomerNote} onSave={() => void handleAddNote('customer')} saving={savingNote} customerMessages={quote.customerMessages} customerName={customerName} />
                </div>
              </section>
              <ActivityTimeline activities={quote.activityHistory} />
            </div>

            <aside aria-label='Quote context' className='overflow-hidden rounded-lg border border-[#d6ded9] bg-white'>
              <CustomerContext quote={quote} customerName={customerName} />
              <section className='border-t border-[#dfe5e1] px-5 py-5'>
                <h2 className='text-base font-semibold'>Document details</h2>
                <dl className='mt-4 space-y-3 text-sm'>
                  <DetailRow label='Created' value={formatDate(quote.createdAt)} />
                  <DetailRow label='Expires' value={formatDate(quote.expiresAt)} tone={expiry.tone === 'attention' ? 'attention' : undefined} />
                  <DetailRow label='Assigned to' value={quote.assignedToUser?.fullName || 'Unassigned'} />
                  {quote.source && <DetailRow label='Source' value={quote.source} />}
                  <DetailRow label='Last updated' value={formatDate(quote.updatedAt)} />
                </dl>
                {quote.jobId && <Link to={`/jobs/${quote.jobId}`} className='mt-5 flex items-center justify-between rounded-lg border border-[#b8d0c4] bg-[#edf5f1] px-3 py-3 text-sm font-semibold text-[#174d3a] hover:bg-[#e2eee8]'><span className='inline-flex items-center gap-2'><Briefcase className='h-4 w-4' /> Converted job</span><ChevronDown className='h-4 w-4 -rotate-90' /></Link>}
              </section>
              <div className='border-t border-[#dfe5e1]'><QuoteAttachments quoteId={quote.id} currentAttachments={quote.attachments ?? []} onAttachmentsUpdated={handleNewAttachmentAdded} /></div>
            </aside>
          </div>
        </div>
      </div>

      <ActionConfirmationModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} onConfirm={handleArchive} itemName={quote.title || 'Quote'} actionType='archive' itemType='quote' />
      <ActionConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} itemName={quote.title || 'Quote'} actionType='delete' itemType='quote' />
      {isSendOpen && <SendQuoteModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} onSend={handleSend} customer={quote.customer} quote={quote} user={user} />}
      {isEditOpen && <EditQuoteModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} quoteToEdit={quote} setQuotes={setQuote} />}
      {isConvertOpen && <ConvertQuoteToJobModal isOpen={isConvertOpen} onClose={() => setIsConvertOpen(false)} quote={quote} />}
      {isDuplicateOpen && <DuplicateQuoteModal isOpen={isDuplicateOpen} onClose={() => setIsDuplicateOpen(false)} quoteToDuplicate={quote} />}
    </div>
  );
};

const DesktopLineItems = ({ quote }: { quote: TQuote }) => <div className='hidden overflow-x-auto md:block'><table className='w-full table-fixed'><thead className='border-b border-[#dfe5e1] bg-[#f7f9f8] text-left text-xs font-semibold text-[#5d6b65]'><tr><th className='w-[52%] px-6 py-3'>Item</th><th className='w-[12%] px-4 py-3 text-right'>Qty</th><th className='w-[18%] px-4 py-3 text-right'>Unit price</th><th className='w-[18%] px-6 py-3 text-right'>Amount</th></tr></thead><tbody className='divide-y divide-[#e3e8e5]'>{quote.lineItems.map((item) => <tr key={item.id} className='align-top'><td className='px-6 py-4'><div className='flex flex-wrap items-center gap-2'><span className='font-semibold text-[#24332c]'>{item.name}</span>{item.isOptional && <Tag>Optional</Tag>}{item.isTaxable && <span className='text-xs text-[#65736c]'>Taxable</span>}</div>{item.description && <p className='mt-1 max-w-2xl text-sm leading-6 text-[#65736c]'>{item.description}</p>}</td><td className='px-4 py-4 text-right text-sm tabular-nums text-[#46564e]'>{item.quantity}</td><td className='px-4 py-4 text-right text-sm tabular-nums text-[#46564e]'>{formatCurrency(item.unitPrice)}</td><td className='px-6 py-4 text-right text-sm font-semibold tabular-nums text-[#17211d]'>{formatCurrency(item.quantity * item.unitPrice)}</td></tr>)}</tbody></table></div>;

const MobileLineItems = ({ quote }: { quote: TQuote }) => <div className='divide-y divide-[#e3e8e5] md:hidden'>{quote.lineItems.map((item) => <article key={item.id} className='px-5 py-4'><div className='flex items-start justify-between gap-4'><div className='min-w-0'><div className='flex flex-wrap items-center gap-2'><h3 className='font-semibold text-[#24332c]'>{item.name}</h3>{item.isOptional && <Tag>Optional</Tag>}</div>{item.description && <p className='mt-1 text-sm leading-6 text-[#65736c]'>{item.description}</p>}</div><strong className='shrink-0 text-sm tabular-nums'>{formatCurrency(item.quantity * item.unitPrice)}</strong></div><p className='mt-3 text-xs text-[#65736c]'>{item.quantity} × {formatCurrency(item.unitPrice)}{item.isTaxable ? ' • Taxable' : ''}</p></article>)}</div>;

const CustomerContext = ({ quote, customerName }: { quote: TQuote; customerName: string }) => <section className='px-5 py-5'><div className='flex items-start justify-between gap-3'><div><h2 className='text-base font-semibold'>Customer</h2><p className='mt-1 text-sm text-[#65736c]'>Primary contact and service address</p></div><span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6eeea] text-xs font-bold text-[#24533f]'>{getInitials(customerName)}</span></div><Link to={`/customers/${quote.customerId}`} className='mt-5 block font-semibold text-[#17211d] hover:text-[#0d5944] hover:underline'>{customerName}</Link>{quote.customer?.companyName && quote.customer.companyName !== customerName && <p className='mt-1 text-sm text-[#65736c]'>{quote.customer.companyName}</p>}<div className='mt-4 space-y-3 text-sm'>{quote.customer?.customerPhones?.[0]?.phoneNumber && <a href={`tel:${quote.customer.customerPhones[0].phoneNumber}`} className='flex items-center gap-3 text-[#46564e] hover:text-[#0d5944]'><Phone className='h-4 w-4 shrink-0 text-[#6f7d76]' />{quote.customer.customerPhones[0].phoneNumber}</a>}{quote.customer?.emails?.[0] && <a href={`mailto:${quote.customer.emails[0]}`} className='flex min-w-0 items-center gap-3 text-[#46564e] hover:text-[#0d5944]'><Mail className='h-4 w-4 shrink-0 text-[#6f7d76]' /><span className='truncate'>{quote.customer.emails[0]}</span></a>}{quote.property?.address && <div className='flex items-start gap-3 text-[#46564e]'><MapPin className='mt-0.5 h-4 w-4 shrink-0 text-[#6f7d76]' /><span>{quote.property.address}</span></div>}</div></section>;

const QuoteActions = ({ onPdf, onDuplicate, onConvert, onStatus, onArchive, onDelete }: { onPdf: (action: 'preview' | 'download' | 'print') => void; onDuplicate: () => void; onConvert: () => void; onStatus: (status: QuoteStatus) => void; onArchive: () => void; onDelete: () => void }) => <div className='absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-lg border border-[#cbd5d0] bg-white py-2 shadow-[0_10px_28px_rgba(23,33,29,0.16)]'><MenuLabel>Document</MenuLabel><MenuButton icon={Eye} onClick={() => onPdf('preview')}>Preview PDF</MenuButton><MenuButton icon={Download} onClick={() => onPdf('download')}>Download PDF</MenuButton><MenuButton icon={Printer} onClick={() => onPdf('print')}>Print</MenuButton><MenuButton icon={Copy} onClick={onDuplicate}>Duplicate quote</MenuButton><MenuButton icon={HardHat} onClick={onConvert}>Convert to job</MenuButton><div className='my-2 border-t border-[#e1e6e3]' /><MenuLabel>Update status</MenuLabel><MenuButton icon={Send} onClick={() => onStatus(QuoteStatus.Sent)}>Mark as sent</MenuButton><MenuButton icon={Check} onClick={() => onStatus(QuoteStatus.Approved)}>Mark as accepted</MenuButton><MenuButton icon={X} onClick={() => onStatus(QuoteStatus.Declined)}>Mark as rejected</MenuButton><div className='my-2 border-t border-[#e1e6e3]' /><MenuButton icon={Archive} onClick={onArchive}>Archive</MenuButton><MenuButton icon={Trash2} onClick={onDelete} danger>Delete quote</MenuButton></div>;

const MenuLabel = ({ children }: { children: string }) => <p className='px-3 pb-1 pt-1 text-xs font-semibold text-[#5f6d66]'>{children}</p>;
const MenuButton = ({ icon: Icon, children, onClick, danger = false }: { icon: typeof Eye; children: string; onClick: () => void; danger?: boolean }) => <button type='button' onClick={onClick} className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium ${danger ? 'text-red-700 hover:bg-red-50' : 'text-[#3f5047] hover:bg-[#f1f4f2]'}`}><Icon className='h-4 w-4 shrink-0' />{children}</button>;

const LifecycleItem = ({ icon: Icon, label, value, detail, tone }: { icon: typeof FileText; label: string; value: string; detail: string; tone?: 'attention' }) => <div className='min-w-0 border-b border-r border-[#dfe5e1] px-4 py-4 last:border-r-0 lg:border-b-0 lg:px-5'><div className='flex items-center gap-2 text-sm text-[#536159]'><Icon className={`h-4 w-4 ${tone === 'attention' ? 'text-amber-700' : 'text-[#456157]'}`} />{label}</div><p className={`mt-2 truncate text-base font-semibold ${tone === 'attention' ? 'text-amber-800' : 'text-[#17211d]'}`}>{value}</p><p className='mt-1 truncate text-xs text-[#5f6d66]'>{detail}</p></div>;
const TotalRow = ({ label, value }: { label: string; value: string }) => <div className='flex items-center justify-between gap-4'><dt className='text-[#65736c]'>{label}</dt><dd className='font-semibold tabular-nums text-[#24332c]'>{value}</dd></div>;
const DetailRow = ({ label, value, tone }: { label: string; value: string; tone?: 'attention' }) => <div className='flex items-start justify-between gap-4'><dt className='text-[#5f6d66]'>{label}</dt><dd className={`max-w-[60%] text-right font-medium ${tone === 'attention' ? 'text-amber-800' : 'text-[#33423a]'}`}>{value}</dd></div>;
const Tag = ({ children }: { children: string }) => <span className='rounded-full border border-[#cbd5d0] bg-[#f4f7f5] px-2 py-0.5 text-[11px] font-semibold text-[#65736c]'>{children}</span>;

const NoteSection = ({ title, description, notes, open, value, onOpen, onCancel, onChange, onSave, saving, customerMessages, customerName }: { title: string; description: string; notes: TNote[]; open: boolean; value: string; onOpen: () => void; onCancel: () => void; onChange: (value: string) => void; onSave: () => void; saving: boolean; customerMessages?: string[]; customerName?: string }) => {
  const inputId = `${title.toLowerCase().replaceAll(' ', '-')}-composer`;
  return <div className='min-w-0 border-b border-[#dfe5e1] p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 sm:p-6'><div className='flex items-start justify-between gap-3'><div><h3 className='font-semibold text-[#24332c]'>{title}</h3><p className='mt-1 text-xs text-[#5f6d66]'>{description}</p></div>{!open && <button type='button' onClick={onOpen} className='inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cbd5d0] bg-white px-3 text-sm font-semibold text-[#405048] hover:bg-[#f1f4f2]'><Plus className='h-4 w-4' /> Add</button>}</div>{open && <div className='mt-4'><label htmlFor={inputId} className='block text-sm font-semibold text-[#33423a]'>New note<textarea id={inputId} rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder='Write a useful note...' className='mt-1.5 w-full resize-y rounded-lg border border-[#cbd5d0] px-3 py-2.5 text-sm font-normal outline-none placeholder:text-[#829088] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15' /></label><div className='mt-3 flex justify-end gap-2'><button type='button' onClick={onCancel} className='h-9 rounded-lg border border-[#cbd5d0] px-3 text-sm font-semibold text-[#46564e] hover:bg-[#f1f4f2]'>Cancel</button><button type='button' onClick={onSave} disabled={!value.trim() || saving} className='h-9 rounded-lg bg-[#0d5944] px-3 text-sm font-semibold text-white hover:bg-[#084936] disabled:cursor-not-allowed disabled:opacity-50'>{saving ? 'Saving...' : 'Save note'}</button></div></div>}<div className='mt-5 space-y-5'>{notes.length ? notes.map((note) => <QuoteNote key={note.id} note={note} />) : <p className='border border-dashed border-[#cbd5d0] bg-[#f8faf9] px-4 py-6 text-center text-sm text-[#5f6d66]'>No notes yet.</p>}</div>{customerMessages?.length ? <div className='mt-6 border-t border-[#dfe5e1] pt-5'><h4 className='text-sm font-semibold text-[#33423a]'>Customer messages</h4><div className='mt-3 space-y-3'>{customerMessages.map((message, index) => <div key={`${message}-${index}`} className='rounded-lg bg-[#f4f7f5] px-3 py-3 text-sm text-[#46564e]'><p>{message}</p><p className='mt-1 text-xs text-[#5f6d66]'>{customerName}</p></div>)}</div></div> : null}</div>;
};

const ActivityTimeline = ({ activities }: { activities: TQuote['activityHistory'] }) => <section aria-labelledby='activity-title' className='rounded-lg border border-[#d6ded9] bg-white'><div className='border-b border-[#dfe5e1] px-5 py-5 sm:px-6'><h2 id='activity-title' className='text-base font-semibold'>Activity history</h2><p className='mt-1 text-sm text-[#65736c]'>A chronological record of changes to this quote.</p></div>{activities?.length ? <ol className='divide-y divide-[#e3e8e5]'>{activities.map((activity) => { const style = getQuoteActivityStyle(QuoteActivityType[activity.type] as unknown as QuoteActivityType); const Icon = style.icon; return <li key={activity.id} className='grid gap-3 px-5 py-4 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:items-start sm:px-6'><span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.lightBg}`}><Icon className={`h-4 w-4 ${style.textColor}`} /></span><div className='min-w-0'><p className='text-sm text-[#33423a]'><span className='font-semibold'>{activity.changedByName || 'System'}</span> {activity.action}</p></div><time dateTime={activity.changedAt} className='pl-12 text-xs text-[#5f6d66] sm:pl-0 sm:text-right'>{formatDateTime(activity.changedAt)}</time></li>; })}</ol> : <div className='px-5 py-10 text-center text-sm text-[#5f6d66]'>No activity has been recorded yet.</div>}</section>;

const QuoteDetailsLoading = () => <div className='flex min-h-screen bg-[#f3f6f4]'><Sidebar /><div className='min-w-0 flex-1 md:ml-64'><Navbar /><div id='main-content' className='mx-auto w-full max-w-[1600px] animate-pulse px-4 py-7 sm:px-6 lg:px-8'><div className='h-4 w-20 rounded bg-[#dfe5e1]' /><div className='mt-5 h-9 w-80 max-w-full rounded bg-[#d6ded9]' /><div className='mt-6 h-28 rounded-lg bg-white' /><div className='mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'><div className='h-[520px] rounded-lg bg-white' /><div className='h-96 rounded-lg bg-white' /></div></div></div></div>;
const QuoteUnavailable = ({ message }: { message: string }) => <div className='flex min-h-screen bg-[#f3f6f4]'><Sidebar /><div className='min-w-0 flex-1 md:ml-64'><Navbar /><div id='main-content' className='mx-auto max-w-3xl px-4 py-16 text-center sm:px-6'><FileText className='mx-auto h-10 w-10 text-[#7b8982]' /><h1 className='mt-4 text-xl font-semibold text-[#17211d]'>Quote unavailable</h1><p className='mx-auto mt-2 max-w-lg text-sm leading-6 text-[#65736c]'>{message}</p><Link to='/quotes' className='mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0d5944] px-4 text-sm font-semibold text-white hover:bg-[#084936]'><ArrowLeft className='h-4 w-4' /> Back to quotes</Link></div></div></div>;

const getCustomerName = (quote: TQuote) => quote.customer?.isCompany && quote.customer.companyName ? quote.customer.companyName : quote.customer?.fullName || quote.customer?.displayName || 'Unnamed customer';
const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
const formatDate = (value?: string) => value && DateTime.fromISO(value).isValid ? DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED) : 'Not set';
const formatTime = (value?: string) => value && DateTime.fromISO(value).isValid ? DateTime.fromISO(value).toLocaleString(DateTime.TIME_SIMPLE) : '';
const formatDateTime = (value?: string) => value && DateTime.fromISO(value).isValid ? DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_MED) : 'Date unavailable';
const formatTaxRate = (rate: number) => Number((rate * 100).toFixed(2));
const getQuoteStatusLabel = (status: QuoteStatus) => ({
  [QuoteStatus.Draft]: 'Draft', [QuoteStatus.Sent]: 'Sent', [QuoteStatus.AwaitingResponse]: 'Awaiting response',
  [QuoteStatus.AwaitingApproval]: 'Awaiting approval', [QuoteStatus.Approved]: 'Approved',
  [QuoteStatus.Declined]: 'Declined', [QuoteStatus.Expired]: 'Expired', [QuoteStatus.ConvertedToJob]: 'Converted to job',
})[status] ?? 'Unknown';

const getExpiryPresentation = (quote: TQuote): { icon: typeof CalendarDays; label: string; value: string; detail: string; tone?: 'attention' } => {
  if (quote.status === QuoteStatus.Approved || quote.status === QuoteStatus.ConvertedToJob) return { icon: Check, label: 'Decision', value: getQuoteStatusLabel(quote.status), detail: quote.jobId ? 'Work created' : 'Customer accepted' };
  if (quote.status === QuoteStatus.Declined) return { icon: X, label: 'Decision', value: 'Declined', detail: 'Customer declined' };
  const expires = DateTime.fromISO(quote.expiresAt);
  if (!expires.isValid) return { icon: CalendarDays, label: 'Expiry', value: 'Not set', detail: 'No expiry date' };
  const days = Math.ceil(expires.diffNow('days').days);
  if (days < 0 || quote.status === QuoteStatus.Expired) return { icon: CalendarDays, label: 'Expiry', value: 'Expired', detail: formatDate(quote.expiresAt), tone: 'attention' };
  return { icon: CalendarDays, label: 'Expires', value: formatDate(quote.expiresAt), detail: days === 0 ? 'Expires today' : `${days} days remaining`, tone: days <= 7 ? 'attention' : undefined };
};

export default QuoteDetails;
