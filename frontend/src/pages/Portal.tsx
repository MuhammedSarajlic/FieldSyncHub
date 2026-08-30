import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, FileText, Loader2 } from 'lucide-react';
import { useParams } from 'react-router';
import { approvePortalQuote, getPortalDocument } from '../services/Public';

type PortalData = { kind: 'quote' | 'invoice'; workspace: { name: string; logoUrl?: string; currency: string }; document: { number: string; title: string; status: string; expiresAt?: string; dueDate?: string; subtotal: number; discount: number; taxAmount: number; total: number; amountPaid?: number; balanceDue?: number; paymentTerms?: string; lineItems: { name: string; description?: string; quantity: number; unitPrice: number; total: number }[] } };

const money = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

export default function Portal() {
  const { token = '' } = useParams();
  const [data, setData] = useState<PortalData | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPortalDocument(token).then((response) => setData(response.data)).catch(() => setMessage('This link is invalid or has expired.')).finally(() => setLoading(false)); }, [token]);
  const approve = async () => { await approvePortalQuote(token); setData((current) => current ? { ...current, document: { ...current.document, status: 'Approved' } } : current); setMessage('Thanks. The quote has been approved.'); };
  if (loading) return <div className='min-h-screen grid place-items-center'><Loader2 className='animate-spin text-bg-primary' /></div>;
  if (!data) return <div className='min-h-screen grid place-items-center p-6 text-center'><p className='text-gray-600'>{message}</p></div>;
  const { document, workspace } = data;
  return <main className='min-h-screen bg-gray-50 px-4 py-8 sm:px-6'><div className='mx-auto max-w-2xl'>
    <header className='mb-6 flex items-center gap-3'>{workspace.logoUrl && <img src={workspace.logoUrl} alt='' className='h-10 w-10 rounded object-contain' />}<div><p className='font-semibold text-gray-900'>{workspace.name}</p><p className='text-sm text-gray-500'>{data.kind === 'quote' ? 'Quote' : 'Invoice'} {document.number}</p></div></header>
    <section className='border border-gray-200 bg-white p-5 shadow-sm sm:p-8'><div className='flex items-start justify-between gap-4'><div><h1 className='text-2xl font-semibold text-gray-900'>{document.title}</h1><p className='mt-1 text-sm text-gray-500'>Status: {document.status}</p></div><FileText className='text-bg-primary' /></div>
      <div className='mt-7 divide-y divide-gray-100'>{document.lineItems.map((item) => <div key={`${item.name}-${item.description}`} className='flex justify-between gap-4 py-3 text-sm'><div><p className='font-medium text-gray-800'>{item.name}</p><p className='text-gray-500'>{item.quantity} x {money(item.unitPrice, workspace.currency)}</p></div><span className='font-medium'>{money(item.total, workspace.currency)}</span></div>)}</div>
      <dl className='ml-auto mt-6 max-w-xs space-y-2 text-sm'><div className='flex justify-between'><dt>Subtotal</dt><dd>{money(document.subtotal, workspace.currency)}</dd></div><div className='flex justify-between'><dt>Discount</dt><dd>-{money(document.discount, workspace.currency)}</dd></div><div className='flex justify-between'><dt>Tax</dt><dd>{money(document.taxAmount, workspace.currency)}</dd></div><div className='flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold'><dt>Total</dt><dd>{money(document.total, workspace.currency)}</dd></div>{document.balanceDue !== undefined && <div className='flex justify-between font-semibold text-bg-primary'><dt>Balance due</dt><dd>{money(document.balanceDue, workspace.currency)}</dd></div>}</dl>
      {document.expiresAt && <p className='mt-6 flex items-center gap-2 text-sm text-gray-500'><Clock3 className='h-4 w-4' /> Expires {new Date(document.expiresAt).toLocaleDateString()}</p>}
      {data.kind === 'quote' && document.status !== 'Approved' && <button type='button' onClick={approve} className='mt-7 flex w-full items-center justify-center gap-2 bg-bg-primary px-4 py-3 font-medium text-white hover:bg-bg-primary-hover'><CheckCircle2 className='h-5 w-5' /> Approve quote</button>}
      {message && <p className='mt-4 text-center text-sm text-bg-primary'>{message}</p>}
      {data.kind === 'invoice' && <p className='mt-7 text-center text-sm text-gray-500'>Online card payment will appear here when payment processing is connected.</p>}
    </section></div></main>;
}
