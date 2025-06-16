export const formatTime = (
  dateTime: Date | string | null | undefined
): string => {
  if (!dateTime) return '';

  const date = new Date(dateTime);

  if (isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
};
