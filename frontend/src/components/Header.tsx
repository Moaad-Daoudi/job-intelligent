export default function Header() {
  return (
    <nav className="flex justify-between items-center px-12 py-6 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-teal-600">DataNexus AI</h1>
      <div className="flex gap-8 text-sm font-medium text-slate-600">
        <a href="#">AI Roles</a>
        <a href="#">Data Science Jobs</a>
        <a href="#">Employer Solutions</a>
      </div>
      <div className="space-x-4">
        <button className="text-slate-600">Log In</button>
        <button className="bg-teal-500 text-white px-5 py-2 rounded-full font-semibold">Sign Up</button>
      </div>
    </nav>
  );
}