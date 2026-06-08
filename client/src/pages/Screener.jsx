import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Screener = () => {
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/market/screener').then(res => setStocks(res.data)).catch(console.error);
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-border h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-heading font-bold">Market Screener</h2>
        <p className="text-sm text-muted mt-1">Top NSE Stocks by Market Cap</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium">Sector</th>
              <th className="p-4 font-medium text-right">Live Price</th>
              <th className="p-4 font-medium text-right">P/E Ratio</th>
              <th className="p-4 font-medium text-right">M.Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stocks.map(stock => (
              <tr 
                key={stock.symbol} 
                className="hover:bg-background/50 transition-colors cursor-pointer"
                onClick={() => navigate('/trade')}
              >
                <td className="p-4">
                  <div className="font-bold">{stock.symbol.replace('.NS', '')}</div>
                  <div className="text-xs text-muted">{stock.name}</div>
                </td>
                <td className="p-4 text-sm text-muted">{stock.sector}</td>
                <td className="p-4 tabular-nums text-right font-bold">
                  {stock.currentPrice ? `₹${stock.currentPrice.toFixed(2)}` : '---'}
                </td>
                <td className="p-4 tabular-nums text-right">{stock.pe}</td>
                <td className="p-4 tabular-nums text-right">{stock.mcap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Screener;
