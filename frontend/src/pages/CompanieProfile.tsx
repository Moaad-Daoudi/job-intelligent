import Layout from '../components/ui/Layout';
import { Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import Card from '../components/ui/Card';

export default function CompanyProfile() {
  // Mock data - will be replaced by API call to dim_companies & fact_jobs
  const company = {
    name: "Tech Innovators Inc.",
    industry: "Fintech",
    location: "Casablanca, Morocco",
    website: "https://techinnovators.ma",
    description: "Tech Innovators Inc. is a leading provider of data-driven financial solutions in North Africa. We empower banks with real-time analytics and AI-powered risk management.",
    employees: "200-500",
    openJobs: [
      { id: 1, title: "Senior Data Engineer" },
      { id: 2, title: "Machine Learning Lead" }
    ]
  };

  return (
    <Layout>
      {/* Hero Banner Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-48 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        <div className="max-w-6xl mx-auto px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-12">
            <div className="w-28 h-28 bg-white p-2 rounded-3xl shadow-lg flex items-center justify-center">
              <Building2 size={48} className="text-teal-600" />
            </div>
            <div className="pt-12 md:pt-16">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <div className="flex gap-6 mt-2 text-slate-500 text-sm">
                <span className="flex items-center gap-1"><MapPin size={16}/> {company.location}</span>
                <span className="flex items-center gap-1"><Globe size={16}/> {company.website}</span>
                <span className="flex items-center gap-1"><Users size={16}/> {company.employees} employees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-bold mb-4">About Us</h3>
            <p className="text-slate-600 leading-relaxed">{company.description}</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold mb-6">Open Positions ({company.openJobs.length})</h3>
            <div className="space-y-4">
              {company.openJobs.map(job => (
                <Card key={job.id} className="flex justify-between items-center">
                  <span className="font-bold">{job.title}</span>
                  <button className="text-teal-600 font-bold hover:underline">Apply Now</button>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <Card>
            <h4 className="font-bold mb-4">Quick Facts</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Industry</span> <span className="font-semibold">{company.industry}</span></div>
              <div className="flex justify-between"><span>Founded</span> <span className="font-semibold">2015</span></div>
            </div>
          </Card>
        </aside>
      </div>
    </Layout>
  );
}