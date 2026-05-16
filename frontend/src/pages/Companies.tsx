import Layout from '../components/ui/Layout';
import { Search, Building2, MapPin, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Companies() {
  // Static list for now - will be replaced by API call to dim_companies
  const companies = [
    { id: 1, name: "Tech Innovators Inc.", industry: "Fintech", location: "Casablanca", openJobs: 12 },
    { id: 2, name: "DataStream AI", industry: "SaaS", location: "Rabat", openJobs: 5 },
    { id: 3, name: "Maroc Cloud Solutions", industry: "Cloud Computing", location: "Tangier", openJobs: 8 },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Top Companies</h1>
          <p className="text-slate-500 mb-8">Discover and follow the best employers in the Data & AI space.</p>
          
          <div className="flex gap-4 max-w-2xl bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-1 flex items-center px-4 gap-2">
              <Search className="text-teal-500" size={20} />
              <input className="w-full p-2 outline-none" placeholder="Search companies by name or industry..." />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
              Search
            </button>
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                  <Building2 size={24} />
                </div>
                <button className="text-slate-400 hover:text-teal-600"><ExternalLink size={20} /></button>
              </div>
              
              <h3 className="font-bold text-xl mb-1">{company.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{company.industry}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                <span className="flex items-center gap-1"><MapPin size={16} /> {company.location}</span>
                <span className="font-bold text-teal-600">{company.openJobs} Open Roles</span>
              </div>
              
              <button className="w-full py-3 bg-slate-50 rounded-xl font-semibold group-hover:bg-teal-500 group-hover:text-white transition">
                View Profile
              </button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}