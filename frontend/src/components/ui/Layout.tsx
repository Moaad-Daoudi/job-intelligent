import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('user_role');
    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    setUserName(null);
    setUserRole(null);
    navigate('/');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-teal-600 font-bold font-semibold" : "text-slate-600 font-semibold hover:text-teal-600 transition";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-12 py-5 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-extrabold text-teal-600 tracking-tight">DataNexus</Link>
          <div className="hidden lg:flex gap-8 text-sm">
            <Link to="/jobs" className={isActive("/jobs")}>Jobs</Link>
            <Link to="/companies" className={isActive("/companies")}>Companies</Link>
            {userRole === 'candidate' && (
              <>
                <Link to="/candidate/dashboard" className={isActive("/candidate/dashboard")}>Dashboard</Link>
                <Link to="/candidate/profile" className={isActive("/candidate/profile")}>Profile</Link>
              </>
            )}
            {userRole === 'recruiter' && (
              <>
                <Link to="/recruiter/dashboard" className={isActive("/recruiter/dashboard")}>Dashboard</Link>
              </>
            )}
            {userRole === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>Dashboard</Link>
              </>
            )}
            <Link to="/about" className={isActive("/about")}>About</Link>
            <Link to="/pricing" className={isActive("/pricing")}>Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {userName ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                {userName}
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition" title="Log Out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 font-semibold hover:text-teal-600 transition text-sm">Log In</Link>
              <Link to="/register" className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition">Register</Link>
            </>
          )}
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <Link to="/post-job" className="bg-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition shadow-md shadow-teal-200">Post a Job</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white">DataNexus</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The premier destination for Data Science, AI, and Machine Learning professionals to find their next big opportunity.
            </p>
            <div className="flex gap-4">
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Candidates</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/jobs" className="hover:text-teal-400 transition">Search Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-teal-400 transition">Browse Companies</Link></li>
              <li><Link to="/salaries" className="hover:text-teal-400 transition">Salary Calculator</Link></li>
              <li><Link to="/register" className="hover:text-teal-400 transition">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Employers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/post-job" className="hover:text-teal-400 transition">Post a Job</Link></li>
              <li><Link to="/pricing" className="hover:text-teal-400 transition">Pricing Plans</Link></li>
              <li><Link to="/search-resumes" className="hover:text-teal-400 transition">Search Resumes</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400 transition">Contact Sales</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest AI & Data jobs delivered to your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800 text-sm px-4 py-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-teal-500 border border-slate-700"
              />
              <button className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2024 DataNexus AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}