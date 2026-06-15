import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_name', `${formData.first_name} ${formData.last_name}`);
      localStorage.setItem('user_role', role as string);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 py-12">
      <div className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-extrabold text-teal-600 tracking-tight inline-block mb-2">DataNexus</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">Create an account</h1>
          <p className="text-slate-500 mt-2">Join the ultimate network for AI & Data professionals.</p>
        </div>

        {/* Role Selection */}
        <div className="mb-10">
          <label className="block text-sm font-bold text-slate-700 mb-4 text-center">I am looking to...</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setRole('candidate')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${role === 'candidate' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-teal-300 text-slate-600 bg-white'}`}
            >
              <Briefcase size={32} className={role === 'candidate' ? 'text-teal-600' : 'text-slate-400'} />
              <span className="font-bold">Find a Job</span>
            </button>
            <button 
              onClick={() => setRole('recruiter')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${role === 'recruiter' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600 bg-white'}`}
            >
              <Building2 size={32} className={role === 'recruiter' ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="font-bold">Hire Talent</span>
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium">{error}</div>}

        {role && (
          <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleRegister}>
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative bg-white px-4 text-sm text-slate-400 font-medium">
                {role === 'candidate' ? 'Candidate Details' : 'Recruiter Details'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="John" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a strong password" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" />
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 ${role === 'candidate' ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}>
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 mt-8 font-medium">
          Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}