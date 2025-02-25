import icons from '../../constants/icons';

const Search = () => {
  return (
    <div className='flex items-center py-1.5 px-2.5 border-[1px] border-border-primary w-[280px] rounded-md space-x-2'>
      <img src={icons.searchIcon} alt='search' className='w-4.5 h-4.5' />
      <input
        type='text'
        placeholder='Search'
        className='w-full outline-none text-primary text-sm'
      />
    </div>
  );
};

export default Search;
