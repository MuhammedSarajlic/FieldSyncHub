export const formatDate = (
  dateString: Date | string | null | undefined
): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(undefined, options);
};
