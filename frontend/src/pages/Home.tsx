import Sidebar from '../components/Sidebar/Sidebar';

const Home = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px] h-[2000px]'>
        <p className=''>Ostatak</p>
      </div>
    </div>
  );
};

export default Home;
