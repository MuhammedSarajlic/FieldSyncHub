import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import icons from '../../constants/icons';

const CustomerDetails = () => {
  const customerInfo = {
    firstName: 'Muhammed',
    lastName: 'Sarajlic',
    companyName: 'INAT Digital',
    isCompany: true,
    mainPhone: '38762409924',
    homePhone: '',
    workPhone: '',
    mobilePhone: '',
    otherPhone: '',
    faxPhone: '',
    email: 'muhamed@inat.digital',
    address: 'Hamida 25',
    city: 'Zenica',
    state: 'Federacija BiH',
    country: 'Bosnia and Herzegovina',
    postalCode: '72000',
  };
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px] h-[2000px]'>
        <div>
          <Navbar />
        </div>
        <div className='w-full px-4 flex items-start'>
          <div className='w-2/3 flex items-center space-x-3'>
            <div className='bg-[#FAFAFA] p-4 rounded-full flex items-center justify-center'>
              <img
                src={
                  customerInfo.isCompany ? icons.officeIcon : icons.personIcon
                }
                alt='office'
                className='w-5 h-5'
              />
            </div>
            <div>
              <p className='text-3xl font-extrabold text-heading'>
                {customerInfo.isCompany
                  ? customerInfo.companyName
                  : `${customerInfo.firstName} ${customerInfo.lastName}`}
              </p>
              {customerInfo.isCompany && (
                <p className='text-primary'>
                  {customerInfo.firstName} {customerInfo.lastName}
                </p>
              )}
            </div>
          </div>
          <div className='w-1/3'>
            <div className='w-full flex items-center justify-end space-x-2 text-re'>
              <ButtonIcon
                name='Email'
                icon={icons.mailWhiteIcon}
                customStyle='border-transparent bg-bg-primary hover:bg-bg-primary-hover'
                customTextStyle='text-white'
                customImageStyle='w-5 h-5'
              />
              <ButtonIcon name='Edit' icon={icons.editIcon} />
              <ButtonIcon
                name='Archive'
                icon={icons.archiveIcon}
                customTextStyle='text-red-600'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
