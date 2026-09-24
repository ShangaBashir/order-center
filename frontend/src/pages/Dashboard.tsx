
import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [link, setLink] = useState('');

  const fetchOrders = async () => {
    const res = await api.get('/orders');
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/orders', { productLink: link });
    setLink('');
    fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Your Dashboard</h2>
      
      <form onSubmit={handleOrder} className="flex gap-4 mb-8 bg-white p-4 rounded-lg shadow">
        <input className="border p-2 rounded flex-grow" placeholder="Product Link (e.g. Amazon, SHEIN)" value={link} onChange={e=>setLink(e.target.value)} required />
        <button type="submit" className="btn-primary">Place Order</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Product Link</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-b">
                <td className="p-4 truncate max-w-xs">{o.productLink}</td>
                <td className="p-4">
                  <span className="bg-brand text-white text-xs px-2 py-1 rounded">{o.status}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
