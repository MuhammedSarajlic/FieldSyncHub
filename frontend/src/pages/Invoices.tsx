import Sidebar from '../components/Sidebar/Sidebar';

const Invoices = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px] h-[2000px]'>
        <p className=''>Invoices</p>
      </div>
    </div>
  );
};

export default Invoices;
