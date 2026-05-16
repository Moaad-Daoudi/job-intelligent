import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-100 px-12 py-5 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-teal-600">DataNexus AI</Link>
        <div className="flex gap-6 text-sm font-semibold text-slate-600">
          <Link to="/jobs">Jobs</Link>
          <Link to="/companies">Companies</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-600">Login</Link>
          <Link to="/register" className="bg-teal-500 text-white px-5 py-2 rounded-full">Register</Link>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-white border-t p-12 text-center text-slate-500 text-sm">
        © 2024 DataNexus AI - Confidential
      </footer>
    </div>
  );
}