import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { PaymentMethod, TRecordInvoicePayment } from '../../../types/Invoice';
import IconButton from '../../CustomElements/Buttons/IconButton';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import { DollarSign, Wallet } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  balanceDue: number;
  onClose: () => void;
  onSubmit: (payment: TRecordInvoicePayment) => Promise<void>;
}

const paymentMethodOptions = [
  { value: PaymentMethod.Cash, label: 'Cash' },
  { value: PaymentMethod.Check, label: 'Check' },
  { value: PaymentMethod.CardOnSite, label: 'Card on site' },
  { value: PaymentMethod.Card, label: 'Card' },
  { value: PaymentMethod.BankTransfer, label: 'Bank transfer' },
  { value: PaymentMethod.Other, label: 'Other' },
];

const RecordPaymentModal = ({
  isOpen,
  balanceDue,
  onClose,
  onSubmit,
}: RecordPaymentModalProps) => {
  const [payment, setPayment] = useState<TRecordInvoicePayment>({
    amount: Number(balanceDue.toFixed(2)),
    method: PaymentMethod.Check,
    paidAt: DateTime.now().toISODate() ?? '',
    note: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setPayment({
      amount: Number(balanceDue.toFixed(2)),
      method: PaymentMethod.Check,
      paidAt: DateTime.now().toISODate() ?? '',
      note: '',
    });
    setError(null);
  }, [balanceDue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!payment.amount || payment.amount <= 0) {
      setError('Enter a payment amount greater than zero.');
      return;
    }

    if (payment.amount > balanceDue) {
      setError('Payment amount cannot exceed the remaining balance due.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(payment);
      onClose();
      setPayment({
        amount: Number(balanceDue.toFixed(2)),
        method: PaymentMethod.Check,
        paidAt: DateTime.now().toISODate() ?? '',
        note: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4'>
      <div className='w-full max-w-lg rounded-lg bg-white shadow-xl'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100'>
              <Wallet className='h-5 w-5 text-emerald-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Record payment
              </h3>
              <p className='text-sm text-gray-500'>
                Balance due: ${balanceDue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-4 px-6 py-5'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Amount
            </label>
            <div className='relative'>
              <DollarSign className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='number'
                min='0.01'
                step='0.01'
                value={payment.amount}
                onChange={(e) =>
                  setPayment((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                className='w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-bg-primary focus:outline-none'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Method
              </label>
              <select
                value={payment.method}
                onChange={(e) =>
                  setPayment((prev) => ({
                    ...prev,
                    method: Number(e.target.value) as PaymentMethod,
                  }))
                }
                className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-bg-primary focus:outline-none'
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Payment date
              </label>
              <input
                type='date'
                value={payment.paidAt}
                onChange={(e) =>
                  setPayment((prev) => ({
                    ...prev,
                    paidAt: e.target.value,
                  }))
                }
                className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-bg-primary focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Note
            </label>
            <textarea
              rows={4}
              value={payment.note ?? ''}
              onChange={(e) =>
                setPayment((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-bg-primary focus:outline-none'
              placeholder='Optional check number, memo, or context'
            />
          </div>

          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
              {error}
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t border-gray-200 px-6 py-4'>
          <CustomButton
            onClick={onClose}
            disabled={isSubmitting}
            customStyle='px-4 py-2 border-gray-300 hover:bg-gray-50'
          >
            Cancel
          </CustomButton>
          <IconButton
            icon={<Wallet className='mr-2 h-4 w-4' />}
            onClick={handleSubmit}
            disabled={isSubmitting}
            customStyle='border-transparent bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Recording...' : 'Record payment'}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
