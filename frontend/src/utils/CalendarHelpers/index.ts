// Helper to format the current month and year for display
export const formatMonthYear = (date) => {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

// Helper to get the start of the week (Monday) for a given date
export const getStartOfWeek = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(date.getFullYear(), date.getMonth(), diff);
};

// Helper to get days for the current week
export const getDaysForWeek = (date) => {
  const startOfWeek = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
};

// Helper to get current GMT offset
export const getCurrentGMTPlusOffset = () => {
  const date = new Date();
  const offsetMinutes = date.getTimezoneOffset(); // Offset in minutes from UTC
  const offsetHours = -offsetMinutes / 60; // Convert to hours, negate because getTimezoneOffset is UTC-local
  const sign = offsetHours >= 0 ? '+' : '-';
  const absOffsetHours = Math.abs(Math.floor(offsetHours));
  const absOffsetMinutes = Math.abs(offsetMinutes % 60);

  const formattedOffset = `GMT${sign}${String(absOffsetHours).padStart(
    2,
    '0'
  )}:${String(absOffsetMinutes).padStart(2, '0')}`;
  return formattedOffset;
};
