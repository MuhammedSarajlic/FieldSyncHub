import { PaymentStatus } from '../../../constants/Enumeration/JobEnum/JobEnum';

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.Unpaid:
      return 'bg-red-100 text-red-800 border-red-200';
    case PaymentStatus.Partial:
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case PaymentStatus.Paid:
      return 'bg-green-100 text-green-700 border-green-200';
    case PaymentStatus.Refunded:
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
}
