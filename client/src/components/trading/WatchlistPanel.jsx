import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

const WatchlistPanel = () => {
  const { socket, subscribeToSymbols, unsubscribeFromSymbols } = useSocket();
  const [stocks, setStocks] = useState([
    { symbol: 'RELIANCE.NS', price: null, change: null, percent: null },
    { symbol: 'TCS.NS', price: null, change: null, percent: null },
    { symbol: 'HDFCBANK.NS', price: null, change: null, percent: null }
  ]);

  useEffect(() => {
    if (socket) {
      const symbols = stocks.map(s => s.symbol);
      subscribeToSymbols(symbols);

      socket.on('price_update', (data) => {
        setStocks(prev => prev.map(s => {
          if (s.symbol === data.symbol) {
            return { ...s, price: data.price, change: data.change, percent: data.changePercent, flash: data.change >= 0 ? 'gain' : 'loss' };
          }
          return s;
        }));
      });
    }

    return () => {
      if (socket) {
        unsubscribeFromSymbols(stocks.map(s => s.symbol));
        socket.off('price_update');
      }
    };
  }, [socket]); // Simplified dependency for demo

  // Clear flash animation after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setStocks(prev => prev.map(s => ({ ...s, flash: null })));
    }, 400);
    return () => clearTimeout(timer);
  }, [stocks]);

  return (
    <div className="mt-8 flex-1 overflow-y-auto">
      <div className="px-4 mb-2 flex justify-between items-center text-xs uppercase tracking-wider text-muted font-bold">
        <span>Watchlist 1</span>
        <button className="hover:text-primary">+</button>
      </div>
      <div className="space-y-1">
        {stocks.map(stock => (
          <div 
            key={stock.symbol} 
            className={`px-4 py-3 flex justify-between items-center hover:bg-surface cursor-pointer transition-colors ${stock.flash === 'gain' ? 'flash-gain' : stock.flash === 'loss' ? 'flash-loss' : ''}`}
          >
            <div className="font-medium text-sm">{stock.symbol.replace('.NS', '')}</div>
            <div className="text-right">
              <div className={`text-sm tabular-nums ${stock.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                {stock.price ? stock.price.toFixed(2) : '---'}
              </div>
              <div className="text-xs text-muted">
                {stock.percent ? `${stock.percent >= 0 ? '+' : ''}${stock.percent}%` : '--'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPanel;
