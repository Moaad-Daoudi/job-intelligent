import { Search, Brain, BarChart, Cpu, Cloud, Briefcase, Users, CheckCircle } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-24 px-8 text-center">
        <h2 className="text-5xl font-extrabold mb-6">Your Future in Data Science & AI</h2>
        <p className="mb-10 text-blue-100 text-xl font-light">Connect. Innovate. Grow.</p>
        <div className="max-w-4xl mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 flex gap-2 shadow-2xl">
          <input className="flex-1 p-4 bg-transparent text-white placeholder-blue-200 outline-none px-6" placeholder="AI/Data Skill..." />
          <input className="flex-1 p-4 bg-transparent text-white placeholder-blue-200 outline-none px-6 border-l border-white/20" placeholder="Location..." />
          <button className="bg-teal-500 hover:bg-teal-400 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition"><Search size={20}/> Search</button>
        </div>
      </header>

      {/* Stat Bar */}
      <div className="bg-white py-8 border-b border-slate-100 shadow-sm flex flex-wrap justify-center gap-16 text-slate-600 font-semibold px-4">
        <div className="flex items-center gap-3"><Briefcase className="text-teal-500" /> 5,240 Active Jobs</div>
        <div className="flex items-center gap-3"><Users className="text-teal-500" /> 1,200+ Companies</div>
        <div className="flex items-center gap-3"><CheckCircle className="text-teal-500" /> Verified Data Roles</div>
      </div>

      {/* Disciplines */}
      <section className="py-20 px-16">
        <h3 className="text-3xl font-bold text-center mb-12">Explore Core Disciplines</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Machine Learning", icon: <Brain />, color: "bg-blue-50" },
            { title: "Data Analytics", icon: <BarChart />, color: "bg-teal-50" },
            { title: "AI Research", icon: <Cpu />, color: "bg-indigo-50" },
            { title: "Cloud AI & MLOps", icon: <Cloud />, color: "bg-purple-50" }
          ].map((d, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 text-center hover:border-teal-400 transition-all duration-300 hover:shadow-xl">
              <div className={`${d.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-600`}>{d.icon}</div>
              <h4 className="font-bold">{d.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-16 bg-white">
        <h3 className="text-3xl font-bold mb-12 text-center">Featured AI & Data Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1,2,3].map(n => (
             <div key={n} className="p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition">
               <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6"></div>
               <h4 className="font-bold text-xl mb-1">Senior Data Scientist</h4>
               <p className="text-slate-500 mb-6">Tech Innovators Inc. • Casablanca</p>
              <Link to={`/jobs/${n}`} className="block w-full py-3 text-center rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition">
                View Details
              </Link>
             </div>
           ))}
        </div>
      </section>
    </Layout>
  );
}