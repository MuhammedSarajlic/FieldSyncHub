import CustomSmallButton from '../../../CustomElements/CustomSmallButton';
import CustomerPropertyItem from './CustomerPropertyItem';

const CustomerProperties = () => {
  const properties = [
    {
      id: 1,
      street: 'Hamdia 25',
      city: 'Zenica',
      state: 'Federacija BiH',
      postalCode: '72000',
      country: 'Bosnia and Herzegovina',
      isBillingAddress: true,
    },
    {
      id: 2,
      street: '1815 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90026',
      country: 'United States',
      isBillingAddress: false,
    },
  ];
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-6'>
        <p className='font-semibold text-xl'>Customer Properties</p>
        <CustomSmallButton
          title='New property'
          customStyle='px-4 border-transparent bg-bg-primary hover:bg-bg-primary-hover'
          customTextStyle='text-white'
        />
        {/* <button
          className={`flex bg-bg-primary rounded-lg py-1.5 px-4 cursor-pointer hover:bg-bg-primary-hover transition-colors duration-200`}
        >
          <p className={`text-sm font-semibold text-white`}>New property</p>
        </button> */}
      </div>
      {properties.map((property) => (
        <CustomerPropertyItem key={property.id} property={property} />
      ))}
      {/* <div className='p-2 bg-[#FAFAFA] rounded-lg'>
        <div className='flex items-center pb-2 space-x-3'>
          <p className='text-lg font-semibold'>Hamida 25</p>
          <div className='px-2 py-1 bg-bg-primary/20 rounded-full'>
            <p className='text-xs text-heading font-medium'>Billing property</p>
          </div>
        </div>
        <p className='text-sm'>Hamdia 25 </p>
        <p className='text-sm'>Zenica, Federacija BiH 72000, </p>
        <p className='text-sm'>Bosnia and Herzegovina</p>
      </div>
      <div className='p-2 bg-[#FAFAFA] rounded-lg'>
        <div className='flex items-center pb-2 space-x-3'>
          <p className='text-lg font-semibold'>1815 Sunset Blvd</p>
        </div>
        <p className='text-sm'>1815 Sunset Blvd</p>
        <p className='text-sm'>Los Angeles, CA 90026, </p>
        <p className='text-sm'>United States</p>
      </div> */}
    </div>
  );
};

export default CustomerProperties;
