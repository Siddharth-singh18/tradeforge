import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    api.get('/portfolio').then(res => setPortfolio(res.data)).catch(console.error);
  }, []);

  if (!portfolio) return <div className="p-8">Loading Dashboard...</div>;

  const pieData = portfolio.holdings.map(h => ({
    name: h.symbol.replace('.NS', ''),
    value: h.currentValue
  }));
  
  // Simulated historical portfolio data for the line chart
  const lineData = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: portfolio.totalInvested * (1 + (Math.sin(i / 5) * 0.1)) + (i * 500)
  }));
  lineData.push({ day: 31, value: portfolio.totalValue });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl">
          <div className="text-sm text-muted uppercase tracking-wider mb-2">Total Value</div>
          <div className="text-3xl font-mono tabular-nums">₹{portfolio.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl">
          <div className="text-sm text-muted uppercase tracking-wider mb-2">Invested</div>
          <div className="text-3xl font-mono tabular-nums">₹{portfolio.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl">
          <div className="text-sm text-muted uppercase tracking-wider mb-2">Total Returns</div>
          <div className={`text-3xl font-mono tabular-nums flex items-center ${portfolio.totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {portfolio.totalPnl >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
            ₹{Math.abs(portfolio.totalPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl">
          <h3 className="text-lg font-heading mb-4">Portfolio Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="day" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid #1E2028' }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Value']}
                />
                <Line type="monotone" dataKey="value" stroke="#1877F2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl">
          <h3 className="text-lg font-heading mb-4">Allocation</h3>
          {pieData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid #1E2028' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted">No holdings</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
