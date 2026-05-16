import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <Link to="/" className="flex justify-center mb-8 gap-2 items-center text-2xl font-bold text-teal-600">
          <Brain size={28} /> DataNexus AI
        </Link>
        
        <h2 className="text-2xl font-bold mb-6">Create your account</h2>
        <form className="space-y-4">
          <select className="w-full p-4 border border-slate-200 rounded-xl outline-none bg-white">
            <option>I am a Candidate</option>
            <option>I am a Recruiter</option>
          </select>
          <input className="w-full p-4 border border-slate-200 rounded-xl outline-none" placeholder="Email Address" />
          <input className="w-full p-4 border border-slate-200 rounded-xl outline-none" type="password" placeholder="Password" />
          <button className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition">Create Account</button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-teal-600 font-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
}