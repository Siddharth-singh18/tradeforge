import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderForm = ({ symbol }) => {
  const [type, setType] = useState('MARKET');
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        symbol,
        type,
        side,
        quantity: Number(quantity),
        price: type === 'MARKET' ? undefined : Number(price)
      };
      
      const res = await api.post('/orders', payload);
      toast.success(`Order placed: ${res.data.side} ${res.data.type}`);
      setQuantity('');
      if (type !== 'MARKET') setPrice('');
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 h-full flex flex-col">
      <h3 className="text-lg font-heading mb-6">Place Order</h3>
      
      <div className="flex rounded-lg border border-border p-1 bg-background mb-6">
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${side === 'BUY' ? 'bg-gain text-white' : 'text-muted hover:text-primary'}`}
          onClick={() => setSide('BUY')}
        >BUY</button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${side === 'SELL' ? 'bg-loss text-white' : 'text-muted hover:text-primary'}`}
          onClick={() => setSide('SELL')}
        >SELL</button>
      </div>

      <div className="flex space-x-4 mb-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="radio" checked={type === 'MARKET'} onChange={() => setType('MARKET')} className="text-active" />
          <span className="text-sm">Market</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="radio" checked={type === 'LIMIT'} onChange={() => setType('LIMIT')} className="text-active" />
          <span className="text-sm">Limit</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Quantity</label>
          <input 
            type="number" 
            min="1" 
            required 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-background border border-border rounded px-4 py-3 text-primary focus:border-active focus:outline-none tabular-nums"
          />
        </div>

        {type !== 'MARKET' && (
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Price</label>
            <input 
              type="number" 
              step="0.05"
              required 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-background border border-border rounded px-4 py-3 text-primary focus:border-active focus:outline-none tabular-nums"
            />
          </div>
        )}

        <div className="mt-auto pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all ${side === 'BUY' ? 'bg-gain hover:opacity-90' : 'bg-loss hover:opacity-90'} text-white disabled:opacity-50`}
          >
            {loading ? 'Processing...' : `${side} ${symbol}`}
          </button>
        </div>
      </form>

    </div>
  );
};

export default OrderForm;
