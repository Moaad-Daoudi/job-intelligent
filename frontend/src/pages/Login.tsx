import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Save token and info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_role', data.role);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-teal-600 tracking-tight inline-block mb-2">DataNexus</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">Welcome back</h1>
          <p className="text-slate-500 mt-2">Enter your details to access your account.</p>
        </div>

        <div className="space-y-4 mb-8">
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Log in with Google
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative bg-white px-4 text-sm text-slate-400 font-medium">Or continue with email</div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium">{error}</div>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <a href="#" className="text-sm font-bold text-teal-600 hover:text-teal-700">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition shadow-lg shadow-teal-500/30 flex justify-center items-center gap-2 disabled:opacity-70">
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 font-medium">
          Don't have an account? <Link to="/register" className="text-teal-600 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}