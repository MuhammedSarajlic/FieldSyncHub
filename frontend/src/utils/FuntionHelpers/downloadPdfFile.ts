export const downloadPdfFile = (blobData: Blob, filename: string) => {
  if (!blobData) {
    console.error('No data to download for PDF');
    return;
  }

  const finalFilename = filename.endsWith('.pdf')
    ? filename
    : `${filename}.pdf`;
  const blob = new Blob([blobData], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const openPdfAndPrint = (blobData: Blob) => {
  if (!blobData) {
    console.error('No data to open for PDF');
    return;
  }

  const url = window.URL.createObjectURL(blobData);

  const newTab = window.open(url, '_blank');

  if (!newTab) {
    alert('Please allow popups to enable printing');
    window.URL.revokeObjectURL(url);
    return;
  }

  newTab.onload = () => {
    setTimeout(() => {
      newTab.focus();
      newTab.print();
    }, 1000);
  };

  const checkLoaded = setInterval(() => {
    try {
      if (newTab.document.readyState === 'complete') {
        clearInterval(checkLoaded);
        setTimeout(() => {
          newTab.focus();
          newTab.print();
        }, 500);
      }
    } catch (e) {
      clearInterval(checkLoaded);
      setTimeout(() => {
        newTab.focus();
        newTab.print();
      }, 2000);
    }
  }, 100);

  setTimeout(() => {
    clearInterval(checkLoaded);
    window.URL.revokeObjectURL(url);
  }, 30000);
};
