export const getPhoneIcon = (type: string) => {
  switch (type) {
    case 'Mobile':
      return (
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z'
            clipRule='evenodd'
          />
        </svg>
      );
    case 'Work':
      return (
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z'
            clipRule='evenodd'
          />
          <path d='M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z' />
        </svg>
      );
    case 'Home':
      return (
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
        </svg>
      );
    default:
      return (
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
        </svg>
      );
  }
};
