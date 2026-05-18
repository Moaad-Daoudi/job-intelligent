import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import {
  MapPin, Briefcase, Calendar, Globe, Building2,
  ChevronLeft, ExternalLink, Tag, Clock, Share2,
  Bookmark, CheckCircle, X, Lock, Loader2, Sparkles
} from 'lucide-react';

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-100">
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value || value === 'N/A' || value === 'Non spécifié') return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-teal-500 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-800 font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth / Candidates Interaction States
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:8000/jobs/${id}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setJob(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  // Fetch saved/applied status if logged in
  useEffect(() => {
    const fetchStatus = async () => {
      if (!isLoggedIn || !id) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/jobs/${id}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSaved(data.saved);
          setApplied(data.applied);
        }
      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    };
    fetchStatus();
  }, [id, isLoggedIn]);

  // Handle Save / Unsave toggle
  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setSavingJob(true);
    const token = localStorage.getItem('token');
    const method = saved ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`http://localhost:8000/jobs/${id}/save`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSaved(!saved);
      }
    } catch (err) {
      console.error("Error toggling job save:", err);
    } finally {
      setSavingJob(false);
    }
  };

  // Open apply modal or prompt auth
  const handleApplyClick = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowApplyModal(true);
  };

  // Submit job application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApp(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:8000/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cover_letter: coverLetter })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Application failed');
      }

      setApplied(true);
      setAppSuccess(true);
      setShowApplyModal(false);
      setCoverLetter('');
      
      // Auto dismiss success toast
      setTimeout(() => setAppSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="max-w-6xl mx-auto py-24 px-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    </Layout>
  );

  if (error || !job) return (
    <Layout>
      <div className="max-w-6xl mx-auto py-24 px-8 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Job not found</h2>
        <p className="text-slate-500 mb-8">{error || 'This job listing may no longer be available.'}</p>
        <Link to="/jobs" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition">
          Back to Jobs
        </Link>
      </div>
    </Layout>
  );

  const skills: string[] = job.skills
    ? job.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const publishedDate = job.published_date
    ? String(job.published_date).slice(0, 10)
    : null;

  return (
    <Layout>
      {/* Success application toast banner */}
      {appSuccess && (
        <div className="bg-green-600 text-white font-bold py-4 px-8 text-center text-sm shadow-xl flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle size={18} /> Congratulations! Your application has been submitted successfully.
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-teal-400 transition font-semibold mb-8 text-sm"
          >
            <ChevronLeft size={18} /> Back to Jobs
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex gap-6 items-start">
              {/* Company Avatar */}
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center font-extrabold text-3xl text-white border border-white/20 flex-shrink-0">
                {job.company ? job.company.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                  {job.title || 'Untitled Position'}
                </h1>
                {job.company && (
                  <Link
                    to={`/companies/${job.company_id}`}
                    className="text-teal-400 font-bold text-lg hover:text-teal-300 transition mb-4 inline-block"
                  >
                    {job.company}
                  </Link>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  {job.location && (
                    <span className="flex items-center gap-1.5 bg-white/10 text-slate-300 text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/10">
                      <MapPin size={14} className="text-teal-400" /> {job.location}
                    </span>
                  )}
                  {job.contract_type && job.contract_type !== 'Non spécifié' && (
                    <span className="flex items-center gap-1.5 bg-white/10 text-slate-300 text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/10">
                      <Briefcase size={14} className="text-teal-400" /> {job.contract_type}
                    </span>
                  )}
                  {publishedDate && (
                    <span className="flex items-center gap-1.5 bg-white/10 text-slate-300 text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/10">
                      <Calendar size={14} className="text-teal-400" /> {publishedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto flex-shrink-0">
              
              {/* Apply button based on user state */}
              {applied ? (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 bg-green-600/90 text-white px-10 py-4 rounded-xl font-bold cursor-default shadow-md"
                >
                  <CheckCircle size={18} /> Already Applied
                </button>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg shadow-teal-500/30 text-center"
                >
                  Apply to Job <ExternalLink size={16} />
                </button>
              )}

              {/* Bookmark Save Button */}
              <button
                onClick={handleToggleSave}
                disabled={savingJob}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition text-sm border ${
                  saved 
                    ? 'bg-teal-50 text-teal-700 border-teal-200' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
                }`}
              >
                {savingJob ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Bookmark size={15} className={saved ? 'fill-teal-600 text-teal-600' : ''} />
                )}
                {saved ? 'Job Saved' : 'Save Position'}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-slate-300 px-6 py-3 rounded-xl font-semibold transition border border-white/10 text-sm"
              >
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 pb-24 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main — Skills & Description */}
          <div className="lg:col-span-2 space-y-6">

            {/* Skills */}
            {skills.length > 0 && (
              <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5">
                  <Tag size={20} className="text-teal-500" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => <SkillBadge key={s} label={s} />)}
                </div>
              </section>
            )}

            {/* Description */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5 border-b border-slate-100 pb-4">
                Job Description
              </h2>
              {job.description ? (
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">📄</p>
                  <p className="font-medium">No detailed description available for this listing.</p>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-teal-600 font-bold hover:underline"
                    >
                      View full job on original site <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Job Details Card */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Job Details</h3>
              <div className="space-y-5">
                <InfoRow icon={<MapPin size={18} />} label="Location" value={job.location} />
                <InfoRow icon={<Briefcase size={18} />} label="Contract" value={job.contract_type} />
                <InfoRow icon={<Clock size={18} />} label="Published" value={publishedDate || ''} />
                {job.website && (
                  <InfoRow icon={<Globe size={18} />} label="Company Website" value={job.website} />
                )}
              </div>
            </section>

            {/* Company Card */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6">About the Company</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center font-bold text-2xl text-teal-600">
                  {job.company ? job.company.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{job.company || 'Unknown'}</p>
                  <p className="text-slate-500 text-sm">{job.sector || job.industry || 'Technology'}</p>
                </div>
              </div>
              {job.website && (
                <a
                  href={job.website.startsWith('http') ? job.website : `https://${job.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-5 hover:underline"
                >
                  <Globe size={14} /> {job.website}
                </a>
              )}
              {job.company_id && (
                <Link
                  to={`/companies/${job.company_id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 text-sm text-center hover:border-teal-500 hover:text-teal-600 transition"
                >
                  <Building2 size={16} /> View Company Profile
                </Link>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* ── APPLY MODAL OVERLAY ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setShowApplyModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <Sparkles size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Fast Apply</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
              Apply to {job.company}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mb-6">
              Position: <span className="text-slate-800 font-bold">{job.title}</span>
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are the perfect fit for this role. Recruiters love concise, skill-focused summaries!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition text-sm text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="flex-1 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition shadow-lg shadow-teal-500/20 text-sm flex items-center justify-center gap-2"
                >
                  {submittingApp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTH PROMPT MODAL OVERLAY ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative text-center">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-teal-100">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
              You need a candidate profile account on DataNexus to save jobs or submit cover letter applications.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition shadow-lg shadow-teal-500/20 text-sm text-center"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="py-3.5 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-bold text-slate-700 transition text-sm text-center"
              >
                Create Candidate Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}