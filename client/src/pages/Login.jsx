import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('demo@tradeforge.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      toast.success('Successfully logged in!');
      navigate('/');
    } else {
      toast.error(res.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center p-6 text-primary">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-active to-transparent opacity-50"></div>
        
        <h1 className="text-3xl font-heading font-bold tracking-wider text-center mb-2">TradeForge</h1>
        <p className="text-muted text-center text-sm mb-8">Sign in to your paper trading account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2 font-bold">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-active transition-colors text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2 font-bold">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-active transition-colors text-primary"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-active hover:bg-active/90 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted mb-2">Recruiter Demo Mode</p>
          <button 
            onClick={() => {
              setEmail('demo@tradeforge.com');
              setPassword('password');
              toast.success('Demo credentials loaded!');
            }}
            className="text-active text-sm hover:underline"
          >
            Click here to load Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
