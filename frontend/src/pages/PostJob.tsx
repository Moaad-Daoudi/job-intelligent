import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { Briefcase, MapPin, Tag, FileText, Globe, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function PostJob() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('CDI');
  const [skills, setSkills] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !skills) {
      setError("Please fill in all required fields (Job Title, Location, and Required Skills).");
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:8000/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          location,
          contract_type: contractType,
          skills,
          url,
          description
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to publish job offer.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <span className="bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-teal-500/20">
            Employer Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Publish a New Opportunity
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">
            Connect with top-tier AI researchers, data engineers, and data analysts across Morocco.
          </p>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="max-w-3xl mx-auto px-8 pb-24 -mt-10 relative z-20">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl">
          
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-50 border border-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                🚀
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">Job Published Successfully!</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Your listing is now live and candidate matching is active. Redirecting you to your recruiter dashboard...
              </p>
              <div className="pt-4 animate-pulse text-xs font-bold text-teal-600">Loading Dashboard...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Step 1: Core Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase size={20} className="text-teal-500" />
                  <h3 className="font-extrabold text-lg text-slate-800">1. Job Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Data Engineer"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Casablanca, Morocco"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Contract Type
                    </label>
                    <select
                      value={contractType}
                      onChange={e => setContractType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage (Internship)</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Non spécifié">Not Specified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Required Skills <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-bold">Comma separated</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python, SQL, Apache Spark"
                      value={skills}
                      onChange={e => setSkills(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Content & Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileText size={20} className="text-teal-500" />
                  <h3 className="font-extrabold text-lg text-slate-800">2. Descriptions & Links</h3>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>External Application Link (Optional)</span>
                    <Globe size={14} className="text-slate-400" />
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/apply"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Job Description</span>
                    <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5"><Sparkles size={10} /> Markdown Supported</span>
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Provide a detailed job description, day-to-day duties, and ideal candidate profile..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm font-medium text-slate-700 leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-4">
                <Link
                  to="/recruiter/dashboard"
                  className="flex-1 py-3.5 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition text-sm text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition shadow-lg shadow-teal-500/20 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      Publish Listing <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </Layout>
  );
}
