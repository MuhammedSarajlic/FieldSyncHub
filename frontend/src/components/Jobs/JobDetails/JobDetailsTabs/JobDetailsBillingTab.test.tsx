import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JobDetailsBillingTab from './JobDetailsBillingTab';
import { TJob } from '../../../../types/Job';

describe('job billing totals display', () => {
  it('renders line item amounts and the document total', () => {
    const job = {
      lineItems: [
        { id: 'line-1', name: 'Repair', unitPrice: 125, quantity: 2, total: 250 },
      ],
      totalAmount: 270,
    } as TJob;

    render(<JobDetailsBillingTab jobDetails={job} />);

    expect(screen.getByText('Repair')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('$270.00')).toBeInTheDocument();
  });
});
