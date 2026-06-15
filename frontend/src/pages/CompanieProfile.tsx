import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import {
  MapPin, Briefcase, Globe, ChevronLeft, ExternalLink,
  Building2, Calendar, Tag, ArrowRight
} from 'lucide-react';

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200">
      {label}
    </span>
  );
}

export default function CompanieProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${baseUrl}/companies/${id}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setCompany(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCompany();
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="max-w-6xl mx-auto py-24 px-8 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
      </div>
    </Layout>
  );

  if (error || !company) return (
    <Layout>
      <div className="max-w-6xl mx-auto py-24 px-8 text-center">
        <p className="text-4xl mb-4">🏢</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Company not found</h2>
        <p className="text-slate-500 mb-8">{error || 'This company profile may no longer be available.'}</p>
        <Link to="/companies" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition">
          Back to Companies
        </Link>
      </div>
    </Layout>
  );

  const openJobs: any[] = company.open_jobs || [];

  // Avatar gradient based on first letter
  const gradients = [
    'from-purple-500 to-indigo-600',
    'from-teal-500 to-cyan-600',
    'from-orange-500 to-pink-600',
    'from-blue-500 to-violet-600',
    'from-green-500 to-teal-600',
  ];
  const gradient = gradients[(company.name?.charCodeAt(0) || 0) % gradients.length];

  return (
    <Layout>
      {/* Banner */}
      <div className={`h-56 w-full bg-gradient-to-r ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Profile Card */}
      <div className="max-w-6xl mx-auto px-8 relative -mt-20 mb-10">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center font-extrabold text-5xl text-white shadow-lg flex-shrink-0 -mt-20 md:-mt-16 border-4 border-white`}>
                {company.name?.charAt(0).toUpperCase() || '?'}
              </div>

              <div className="pt-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
                  {company.name}
                </h1>
                <p className="text-slate-500 font-medium text-lg mb-4">
                  {company.industry || 'Technology'}
                </p>

                <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
                  {company.website && (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-teal-600 transition"
                    >
                      <Globe size={16} className="text-teal-500" />
                      {company.website}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={16} className="text-teal-500" />
                    {company.total_jobs || openJobs.length} Open Positions
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 w-full md:w-auto">
              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition w-full"
                >
                  Visit Website <ExternalLink size={16} />
                </a>
              )}
              <Link
                to="/companies"
                className="mt-3 flex items-center justify-center gap-1 text-slate-500 hover:text-teal-600 text-sm font-semibold transition"
              >
                <ChevronLeft size={16} /> All Companies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: About + Open Jobs */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-teal-500" /> About {company.name}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {company.description ||
                `${company.name} is an active employer in the ${company.industry || 'Technology'} sector. 
                They currently have ${company.total_jobs || openJobs.length} open position(s) listed on DataNexus.`}
            </p>
          </section>

          {/* Open Jobs */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Open Positions
                {openJobs.length > 0 && (
                  <span className="ml-2 bg-teal-100 text-teal-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                    {openJobs.length}
                  </span>
                )}
              </h2>
              <Link
                to={`/jobs?search=${encodeURIComponent(company.name)}`}
                className="text-teal-600 font-semibold text-sm hover:underline flex items-center gap-1"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-3xl mb-3">📭</p>
                <p className="font-medium">No open positions listed right now.</p>
                <p className="text-sm mt-1">Check back later or visit their website.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openJobs.map((job, i) => {
                  const skills: string[] = job.skills
                    ? job.skills.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3)
                    : [];
                  return (
                    <Link
                      key={job.job_id ?? i}
                      to={`/jobs/${job.job_id}`}
                      className="block p-5 rounded-2xl border border-slate-100 hover:border-teal-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 group-hover:text-teal-600 transition mb-1 truncate">
                            {job.title}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium mb-3">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-teal-400" /> {job.location}
                              </span>
                            )}
                            {job.contract_type && job.contract_type !== 'Non spécifié' && (
                              <span className="flex items-center gap-1">
                                <Briefcase size={12} className="text-teal-400" /> {job.contract_type}
                              </span>
                            )}
                            {job.published_date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-teal-400" />
                                {String(job.published_date).slice(0, 10)}
                              </span>
                            )}
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skills.map(s => <SkillBadge key={s} label={s} />)}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1 text-teal-600 font-bold text-sm group-hover:gap-2 transition-all">
                          View <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: Quick Info */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6">Company Info</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-teal-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Sector</p>
                  <p className="text-slate-800 font-semibold">{company.industry || 'Technology'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase size={18} className="text-teal-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Open Jobs</p>
                  <p className="text-slate-800 font-semibold">{company.total_jobs || openJobs.length} positions</p>
                </div>
              </div>

              {company.website && (
                <div className="flex items-start gap-3">
                  <Globe size={18} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Website</p>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-semibold text-sm hover:underline break-all"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Quick action */}
          <section className="bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl text-white">
            <h3 className="font-bold text-lg mb-2">Interested?</h3>
            <p className="text-teal-100 text-sm mb-5 leading-relaxed">
              Browse all open roles from {company.name} and apply directly.
            </p>
            <Link
              to={`/jobs?search=${encodeURIComponent(company.name)}`}
              className="flex items-center justify-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition text-sm"
            >
              <Tag size={15} /> View All Jobs
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}