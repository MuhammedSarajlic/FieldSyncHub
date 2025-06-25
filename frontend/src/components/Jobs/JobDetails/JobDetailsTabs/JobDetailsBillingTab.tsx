import { TJob } from '../../../../types/Job';
import { formatCurrency } from '../../../../utils/FuntionHelpers/formatCurrency';

interface IJobDetailsBillingTab {
  jobDetails: TJob;
}

const JobDetailsBillingTab = ({ jobDetails }: IJobDetailsBillingTab) => {
  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-semibold text-gray-900'>Line items</h3>

      {/* Line Items */}
      <div className='overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Item
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Qty
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Unit Price
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {jobDetails.lineItems.map((item) => (
              <tr key={item.id}>
                <td className='px-6 py-4'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.name}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {item.description}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 text-right text-sm text-gray-900'>
                  {item.quantity}
                </td>
                <td className='px-6 py-4 text-right text-sm text-gray-900'>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className='px-6 py-4 text-right text-sm font-medium text-gray-900'>
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className='bg-gray-50 rounded-lg p-6'>
        <div className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Subtotal</span>
            <span className='text-gray-900'>
              {formatCurrency(jobDetails.subtotal)}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>
              Discount ({jobDetails.discountValue}%)
            </span>
            <span className='text-red-600'>
              -{formatCurrency(jobDetails.discount)}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>
              Tax ({jobDetails.taxRate * 100}%)
            </span>
            <span className='text-gray-900'>
              {formatCurrency(
                jobDetails.totalAmount -
                  jobDetails.subtotal +
                  jobDetails.discount
              )}
            </span>
          </div>
          <div className='border-t border-gray-200 pt-3'>
            <div className='flex justify-between text-lg font-semibold'>
              <span className='text-gray-900'>Total</span>
              <span className='text-gray-900'>
                {formatCurrency(jobDetails.totalAmount)}
              </span>
            </div>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Deposit Paid</span>
            <span className='text-green-600'>
              {formatCurrency(jobDetails.depositAmount)}
            </span>
          </div>
          <div className='flex justify-between text-sm font-medium'>
            <span className='text-gray-900'>Balance Due</span>
            <span className='text-red-600'>
              {formatCurrency(
                jobDetails.totalAmount - jobDetails.depositAmount
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsBillingTab;
