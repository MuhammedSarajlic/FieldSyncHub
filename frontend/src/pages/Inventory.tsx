import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, RefreshCw, SlidersHorizontal } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthProvider';
import { adjustInventory, getInventory, InventoryItem } from '../services/Inventory';

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [quantityDelta, setQuantityDelta] = useState('');
  const [reason, setReason] = useState('Restock');
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!user?.workspace?.id) return;
    const response = await getInventory();
    setItems(response.data);
  };

  useEffect(() => { void load(); }, [user?.workspace?.id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      await adjustInventory(selected.id, { quantityDelta: Number(quantityDelta), reason });
      setSelected(null);
      setQuantityDelta('');
      setMessage('Inventory updated.');
      await load();
    } catch {
      setMessage('Inventory could not be updated. Check the quantity and reason.');
    }
  };

  return <div className='flex min-h-screen bg-gray-50'><Sidebar /><div className='flex-1 md:ml-64'><Navbar /><main className='p-4 sm:p-6'>
    <div className='mb-7 flex items-start justify-between gap-4'><div><div className='flex items-center gap-2'><Boxes className='text-bg-primary' /><h1 className='text-2xl font-semibold'>Inventory</h1></div><p className='mt-1 text-sm text-gray-500'>Track material stock and flag items that need attention.</p></div><button type='button' aria-label='Refresh inventory' onClick={() => void load()} className='border border-gray-300 bg-white p-2 text-gray-600'><RefreshCw className='h-4 w-4' /></button></div>
    {message && <p role='status' className='mb-4 text-sm text-bg-primary'>{message}</p>}
    <div className='overflow-x-auto border border-gray-200 bg-white shadow-sm'><table className='min-w-full text-left text-sm'><thead className='border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500'><tr><th className='px-4 py-3'>Material</th><th className='px-4 py-3'>SKU</th><th className='px-4 py-3'>On hand</th><th className='px-4 py-3'>Reorder point</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'><span className='sr-only'>Actions</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className='border-b border-gray-100'><td className='px-4 py-4 font-medium text-gray-900'>{item.name}</td><td className='px-4 py-4 text-gray-500'>{item.sku || '—'}</td><td className='px-4 py-4'>{item.stockLevel} {item.unitOfMeasure}</td><td className='px-4 py-4'>{item.reorderPoint} {item.unitOfMeasure}</td><td className='px-4 py-4'>{item.lowStock ? <span className='inline-flex items-center gap-1 text-amber-700'><AlertTriangle className='h-4 w-4' /> Low stock</span> : <span className='text-emerald-700'>In stock</span>}</td><td className='px-4 py-4 text-right'><button type='button' onClick={() => setSelected(item)} className='inline-flex items-center gap-1 border border-gray-300 px-3 py-1.5 text-sm text-gray-700'><SlidersHorizontal className='h-4 w-4' /> Adjust</button></td></tr>)}</tbody></table>{items.length === 0 && <p className='p-8 text-center text-sm text-gray-500'>No material items are in the pricebook yet.</p>}</div>
    {selected && <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4' role='dialog' aria-modal='true' aria-labelledby='adjust-inventory-title'><form onSubmit={submit} className='w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl'><h2 id='adjust-inventory-title' className='text-lg font-semibold'>Adjust {selected.name}</h2><p className='mt-1 text-sm text-gray-500'>Current stock: {selected.stockLevel} {selected.unitOfMeasure}</p><label className='mt-5 block text-sm font-medium text-gray-700'>Quantity change<input required type='number' step='0.001' value={quantityDelta} onChange={(event) => setQuantityDelta(event.target.value)} className='mt-1 w-full border border-gray-300 p-2.5' placeholder='Use a negative number for consumption' /></label><label className='mt-4 block text-sm font-medium text-gray-700'>Reason<input required value={reason} onChange={(event) => setReason(event.target.value)} className='mt-1 w-full border border-gray-300 p-2.5' /></label><div className='mt-6 flex justify-end gap-3'><button type='button' onClick={() => setSelected(null)} className='border border-gray-300 px-4 py-2 text-sm'>Cancel</button><button type='submit' className='bg-bg-primary px-4 py-2 text-sm font-medium text-white'>Save adjustment</button></div></form></div>}
  </main></div></div>;
}
