import { useEffect, useState } from 'react';
import { BadgeDollarSign, Check, CreditCard, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthProvider';
import { changePlan, getSubscription, Subscription as SubscriptionData } from '../services/Subscription';

const plans = [
  { id: 'Starter', price: '$29', description: 'For solo operators getting organized.' },
  { id: 'Team', price: '$79', description: 'For growing field teams.' },
  { id: 'Pro', price: '$149', description: 'For multi-team operations.' },
];

export default function Subscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!user?.workspace?.id) return;
    const response = await getSubscription();
    setSubscription(response.data);
    setSeatCount(response.data.seatCount);
  };
  useEffect(() => { void load(); }, [user?.workspace?.id]);

  const selectPlan = async (plan: string) => {
    try {
      const response = await changePlan(plan, seatCount);
      setMessage(response.data.message || 'Plan selection saved.');
      if (response.data.checkoutUrl) { window.location.assign(response.data.checkoutUrl); return; }
      await load();
    } catch { setMessage('Plan could not be updated.'); }
  };

  return <div className='flex min-h-screen bg-gray-50'><Sidebar /><div className='flex-1 md:ml-64'><Navbar /><main className='p-4 sm:p-6'><div className='mb-7 flex items-start justify-between gap-4'><div><div className='flex items-center gap-2'><BadgeDollarSign className='text-bg-primary' /><h1 className='text-2xl font-semibold'>Billing</h1></div><p className='mt-1 text-sm text-gray-500'>Choose the plan and team size that fit your operation.</p></div><button type='button' aria-label='Refresh subscription' onClick={() => void load()} className='border border-gray-300 bg-white p-2 text-gray-600'><RefreshCw className='h-4 w-4' /></button></div>{message && <p role='status' className='mb-4 text-sm text-bg-primary'>{message}</p>}<div className='mb-6 flex items-center gap-3 border border-gray-200 bg-white p-4'><CreditCard className='h-5 w-5 text-bg-primary' /><div><p className='font-medium text-gray-900'>Current status: {subscription?.status || 'Loading'}</p><p className='text-sm text-gray-500'>{subscription?.trialEndsAt ? `Trial ends ${new Date(subscription.trialEndsAt).toLocaleDateString()}` : 'Select a plan to continue.'}</p></div><label className='ml-auto text-sm text-gray-600'>Seats<input type='number' min='1' max='500' value={seatCount} onChange={(event) => setSeatCount(Math.max(1, Number(event.target.value)))} className='ml-2 w-20 border border-gray-300 px-2 py-1.5' /></label></div><div className='grid gap-4 md:grid-cols-3'>{plans.map((plan) => <section key={plan.id} className={`border bg-white p-5 shadow-sm ${subscription?.plan === plan.id ? 'border-bg-primary ring-1 ring-bg-primary' : 'border-gray-200'}`}><h2 className='text-lg font-semibold'>{plan.id}</h2><p className='mt-2 text-3xl font-bold'>{plan.price}<span className='text-sm font-normal text-gray-500'>/month</span></p><p className='mt-2 min-h-10 text-sm text-gray-500'>{plan.description}</p><ul className='mt-5 space-y-2 text-sm text-gray-700'><li className='flex gap-2'><Check className='h-4 w-4 text-bg-primary' /> Customer and job management</li><li className='flex gap-2'><Check className='h-4 w-4 text-bg-primary' /> Quotes and invoices</li><li className='flex gap-2'><Check className='h-4 w-4 text-bg-primary' /> Team collaboration</li></ul><button type='button' onClick={() => void selectPlan(plan.id)} className='mt-6 w-full bg-bg-primary px-4 py-2.5 text-sm font-medium text-white'>{subscription?.plan === plan.id ? 'Selected plan' : 'Choose plan'}</button></section>)}</div></main></div></div>;
}
