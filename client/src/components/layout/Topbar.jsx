import { Bell, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MarketTicker = () => {
  // Mock NIFTY 50 ticker data
  const tickerData = [
    { symbol: 'NIFTY 50', price: 21500.50, change: 120.30, percent: 0.56 },
    { symbol: 'SENSEX', price: 71200.10, change: 450.20, percent: 0.64 },
    { symbol: 'BANKNIFTY', price: 47500.80, change: -150.40, percent: -0.32 },
    { symbol: 'RELIANCE', price: 2950.50, change: 15.20, percent: 0.51 },
    { symbol: 'TCS', price: 3920.00, change: -20.10, percent: -0.51 },
  ];

  return (
    <div className="flex-1 overflow-hidden whitespace-nowrap mx-4">
      <div className="inline-block animate-[ticker_30s_linear_infinite]">
        {tickerData.map((item, i) => (
          <span key={i} className="inline-flex items-center space-x-2 mx-6 text-sm">
            <span className="font-bold">{item.symbol}</span>
            <span>{item.price.toFixed(2)}</span>
            <span className={item.change >= 0 ? 'text-gain' : 'text-loss'}>
              {item.change >= 0 ? '+' : ''}{item.percent}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Topbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center px-6 sticky top-0 z-50">
      <h1 className="text-2xl font-heading font-bold text-active tracking-wider mr-8">TF</h1>
      
      <MarketTicker />

      <div className="flex items-center space-x-6 border-l border-border pl-6">
        <div className="text-right">
          <div className="text-xs text-muted uppercase tracking-wider">Virtual Funds</div>
          <div className="font-mono font-bold tabular-nums">
            ₹{user?.virtualFunds?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <button className="relative text-muted hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-active rounded-full border-2 border-surface"></span>
        </button>
        
        <button 
          onClick={logout} 
          className="text-muted hover:text-loss transition-colors flex items-center space-x-2"
          title="Logout"
        >
          <UserCircle size={24} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
