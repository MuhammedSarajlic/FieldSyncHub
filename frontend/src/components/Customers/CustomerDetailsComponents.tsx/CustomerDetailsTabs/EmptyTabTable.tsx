interface IEmptyTabTable {
  name: string;
  btnName: string;
  icon: string;
}

const EmptyTabTable = ({ name, btnName, icon }: IEmptyTabTable) => {
  return (
    <div className='px-4 py-2 flex items-center space-x-3 border-t-[1px] border-border-primary'>
      <div className='bg-[#FAFAFA] rounded-full p-5'>
        <img src={icon} alt='invoice' className='w-6 h-6' />
      </div>
      <div className=''>
        <p className='text-heading font-semibold'>{`No ${name}`}</p>
        <p className='text-sm text-primary'>
          {`There are no current ${name} for this client yet`}
        </p>
        <button
          className={`mt-1 border-[1px] border-border-primary rounded-lg py-1.5 px-4 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
        >
          <p
            className={`text-sm font-semibold text-text-secondary`}
          >{`New ${btnName}`}</p>
        </button>
      </div>
    </div>
  );
};

export default EmptyTabTable;
