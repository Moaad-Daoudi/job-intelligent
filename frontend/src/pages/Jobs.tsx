import { useState } from 'react';
import Layout from '../components/ui/Layout';
import { Search, Filter, MapPin, Briefcase, DollarSign } from 'lucide-react';

export default function Jobs() {
  // Static state for now - will be replaced by API call later
  const [jobs] = useState([
    { id: 1, title: "Data Engineer", company: "Tech Corp", location: "Casablanca", salary: "25k MAD" },
    { id: 2, title: "Machine Learning Lead", company: "AI Solutions", location: "Rabat", salary: "35k MAD" },
    { id: 3, title: "Data Analyst", company: "Fintech Group", location: "Remote", salary: "18k MAD" },
  ]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-8">
        {/* Header Search for Jobs Page */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10 flex gap-4">
          <div className="flex-1 flex items-center gap-3 border-r border-slate-200">
            <Search className="text-teal-500" />
            <input className="w-full outline-none" placeholder="Search job title or keyword..." />
          </div>
          <button className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition">
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6 font-bold text-lg"><Filter size={20} /> Filters</div>
              
              <div className="space-y-4">
                {['Contract Type', 'Experience Level', 'Salary Range'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">{f}</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none">
                      <option>Any</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Job List */}
          <main className="col-span-3 space-y-4">
            <h2 className="text-xl font-bold mb-4">Showing {jobs.length} Results</h2>
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-400 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl group-hover:text-teal-600 transition">{job.title}</h3>
                    <p className="text-slate-500 mb-4 font-medium">{job.company}</p>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={16} /> Full-time</span>
                      <span className="flex items-center gap-1"><DollarSign size={16} /> {job.salary}</span>
                    </div>
                  </div>
                  <button className="px-6 py-2 border-2 border-slate-200 rounded-xl font-bold hover:border-teal-500 hover:text-teal-600 transition">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </Layout>
  );
}