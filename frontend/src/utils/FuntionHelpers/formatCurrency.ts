const getWorkspaceCurrency = () => {
  if (typeof window === 'undefined') {
    return 'USD';
  }

  try {
    return localStorage.getItem('workspaceCurrency') || 'USD';
  } catch {
    return 'USD';
  }
};

export const formatCurrency = (
  amount: number | undefined,
  currencyCode?: string
) => {
  const value = amount ?? 0;
  const currency = (currencyCode || getWorkspaceCurrency()).toUpperCase();

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }
};
