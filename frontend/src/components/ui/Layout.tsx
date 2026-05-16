import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="flex justify-between items-center px-12 py-6 bg-white border-b border-slate-100">
        <Link to="/" className="text-2xl font-bold text-teal-600">DataNexus AI</Link>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <Link to="/jobs" className="hover:text-teal-600">Jobs</Link>
          <Link to="/companies" className="hover:text-teal-600 transition">Companies</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-600 font-semibold hover:text-teal-600 transition">Log In</Link>
          <Link to="/register" className="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-teal-600 transition">Sign Up</Link>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="py-12 px-16 bg-white border-t text-center text-slate-500 text-sm">
        © 2024 DataNexus AI - Professional Data & AI Careers
      </footer>
    </div>
  );
}