import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { 
  Briefcase, Bookmark, Award, Clock, MapPin, 
  Trash2, ExternalLink, Calendar, ChevronRight,
  Sparkles, Check, BookOpen
} from 'lucide-react';

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'ai-matches'>('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch all candidate data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch applications
        const appRes = await fetch(`${baseUrl}/candidate/applications`, { headers });
        if (!appRes.ok) throw new Error(`Failed to load applications: ${appRes.status}`);
        const appData = await appRes.json();
        setApplications(appData);

        // Fetch saved jobs
        const savedRes = await fetch(`${baseUrl}/candidate/saved-jobs`, { headers });
        if (!savedRes.ok) throw new Error(`Failed to load saved jobs: ${savedRes.status}`);
        const savedData = await savedRes.json();
        setSavedJobs(savedData);

        // Fetch matched jobs
        const matchedRes = await fetch(`${baseUrl}/candidate/matched-jobs`, { headers });
        if (matchedRes.ok) {
          const matchedData = await matchedRes.json();
          setMatchedJobs(matchedData);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handler to unsave job
  const handleUnsave = async (jobId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Filter out of current state immediately
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (err) {
      console.error("Error unsaving job:", err);
    }
  };

  // Status style helper
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
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Candidate Dashboard
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Track your job applications, view saved offers, and monitor your career progress.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 pb-24 -mt-20 relative z-20">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <Briefcase size={26} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Applied Jobs</p>
              <p className="text-3xl font-extrabold text-slate-800">{loading ? '...' : applications.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Bookmark size={26} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saved Jobs</p>
              <p className="text-3xl font-extrabold text-slate-800">{loading ? '...' : savedJobs.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Award size={26} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Profile Strength</p>
              <p className="text-3xl font-extrabold text-slate-800">85%</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-slate-200 mb-8 pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: <Award size={16} /> },
            { id: 'applications', label: `My Applications (${applications.length})`, icon: <Briefcase size={16} /> },
            { id: 'saved', label: `Saved Jobs (${savedJobs.length})`, icon: <Bookmark size={16} /> },
            { id: 'ai-matches', label: `AI Matches (${matchedJobs.length})`, icon: <Sparkles size={16} className="text-teal-500" /> }
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

        {/* Errors & Loading */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-8">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-slate-100 rounded-3xl" />
            <div className="h-24 bg-slate-100 rounded-3xl" />
            <div className="h-24 bg-slate-100 rounded-3xl" />
          </div>
        ) : (
          <div>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Recent Applications</h3>
                    
                    {applications.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <p className="text-3xl mb-3">📬</p>
                        <p className="font-medium">No recent application activity.</p>
                        <Link to="/jobs" className="mt-4 inline-block text-teal-600 font-bold text-sm hover:underline">
                          Browse available jobs
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((app, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                              <h4 className="font-bold text-slate-800">{app.title}</h4>
                              <p className="text-xs text-slate-500 font-medium">{app.company} • {app.location}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info & Profile Widget */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Enhance Your Profile</h3>
                    <p className="text-teal-100 text-sm mb-6 leading-relaxed">
                      Candidates with complete profile descriptions and lists of skills are 3x more likely to be contacted by recruiters.
                    </p>
                    <Link
                      to="/candidate/profile"
                      className="flex items-center justify-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition text-sm"
                    >
                      Update Profile <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* 2. APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-slate-900">Application History</h3>
                
                {applications.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="font-bold text-slate-700 text-lg mb-2">You haven't applied to any jobs yet</p>
                    <p className="text-sm mb-6">Find matches in Data Science, Engineering or AI.</p>
                    <Link to="/jobs" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition shadow-md">
                      Search Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {applications.map((app, i) => (
                      <div key={i} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-lg hover:text-teal-600 transition">
                            <Link to={`/jobs/${app.id}`}>{app.title}</Link>
                          </h4>
                          <p className="text-slate-600 font-semibold text-sm">{app.company}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold pt-1">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {app.location}</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> Applied {app.applied_at ? String(app.applied_at).slice(0, 10) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                          <Link 
                            to={`/jobs/${app.id}`} 
                            className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-50 transition"
                            title="View Job Details"
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

            {/* 3. SAVED JOBS TAB */}
            {activeTab === 'saved' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-slate-900">Saved Positions</h3>

                {savedJobs.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-4xl mb-4">⭐</p>
                    <p className="font-bold text-slate-700 text-lg mb-2">Your saved list is empty</p>
                    <p className="text-sm mb-6">Save job offers you are interested in to review or apply later.</p>
                    <Link to="/jobs" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition shadow-md">
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {savedJobs.map((job, i) => (
                      <div key={i} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-lg hover:text-teal-600 transition">
                            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                          </h4>
                          <p className="text-slate-600 font-semibold text-sm">{job.company}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold pt-1">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            {job.contract_type && <span className="flex items-center gap-1"><Clock size={12} /> {job.contract_type}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                          <button
                            onClick={() => handleUnsave(job.id)}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-100 bg-red-50/50 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
                            title="Remove from saved"
                          >
                            <Trash2 size={13} /> Unsave
                          </button>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="bg-slate-900 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                          >
                            View Job <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. AI MATCHES TAB */}
            {activeTab === 'ai-matches' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 p-8 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-teal-600 font-extrabold text-sm uppercase tracking-wider">
                      <Sparkles size={16} className="animate-pulse" /> AI Match Center
                    </div>
                    <h3 className="font-extrabold text-2xl text-slate-800">Your Intelligent Career Matcher</h3>
                    <p className="text-slate-500 text-sm max-w-xl font-medium">
                      Our advanced NLP system matches your listed skills, professional title, and bio against live job listings to find your perfect fit.
                    </p>
                  </div>
                  <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm text-center shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Profile Completeness</p>
                    <p className="text-2xl font-black text-teal-600">85%</p>
                    <Link to="/candidate/profile" className="text-xs text-slate-400 hover:text-teal-600 underline font-semibold mt-1 inline-block">
                      Refine Profile
                    </Link>
                  </div>
                </div>

                {matchedJobs.length === 0 ? (
                  <div className="bg-white text-center py-16 rounded-3xl border border-slate-100 shadow-sm text-slate-400">
                    <p className="text-4xl mb-4">🧠</p>
                    <p className="font-bold text-slate-700 text-lg mb-2">No matching jobs found</p>
                    <p className="text-sm">Try adding more skills or detailing your bio/title on your profile page to trigger AI recommendations.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedJobs.map((job) => {
                      const match = job.ai_match || { score: 0, fit_level: 'Poor', matched_skills: [], missing_skills: [], explanation: '' };
                      const score = match.score;
                      
                      let scoreBg = 'bg-rose-50 text-rose-700 border-rose-100';
                      if (score >= 80) {
                        scoreBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      } else if (score >= 60) {
                        scoreBg = 'bg-blue-50 text-blue-700 border-blue-100';
                      } else if (score >= 40) {
                        scoreBg = 'bg-amber-50 text-amber-700 border-amber-100';
                      }
                      
                      const isExpanded = selectedMatch?.id === job.id;

                      return (
                        <div 
                          key={job.id} 
                          className={`bg-white border rounded-3xl transition-all duration-300 shadow-sm overflow-hidden ${
                            isExpanded ? 'border-teal-200 shadow-md ring-1 ring-teal-500/10' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2 flex-grow">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${scoreBg}`}>
                                  {score}% Match • {match.fit_level}
                                </span>
                                {score >= 80 && (
                                  <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    ⭐ Top Pick
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-xl hover:text-teal-600 transition">
                                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                              </h4>
                              <p className="text-slate-600 font-bold text-sm">{job.company}</p>
                              
                              <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold pt-1">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                {job.contract_type && <span className="flex items-center gap-1"><Clock size={12} /> {job.contract_type}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-4 md:pt-0 border-t md:border-none border-slate-100">
                              <button
                                onClick={() => setSelectedMatch(isExpanded ? null : job)}
                                className={`text-xs font-extrabold px-5 py-2.5 rounded-xl border transition flex items-center gap-1 ${
                                  isExpanded 
                                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' 
                                    : 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100'
                                }`}
                              >
                                {isExpanded ? 'Hide AI Details' : 'View AI Breakdown'}
                              </button>
                              <Link
                                to={`/jobs/${job.id}`}
                                className="bg-slate-900 hover:bg-teal-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition flex items-center gap-1"
                              >
                                View Listing <ChevronRight size={14} />
                              </Link>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-slate-50 border-t border-slate-100 p-6 md:p-8 space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                                  <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                      <path
                                        className="text-slate-100"
                                        strokeWidth="3.2"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      />
                                      <path
                                        className="text-teal-500"
                                        strokeWidth="3.2"
                                        strokeDasharray={`${score}, 100`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                      <span className="text-xl font-black text-slate-850">{score}%</span>
                                      <span className="text-[7px] font-black uppercase text-slate-400 tracking-wider">AI FIT</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] font-extrabold text-slate-400 mt-4 uppercase tracking-wider">
                                    Overall Alignment: <span className="text-teal-600 font-bold">{match.fit_level}</span>
                                  </p>
                                </div>

                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center space-y-3">
                                  <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-teal-500 animate-spin-slow" /> AI Insights & Assessment
                                  </h5>
                                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    {match.explanation}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                                  Skills Fit & Upskill Checklist
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matched Skills ({match.matched_skills.length})</p>
                                    {match.matched_skills.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic font-medium">No skills matched directly.</p>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {match.matched_skills.map((skill: string) => (
                                          <span key={skill} className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                            <Check size={12} className="stroke-[3]" /> {skill}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      Missing / Suggested Skills ({match.missing_skills.length})
                                    </p>
                                    {match.missing_skills.length === 0 ? (
                                      <p className="text-xs text-emerald-600 font-extrabold flex items-center gap-0.5">
                                        <Check size={12} className="stroke-[3]" /> You meet all technical skill keywords!
                                      </p>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {match.missing_skills.map((skill: string) => (
                                          <span key={skill} className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-105 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition cursor-help" title={`Learn ${skill} to increase match score`}>
                                            <BookOpen size={12} /> {skill}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  );
}
