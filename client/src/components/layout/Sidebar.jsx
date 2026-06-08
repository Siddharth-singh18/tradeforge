import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, ListOrdered, BarChart2 } from 'lucide-react';
import WatchlistPanel from '../trading/WatchlistPanel';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Trade', path: '/trade', icon: <LineChart size={18} /> },
    { name: 'Orders', path: '/orders', icon: <ListOrdered size={18} /> },
    { name: 'Screener', path: '/screener', icon: <BarChart2 size={18} /> },
  ];

  return (
    <aside className="w-72 border-r border-border bg-[#0a0b0f] flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-surface text-active border-l-4 border-active shadow-[inset_4px_0_0_0_#1877F2]'
                  : 'text-muted hover:text-primary hover:bg-surface border-l-4 border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-border mx-4 my-2"></div>
      
      <WatchlistPanel />
    </aside>
  );
};

export default Sidebar;
