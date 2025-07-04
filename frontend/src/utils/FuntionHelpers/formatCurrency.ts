export const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};
