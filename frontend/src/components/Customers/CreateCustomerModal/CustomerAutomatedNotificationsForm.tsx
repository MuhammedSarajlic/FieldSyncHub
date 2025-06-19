import { TAddCustomer } from '../../../types/Customer';
import CustomerModalNotificationItem from './CustomerModalNotificationItem';

interface ICustomerAutomatedNotificationsForm {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const CustomerAutomatedNotificationsForm = ({
  customer,
  setCustomer,
}: ICustomerAutomatedNotificationsForm) => {
  return (
    <div className='space-y-2'>
      <p className='px-2 py-1 font-medium text-lg bg-[#FAFAFA] rounded-md'>
        Automated notifications
      </p>
      <div className='px-2 space-y-2'>
        <CustomerModalNotificationItem
          title='Quote follow-up'
          subtitle='Follow up on an outstanding quote.'
          labelId='customer_quote_follow_up'
          value={customer.isReceiveQuoteNotifications}
          onChange={(e) =>
            setCustomer({
              ...customer,
              isReceiveQuoteNotifications: e.target.checked,
            })
          }
        />

        <CustomerModalNotificationItem
          title='Job follow-up'
          subtitle='Follow up when you close a job.'
          labelId='customer_job_follow_up'
          value={customer.isReceiveJobNotifications}
          onChange={(e) =>
            setCustomer({
              ...customer,
              isReceiveJobNotifications: e.target.checked,
            })
          }
        />

        <CustomerModalNotificationItem
          title='Invoice follow-up'
          subtitle='Follow up on an overdue invoice.'
          labelId='customer_invoice_follow_up'
          value={customer.isReceiveInvoiceNotifications}
          onChange={(e) =>
            setCustomer({
              ...customer,
              isReceiveInvoiceNotifications: e.target.checked,
            })
          }
        />
      </div>
    </div>
  );
};

export default CustomerAutomatedNotificationsForm;
