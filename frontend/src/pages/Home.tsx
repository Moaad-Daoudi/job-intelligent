import { Search, Brain, MapPin, Briefcase, Building2, Quote, ArrowRight, Zap, Database, Network, LineChart, Code2 } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getHomeData } from '../../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  
  const [stats, setStats] = useState({ total_jobs: 0, total_companies: 0, total_candidates: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);

  useEffect(() => {
    getHomeData().then(res => {
      if (res.data) {
        setStats(res.data.stats || { total_jobs: 0, total_companies: 0, total_candidates: 0 });
        setCategories(res.data.categories || []);
        setLatestJobs(res.data.latest_jobs || []);
        setTopCompanies(res.data.top_companies || []);
      }
    }).catch(err => console.error("Error fetching home data:", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query || location) {
      navigate(`/jobs?${query ? `search=${encodeURIComponent(query)}` : ''}${query && location ? '&' : ''}${location ? `city=${encodeURIComponent(location)}` : ''}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-28 pb-32 px-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-500/10 blur-[120px]"></div>
          <div className="absolute top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-300 font-semibold text-sm mb-8">
            <Zap size={16} className="text-teal-400" /> Over {stats.total_jobs > 0 ? stats.total_jobs.toLocaleString() : "10,000"}+ AI & Data Jobs Available
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            Find Your Dream <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">AI & Data Career</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the world's leading network of Data Scientists, AI Engineers, and Machine Learning Experts. Discover opportunities that match your passion.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-3 max-w-4xl mx-auto mb-10">
            <div className="flex-1 flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="text-slate-400" size={24} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, keywords, or company" 
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg" 
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3">
              <MapPin className="text-slate-400" size={24} />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or 'Remote'" 
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg" 
              />
            </div>
            <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-xl md:rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30">
              Find Jobs <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-300">
            <span>Popular:</span>
            <Link to="/jobs?search=Python" className="hover:text-teal-400 transition">Python</Link>
            <Link to="/jobs?search=LLM" className="hover:text-teal-400 transition">LLMs</Link>
            <Link to="/jobs?search=Data+Engineer" className="hover:text-teal-400 transition">Data Engineer</Link>
            <Link to="/jobs?search=PyTorch" className="hover:text-teal-400 transition">PyTorch</Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 border-b border-slate-200 bg-white relative z-20 -mt-8 mx-4 md:mx-16 rounded-3xl shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-4">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">{stats.total_jobs > 0 ? stats.total_jobs.toLocaleString() : "10,000"}+</div>
            <div className="text-slate-500 font-medium">Active Jobs</div>
          </div>
          <div className="p-4">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">{stats.total_companies > 0 ? stats.total_companies.toLocaleString() : "500"}+</div>
            <div className="text-slate-500 font-medium">Top Companies</div>
          </div>
          <div className="p-4">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">{stats.total_candidates > 0 ? stats.total_candidates.toLocaleString() : "20,000"}+</div>
            <div className="text-slate-500 font-medium">Candidates</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Browse by Category</h2>
          <p className="text-slate-500 text-lg">Explore the most in-demand roles in the industry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {(categories.length > 0 ? categories : [
            { name: "AI Engineer", jobs: 0 },
            { name: "Data Scientist", jobs: 0 },
            { name: "Data Engineer", jobs: 0 },
            { name: "ML Engineer", jobs: 0 },
            { name: "NLP Engineer", jobs: 0 },
          ]).map((cat, i) => {
            let icon = <Brain size={32} />;
            let color = "text-purple-600";
            let bg = "bg-purple-100";
            if (cat.name === "Data Scientist") { icon = <LineChart size={32} />; color = "text-blue-600"; bg = "bg-blue-100"; }
            if (cat.name === "Data Engineer") { icon = <Database size={32} />; color = "text-teal-600"; bg = "bg-teal-100"; }
            if (cat.name === "ML Engineer") { icon = <Code2 size={32} />; color = "text-orange-600"; bg = "bg-orange-100"; }
            if (cat.name === "NLP Engineer") { icon = <Network size={32} />; color = "text-pink-600"; bg = "bg-pink-100"; }
            
            return (
              <Link key={i} to={`/jobs?search=${encodeURIComponent(cat.name)}`} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${bg} ${color} group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{cat.name}</h3>
                <p className="text-slate-500 text-sm font-medium">{cat.jobs.toLocaleString()} open positions</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 px-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Featured Jobs</h2>
              <p className="text-slate-500 text-lg">Hand-picked opportunities from top employers.</p>
            </div>
            <Link to="/jobs" className="hidden md:flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition">
              View All Jobs <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(latestJobs.length > 0 ? latestJobs : [
              { title: "Senior Data Scientist", company: "Tech Innovators", location: "Casablanca", type: "Hybrid", max_salary: "30k - 45k MAD", skills: "Python, TensorFlow, SQL", id: "1" }
            ]).map((job, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-teal-500 hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-xl text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition uppercase">
                    {(job.company && job.company !== 'N/A' ? job.company : 'U').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-teal-600 transition line-clamp-1">{job.title || 'N/A'}</h3>
                    <p className="text-slate-500 font-medium">{job.company || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {job.location && job.location !== 'N/A' && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg flex items-center gap-1"><MapPin size={14}/> {job.location.slice(0, 15)}{job.location.length > 15 ? '...' : ''}</span>
                  )}
                  {job.type && job.type !== 'N/A' && (
                    <span className={`px-3 py-1 text-sm font-semibold rounded-lg flex items-center gap-1 ${job.type.toLowerCase().includes('remote') ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                      <Briefcase size={14}/> {job.type}
                    </span>
                  )}
                </div>

                {job.skills && job.skills !== 'N/A' && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {String(job.skills).split(',').slice(0, 3).map((tag: string) => (
                      <span key={tag.trim()} className="px-3 py-1 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">{tag.trim()}</span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="font-bold text-slate-900">{job.salary || 'N/A'}</div>
                  <Link to={`/jobs/${job.id}`} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-teal-500 transition">View Job</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Top Companies Hiring</h2>
          <p className="text-slate-500 text-lg">Work for the world's most innovative organizations.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(topCompanies.length > 0 ? topCompanies : [
            { name: "Google", jobs: 124, id: "1" }
          ]).map((company, i) => (
            <Link key={i} to={`/companies/${company.id || i+1}`} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-lg transition flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                {company.name ? (
                  <span className="text-2xl font-bold text-slate-400 group-hover:text-teal-600">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Building2 className="text-slate-400 group-hover:text-teal-600" size={28} />
                )}
              </div>
              <h4 className="font-bold text-slate-900">{company.name || 'Unknown Company'}</h4>
              <p className="text-slate-400 text-sm mb-2">{company.industry || 'Technology'}</p>
              <div className="text-teal-600 font-semibold text-sm bg-teal-50 px-3 py-1 rounded-full">{company.jobs || 0} Jobs</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4">What Our Users Say</h2>
            <p className="text-slate-400 text-lg">Success stories from candidates who found their dream jobs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "AI Engineer at OpenAI", text: "DataNexus completely transformed my job search. The filters are perfectly tailored for AI roles. I found my dream job in just 2 weeks." },
              { name: "David Chen", role: "Data Scientist at Spotify", text: "The quality of companies hiring on this platform is unmatched. If you are serious about a career in data, this is the only site you need." },
              { name: "Amira Lahlou", role: "MLOps Engineer at TechCorp", text: "I love how easy it is to find remote roles specific to MLOps. The platform's design is beautiful and the application process is seamless." }
            ].map((review, i) => (
              <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 relative">
                <Quote className="absolute top-8 right-8 text-slate-700 w-12 h-12" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center font-bold text-xl">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{review.name}</h4>
                    <p className="text-slate-400 text-sm">{review.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed italic relative z-10">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Ready to accelerate your career?</h2>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">Create a free profile today and let top companies in AI and Data Science find you.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-teal-500/30">Create Free Profile</Link>
          <Link to="/post-job" className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-full font-bold text-lg transition-all">Post a Job</Link>
        </div>
      </section>
    </Layout>
  );
}