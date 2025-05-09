interface ISearch {
  inputPlaceholder: string;
  searchQuery?: string;
  handleChange?: (q: string) => void;
}

const Search = ({ inputPlaceholder, searchQuery, handleChange }: ISearch) => {
  return (
    <div className='relative w-full md:w-64'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
        <svg
          className='w-4 h-4 text-gray-500'
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 20 20'
        >
          <path
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
          />
        </svg>
      </div>
      <input
        type='search'
        value={searchQuery}
        onChange={(e) => handleChange(e.target.value)}
        className='block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-bg-primary focus:border-bg-primary outline-none'
        placeholder={inputPlaceholder}
      />
    </div>
    // <div className='flex items-center py-1.5 px-2.5 border-[1px] border-border-primary w-[280px] rounded-md space-x-2'>
    //   <img src={icons.searchIcon} alt='search' className='w-4.5 h-4.5' />
    //   <input
    //     type='text'
    //     placeholder='Search'
    //     className='w-full outline-none text-primary text-sm'
    //   />
    // </div>
  );
};

export default Search;
