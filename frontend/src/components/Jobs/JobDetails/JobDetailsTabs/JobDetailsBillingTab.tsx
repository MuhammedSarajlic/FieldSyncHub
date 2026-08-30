import { TJob } from '../../../../types/Job';
import { formatCurrency } from '../../../../utils/FuntionHelpers/formatCurrency';

export default function JobDetailsBillingTab({ jobDetails }: { jobDetails: TJob }) {
  return <div><h3 className='text-lg font-semibold text-gray-900 mb-6'>Line items</h3><div className='space-y-3'>{jobDetails.lineItems.map((item) => <div key={item.id} className='flex justify-between border-b border-gray-100 pb-3'><span>{item.name}</span><span className='font-medium'>{formatCurrency(item.total ?? item.unitPrice * item.quantity)}</span></div>)}<div className='flex justify-between pt-3 font-semibold'><span>Total</span><span>{formatCurrency(jobDetails.totalAmount)}</span></div></div></div>;
}
