import { TProperty } from '../../../../types/Property';

interface ICustomerPropertyItem {
  property: TProperty;
}

const CustomerPropertyItem = ({ property }: ICustomerPropertyItem) => {
  return (
    <div className='p-2 bg-[#FAFAFA] rounded-lg'>
      <div className='flex items-center pb-2 space-x-3'>
        <p className='text-lg font-semibold'>{property.street}</p>
        {property.isBillingAddress && (
          <div className='px-2 py-1 bg-bg-primary/20 rounded-full'>
            <p className='text-xs text-heading font-medium'>Billing property</p>
          </div>
        )}
      </div>
      <p className='text-sm'>{property.street}</p>
      <p className='text-sm'>{`${property.city}, ${property.state} ${property.postalCode},`}</p>
      <p className='text-sm'>{property.country}</p>
    </div>
  );
};

export default CustomerPropertyItem;
