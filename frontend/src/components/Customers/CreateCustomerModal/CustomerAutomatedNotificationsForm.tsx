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
          value={customer.quoteFollowUps}
          onChange={(e) =>
            setCustomer({ ...customer, quoteFollowUps: e.target.checked })
          }
        />
        <CustomerModalNotificationItem
          title='Assessment and visit reminders'
          subtitle='Remind your client of an upcoming assessment or visit.'
          labelId='customer_assesment_visit_follow_up'
          value={customer.visitReminders}
          onChange={(e) =>
            setCustomer({ ...customer, visitReminders: e.target.checked })
          }
        />
        <CustomerModalNotificationItem
          title='Job follow-up'
          subtitle='Follow up when you close a job.'
          labelId='customer_job_follow_up'
          value={customer.jobFollowUps}
          onChange={(e) =>
            setCustomer({ ...customer, jobFollowUps: e.target.checked })
          }
        />
        <CustomerModalNotificationItem
          title='Invoice follow-up'
          subtitle='Follow up on an overdue invoice.'
          labelId='customer_invoice_follow_up'
          value={customer.invoiceFollowUps}
          onChange={(e) =>
            setCustomer({ ...customer, invoiceFollowUps: e.target.checked })
          }
        />
      </div>
    </div>
  );
};

export default CustomerAutomatedNotificationsForm;
