import CustomerModalNotificationItem from './CustomerModalNotificationItem';

const CustomerAutomatedNotificationsForm = () => {
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
        />
        <CustomerModalNotificationItem
          title='Assessment and visit reminders'
          subtitle='Remind your client of an upcoming assessment or visit.'
          labelId='customer_assesment_visit_follow_up'
        />
        <CustomerModalNotificationItem
          title='Job follow-up'
          subtitle='Follow up when you close a job.'
          labelId='customer_job_follow_up'
        />
        <CustomerModalNotificationItem
          title='Invoice follow-up'
          subtitle='Follow up on an overdue invoice.'
          labelId='customer_invoice_follow_up'
        />
      </div>
    </div>
  );
};

export default CustomerAutomatedNotificationsForm;
