import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { useParams } from 'react-router';
import { getReview, submitReview } from '../services/Public';

export default function Review() {
  const { token = '' } = useParams(); const [business, setBusiness] = useState(''); const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [sent, setSent] = useState(false); const [error, setError] = useState('');
  useEffect(() => { getReview(token).then((response) => { setBusiness(response.data.workspace); if (response.data.rating) { setRating(response.data.rating); setComment(response.data.comment ?? ''); } }).catch(() => setError('This review link is invalid or has expired.')); }, [token]);
  const send = async (event: FormEvent) => { event.preventDefault(); try { await submitReview(token, { rating, comment }); setSent(true); } catch { setError('Please choose a rating and try again.'); } };
  if (sent) return <main className='grid min-h-screen place-items-center bg-gray-50 p-6'><div className='text-center'><CheckCircle2 className='mx-auto h-12 w-12 text-bg-primary' /><h1 className='mt-4 text-2xl font-semibold'>Thank you</h1><p className='mt-2 text-gray-600'>Your feedback helps {business} improve.</p></div></main>;
  return <main className='grid min-h-screen place-items-center bg-gray-50 p-6'><form onSubmit={send} className='w-full max-w-md border border-gray-200 bg-white p-7 shadow-sm'><h1 className='text-2xl font-semibold'>How did we do?</h1><p className='mt-1 text-gray-600'>{business}</p><div className='mt-7 flex gap-2' aria-label='Rating'>{[1, 2, 3, 4, 5].map((value) => <button type='button' key={value} aria-label={`${value} stars`} onClick={() => setRating(value)}><Star className={`h-8 w-8 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} /></button>)}</div><label className='mt-6 block text-sm font-medium'>Anything else?<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} className='mt-1 w-full border border-gray-300 p-2.5' /></label>{error && <p role='alert' className='mt-3 text-sm text-red-600'>{error}</p>}<button disabled={rating === 0} className='mt-5 w-full bg-bg-primary px-4 py-3 font-medium text-white disabled:opacity-50'>Send feedback</button></form></main>;
}
