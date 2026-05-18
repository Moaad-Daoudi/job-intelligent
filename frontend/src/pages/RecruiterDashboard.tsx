import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { 
  Briefcase, Users, Award, Clock, MapPin, Tag, 
  ExternalLink, Calendar, FileText, ChevronRight, PlusCircle,
  Building, Globe, Loader2, CheckCircle, X, Phone, Mail, FileIcon
} from 'lucide-react';

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications'>('overview');
  
  // Dashboard & Company linked states
  const [isLinked, setIsLinked] = useState<boolean | null>(null);
  const [company, setCompany] = useState<any>(null);
  
  // Onboarding form states
  const [companyName, setCompanyName] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  // Core Recruiter Data
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application detail modal states
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Fetch Company Link status
      const companyRes = await fetch('http://localhost:8000/recruiter/company', { headers });
      if (!companyRes.ok) throw new Error("Failed to verify company status");
      const companyData = await companyRes.json();
      
      if (!companyData.linked) {
        setIsLinked(false);
        setLoading(false);
        return;
      }

      setIsLinked(true);
      setCompany(companyData);

      // 2. Fetch posted jobs
      const jobsRes = await fetch('http://localhost:8000/recruiter/jobs', { headers });
      if (jobsRes.ok) setJobs(await jobsRes.json());

      // 3. Fetch applications
      const appsRes = await fetch('http://localhost:8000/recruiter/applications', { headers });
      if (appsRes.ok) setApplications(await appsRes.json());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.strip && !companyName) {
      setOnboardingError("Please enter your Company Name.");
      return;
    }

    setOnboardingLoading(true);
    setOnboardingError(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:8000/recruiter/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: companyName,
          sector: companySector,
          website: companyWebsite
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to onboard company profile.");
      }

      // Refresh dashboard data completely
      await fetchDashboardData();
    } catch (err: any) {
      setOnboardingError(err.message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    setStatusUpdating(appId);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:8000/recruiter/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local state application list immediately
        setApplications(prev => 
          prev.map(app => 
            app.application_id === appId ? { ...app, status: newStatus } : app
          )
        );
        // Update selected application modal if it's currently open
        if (selectedApp && selectedApp.application_id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Error updating application status:", err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('hire')) {
      return 'bg-green-50 text-green-700 border-green-100';
    }
    if (s.includes('reject')) {
      return 'bg-red-50 text-red-700 border-red-100';
    }
    if (s.includes('interview')) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (s.includes('review')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 pt-20 pb-36 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Recruiter Hub
            </h1>
            <p className="text-slate-400 font-medium text-lg">
              {isLinked ? `Post active listings, track candidate metrics and hire for ${company?.name}.` : "Manage job offers, track candidate metrics and screen talent."}
            </p>
          </div>
          {isLinked && (
            <Link
              to="/post-job"
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg shadow-teal-500/30 shrink-0 text-sm"
            >
              <PlusCircle size={18} /> Post a New Job
            </Link>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-8 pb-24 -mt-20 relative z-20">
        
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
            <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
            <p className="font-semibold text-slate-500">Loading Recruiter Workspace...</p>
          </div>
        ) : isLinked === false ? (
          
          /* ── COMPANY ONBOARDING SCREEN ── */
          <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
              <Building size={32} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800">Set Up Your Recruiter Profile</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Before posting job offers or screening candidates, you need to create or link your corporate company profile.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              {onboardingError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
                  ⚠️ {onboardingError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DataNexus Solutions"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. AI Consulting, FinTech, E-Commerce"
                  value={companySector}
                  onChange={e => setCompanySector(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Website URL</label>
                <input
                  type="url"
                  placeholder="https://datanexus.ai"
                  value={companyWebsite}
                  onChange={e => setCompanyWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={onboardingLoading}
                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition shadow-lg shadow-teal-500/20 text-sm flex items-center justify-center gap-2"
              >
                {onboardingLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Setting Up Workspace...
                  </>
                ) : (
                  "Create Corporate Profile"
                )}
              </button>
            </form>
          </div>

        ) : (
          
          /* ── ACTIVE RECRUITER PORTAL ── */
          <div className="space-y-10">
            
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                  <Briefcase size={26} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Job Listings</p>
                  <p className="text-3xl font-extrabold text-slate-800">{jobs.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users size={26} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Candidates</p>
                  <p className="text-3xl font-extrabold text-slate-800">{applications.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Award size={26} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Screening Rate</p>
                  <p className="text-3xl font-extrabold text-slate-800">
                    {applications.length > 0 
                      ? `${Math.round((applications.filter(a => a.status.toLowerCase() !== 'applied').length / applications.length) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex gap-4 border-b border-slate-200 pb-px">
              {[
                { id: 'overview', label: 'Overview', icon: <Award size={16} /> },
                { id: 'jobs', label: `My Job Offers (${jobs.length})`, icon: <Briefcase size={16} /> },
                { id: 'applications', label: `Candidate Applications (${applications.length})`, icon: <Users size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-2xl">
                ⚠️ {error}
              </div>
            )}

            {/* TAB CONTENT PANELS */}
            <div>
              
              {/* 1. OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Latest Applicants */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-lg text-slate-900 mb-6">Latest Job Applicants</h3>

                      {applications.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                          <p className="text-3xl mb-3">📬</p>
                          <p className="font-medium">No application activity recorded yet.</p>
                          <Link to="/post-job" className="mt-4 inline-block text-teal-600 font-bold text-sm hover:underline">
                            Publish a new job offer
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications.slice(0, 3).map((app, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                              <div>
                                <h4 className="font-bold text-slate-800">{app.first_name} {app.last_name}</h4>
                                <p className="text-xs text-slate-500 font-medium">Applied for: <span className="text-teal-600 font-bold">{app.job_title}</span></p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                                  {app.status}
                                </span>
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="text-xs font-bold text-slate-600 hover:text-teal-600"
                                >
                                  View Candidate
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Info Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100">
                        <Building size={22} />
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-800">{company?.name}</h3>
                      <div className="space-y-2.5 text-sm font-semibold text-slate-500">
                        <p className="flex items-center gap-2"><Tag size={15} className="text-teal-500" /> {company?.sector || "Technology"}</p>
                        {company?.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-teal-600 hover:underline"
                          >
                            <Globe size={15} /> {company.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 2. MY JOB OFFERS PANEL */}
              {activeTab === 'jobs' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-lg text-slate-900">Job listings published by {company?.name}</h3>

                  {jobs.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <p className="text-4xl mb-4">📄</p>
                      <p className="font-bold text-slate-700 text-lg mb-2">You haven't posted any job offers yet</p>
                      <p className="text-sm mb-6">Launch matches and publish offers instantly to candidates.</p>
                      <Link to="/post-job" className="bg-teal-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-600 transition shadow-md">
                        Publish First Job Offer
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {jobs.map((job, idx) => (
                        <div key={idx} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-lg hover:text-teal-600 transition">
                              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            </h4>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold pt-1">
                              <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {job.contract_type}</span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> Published {job.published_date ? String(job.published_date).slice(0, 10) : 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                              {job.applications_count} Candidates Applied
                            </span>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-50 transition"
                              title="View Public Listing"
                            >
                              <ExternalLink size={18} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. CANDIDATE APPLICATIONS PANEL */}
              {activeTab === 'applications' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-lg text-slate-900">Manage Candidate Applications</h3>

                  {applications.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <p className="text-4xl mb-4">📭</p>
                      <p className="font-bold text-slate-700 text-lg mb-2">No applications received yet</p>
                      <p className="text-sm">Once candidates submit cover letters, they will appear here immediately for screening.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="pb-4 pl-2">Applicant</th>
                            <th className="pb-4">Applied Job</th>
                            <th className="pb-4">Applied Date</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {applications.map((app, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition">
                              <td className="py-4 pl-2">
                                <p className="font-bold text-slate-800">{app.first_name} {app.last_name}</p>
                                <p className="text-xs text-slate-400 font-medium">{app.candidate_email}</p>
                              </td>
                              <td className="py-4 font-bold text-slate-700">{app.job_title}</td>
                              <td className="py-4 text-slate-500 font-medium">
                                {app.applied_at ? String(app.applied_at).slice(0, 10) : 'N/A'}
                              </td>
                              <td className="py-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(app.status)}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-2">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
                                >
                                  Screen Candidate
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* ── SCREEN CANDIDATE MODAL OVERLAY ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button 
              onClick={() => setSelectedApp(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div>
              <span className="bg-teal-500/10 text-teal-600 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-teal-500/20">
                Screening Profile
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                {selectedApp.first_name} {selectedApp.last_name}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Target Role: <span className="text-teal-600 font-black">{selectedApp.job_title}</span>
              </p>
            </div>

            {/* Grid profile contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2"><Mail size={15} className="text-teal-500" /> {selectedApp.candidate_email}</p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-teal-500" /> {selectedApp.candidate_phone || 'No phone provided'}
              </p>
              {selectedApp.candidate_resume ? (
                <a
                  href={selectedApp.candidate_resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 hover:underline md:col-span-2"
                >
                  <FileIcon size={15} /> View Candidate Resume/CV <ExternalLink size={12} />
                </a>
              ) : (
                <p className="flex items-center gap-2 md:col-span-2 text-slate-400"><FileIcon size={15} /> No CV attached</p>
              )}
            </div>

            {/* Biography & Skills */}
            <div className="space-y-4">
              {selectedApp.candidate_skills && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Candidate Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.candidate_skills.split(',').map((skill: string) => (
                      <span key={skill} className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.candidate_bio && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Biography / Description</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-2xl whitespace-pre-wrap">
                    {selectedApp.candidate_bio}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Cover Letter Submission</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-teal-50/20 p-4 border border-teal-100/50 rounded-2xl whitespace-pre-wrap">
                  {selectedApp.cover_letter || 'No cover letter attached.'}
                </p>
              </div>
            </div>

            {/* Status transitions control */}
            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Update Status</p>
                <div className="flex gap-2">
                  {['Reviewing', 'Interviewing', 'Accepted', 'Rejected'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedApp.application_id, st)}
                      disabled={statusUpdating === selectedApp.application_id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        selectedApp.status === st
                          ? getStatusBadge(st) + ' border-current'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="py-3 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-sm text-center w-full md:w-auto"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}
