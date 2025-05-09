const PricebookTableHeader = () => {
  return (
    <thead className='bg-gray-100'>
      <tr>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>img</span>
          </div>
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>Name</span>
          </div>
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Description
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>Type</span>
          </div>
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>Category</span>
          </div>
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>SKU</span>
          </div>
        </th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <div className='flex items-center'>
            <span>Price</span>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default PricebookTableHeader;
