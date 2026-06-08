import { useEffect, useState } from 'react';
import api from '../services/api';
import { Download } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).catch(console.error);
  }, []);

  const exportCSV = () => {
    const headers = ['Date', 'Symbol', 'Side', 'Type', 'Qty', 'Price', 'Status'];
    const rows = orders.map(o => [
      new Date(o.createdAt).toLocaleString(),
      o.symbol,
      o.side,
      o.type,
      o.quantity,
      o.price || o.executedPrice || 'MKT',
      o.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tradeforge_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface rounded-xl border border-border h-full flex flex-col">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-heading font-bold">Order History</h2>
        <button onClick={exportCSV} className="flex items-center space-x-2 px-4 py-2 bg-active/10 text-active rounded hover:bg-active/20 transition-colors text-sm">
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Time</th>
              <th className="p-4 font-medium">Symbol</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium text-right">Qty</th>
              <th className="p-4 font-medium text-right">Price</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-background/50 transition-colors">
                <td className="p-4 text-sm text-muted">{new Date(order.createdAt).toLocaleTimeString()}</td>
                <td className="p-4 font-medium">{order.symbol.replace('.NS', '')}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.side === 'BUY' ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'}`}>
                    {order.side} {order.type}
                  </span>
                </td>
                <td className="p-4 tabular-nums text-right">{order.quantity}</td>
                <td className="p-4 tabular-nums text-right">₹{order.executedPrice?.toFixed(2) || order.price?.toFixed(2) || 'MKT'}</td>
                <td className="p-4">
                  <span className={`text-sm ${order.status === 'EXECUTED' ? 'text-gain' : 'text-muted'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-muted">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
