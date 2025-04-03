import { useEffect, useState } from 'react';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import CustomButton from '../../components/CustomElements/CustomButton';
import Search from '../../components/CustomElements/Search';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Table from '../../components/Table/Table';
import icons from '../../constants/icons';
import CreateCustomerModal from '../../components/Customers/CreateCustomerModal/CreateCustomerModal';
import { TAddCustomer, TCustomer } from '../../types/Customer';
import { CreateCustomer, GetAllCustomers } from '../../services/customer';
import { addCustomerInitialState } from '../../const/states';

const Customers = () => {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] =
    useState<boolean>(false);
  const [listOfCustomers, setListOfCustomers] = useState<TCustomer[] | []>([]);
  const [customer, setCustomer] = useState<TAddCustomer>(
    addCustomerInitialState
  );

  const handleCreateCustomer = async () => {
    console.log(customer);

    const response = await CreateCustomer(customer);
    if (response.status === 200) {
      setIsAddCustomerModalOpen(false);
      setCustomer(addCustomerInitialState);
      getAllWorkspaceCustomers();
    }
  };

  const getAllWorkspaceCustomers = async () => {
    const resposne = await GetAllCustomers();
    if (resposne.status === 200) setListOfCustomers(resposne.data.payload);
  };

  useEffect(() => {
    getAllWorkspaceCustomers();
  }, []);

  useEffect(() => {
    if (isAddCustomerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isAddCustomerModalOpen]);

  return (
    <>
      <div className='flex mb-4'>
        <Sidebar />
        <div className='flex-1 ml-[260px]'>
          <div>
            <Navbar />
          </div>
          <div className='px-4'>
            <div className='pb-4 mb-4 flex items-center justify-between'>
              <p className='text-heading text-4xl font-extrabold'>Customers</p>
              <div className='flex items-center space-x-3'>
                <ButtonIcon name='Import' icon={icons.importIcon} />
                <ButtonIcon name='Export' icon={icons.exportIcon} />
                <div className='w-[1px] h-[38px] bg-border-primary'></div>
                <CustomButton
                  title='Add customer'
                  handleBtnClick={() => setIsAddCustomerModalOpen(true)}
                />
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='p-4 min-w-[120px] w-[360px] max-w-[360px] border-[1px] border-border-primary rounded-lg space-y-3'>
                <div>
                  <p className='font-bold text-heading'>Total customers</p>
                  <p className='text-sm text-text-secondary'>All time</p>
                </div>
                <p className='text-4xl font-bold text-[#304953]'>3</p>
              </div>
              <div className='p-4 min-w-[120px] w-[360px] border-[1px] border-border-primary rounded-lg space-y-3'>
                <div>
                  <p className='font-bold text-heading'>Total customers</p>
                  <p className='text-sm text-text-secondary'>All time</p>
                </div>
                <p className='text-4xl font-bold text-[#304953]'>3</p>
              </div>
              <div className='p-4 min-w-[120px] w-[360px] border-[1px] border-border-primary rounded-lg space-y-3'>
                <div>
                  <p className='font-bold text-heading'>Total customers</p>
                  <p className='text-sm text-text-secondary'>All time</p>
                </div>
                <p className='text-4xl font-bold text-[#304953]'>3</p>
              </div>
            </div>
            <div className='py-4 space-y-4'>
              <div className='flex items-center space-x-2'>
                <p className='text-heading text-xl font-bold'>All clients</p>
                {/* <p className='text-heading text-xl font-bold'>Filtered clients</p> */}
                <p className='text-sm text-[#838488]'>(2 results)</p>
              </div>
              <div className='flex items-center justify-between'>
                <Search />
                <div className='flex items-center space-x-3'>
                  <ButtonIcon name='Sort' icon={icons.sortIcon} />
                  <ButtonIcon name='Filter' icon={icons.filterIcon} />
                </div>
              </div>
            </div>
            <Table data={listOfCustomers} />
          </div>
        </div>
      </div>
      {isAddCustomerModalOpen && (
        <CreateCustomerModal
          setIsAddCustomerModalOpen={setIsAddCustomerModalOpen}
          handleCreateCustomer={handleCreateCustomer}
          setCustomer={setCustomer}
          customer={customer}
        />
      )}
    </>
  );
};

export default Customers;
