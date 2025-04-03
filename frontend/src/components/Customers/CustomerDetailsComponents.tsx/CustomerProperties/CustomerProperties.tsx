import icons from '../../../../constants/icons';
import { TProperty } from '../../../../types/Property';
import CustomSmallButton from '../../../CustomElements/CustomSmallButton';
import CustomerPropertyItem from './CustomerPropertyItem';

interface ICustomerProperties {
  properties: TProperty[];
}

const CustomerProperties = ({ properties }: ICustomerProperties) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-6'>
        <p className='font-semibold text-xl'>Customer Properties</p>
        <CustomSmallButton
          title='New property'
          customStyle='px-4 border-transparent bg-bg-primary hover:bg-bg-primary-hover'
          customTextStyle='text-white'
        />
      </div>
      {properties.length > 0 ? (
        properties.map((property) => (
          <CustomerPropertyItem key={property.id} property={property} />
        ))
      ) : (
        <div className='flex items-center space-x-3'>
          <div className='bg-[#FAFAFA] p-4 rounded-full flex items-center justify-center'>
            <img src={icons.homeIcon} alt='office' className='w-5 h-5' />
          </div>
          <div>
            <p className='font-bold text-heading'>No properties</p>
            <p className='text-primary text-sm'>
              No properties listed for this client yet
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProperties;
