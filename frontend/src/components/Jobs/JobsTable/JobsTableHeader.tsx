const JobsTableHeader = () => {
  return (
    <thead className='bg-[#F9FBFC]'>
      <tr>
        <th
          scope='col'
          className='px-4 py-2 text-left text-sm font-medium text-heading '
        >
          Customer
        </th>
        <th
          scope='col'
          className='px-4 py-2 text-left text-sm font-medium text-heading '
        >
          Property
        </th>
        <th
          scope='col'
          className='px-4 py-2 text-left text-sm font-medium text-heading '
        >
          Schedule
        </th>
        <th
          scope='col'
          className='px-4 py-2 text-left text-sm font-medium text-heading '
        >
          Status
        </th>
        <th
          scope='col'
          className='px-4 py-2 text-left text-sm font-medium text-heading '
        >
          Priority
        </th>
        <th
          scope='col'
          className='px-4 py-2 text-right text-sm font-medium text-heading '
        >
          Value
        </th>
      </tr>
    </thead>
  );
};

export default JobsTableHeader;
