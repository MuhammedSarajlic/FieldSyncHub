import Sidebar from '../components/Sidebar/Sidebar';

const Calendar = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px] h-[2000px]'>
        <p className=''>Calendar</p>
      </div>
    </div>
  );
};

export default Calendar;
