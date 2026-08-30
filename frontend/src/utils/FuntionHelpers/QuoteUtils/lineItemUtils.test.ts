import { describe, expect, it } from 'vitest';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { calculateQuoteTotals } from './lineItemUtils';

const quote = {
  lineItems: [
    { name: 'Repair', unitPrice: 100, quantity: 2, isOptional: false },
    { name: 'Parts', unitPrice: 50, quantity: 1, isOptional: false },
  ],
  discountType: DiscountType.Percentage,
  discountValue: 10,
  taxRate: 8,
} as Parameters<typeof calculateQuoteTotals>[0];

describe('quote and invoice-facing totals', () => {
  it('calculates subtotal, percentage discount, tax and total', () => {
    expect(calculateQuoteTotals(quote)).toEqual({
      subtotal: 250,
      discountAmount: 25,
      taxAmount: 18,
      total: 243,
    });
  });

  it('supports a fixed discount without changing the subtotal', () => {
    expect(calculateQuoteTotals({
      ...quote,
      discountType: DiscountType.FixedAmount,
      discountValue: 30,
      taxRate: 0,
    })).toEqual({
      subtotal: 250,
      discountAmount: 30,
      taxAmount: 0,
      total: 220,
    });
  });
});
