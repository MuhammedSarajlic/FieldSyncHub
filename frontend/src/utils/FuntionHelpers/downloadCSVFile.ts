export const downloadCSVFile = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to download');
    return;
  }

  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
