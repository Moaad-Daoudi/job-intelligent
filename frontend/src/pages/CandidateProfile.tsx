import { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { User, Phone, Briefcase, FileText, Tag, Award, Save, RefreshCw } from 'lucide-react';

export default function CandidateProfile() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    title: '',
    bio: '',
    skills: '',
    resume_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch candidate profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${baseUrl}/candidate/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Server returned error ${res.status}`);
        const data = await res.json();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          title: data.title || '',
          bio: data.bio || '',
          skills: data.skills || '',
          resume_url: data.resume_url || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${baseUrl}/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update profile');
      }

      setSuccess('Your profile has been updated successfully!');
      
      // Update local storage user_name just in case it changed
      localStorage.setItem('user_name', `${formData.first_name} ${formData.last_name}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Convert comma-separated string to array for preview badges
  const skillsArray = formData.skills
    ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <Layout>
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            My Professional Profile
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Manage your personal details, contact info, professional title, biography, and skills.
          </p>
        </div>
      </div>

      {/* Main Form container */}
      <div className="max-w-4xl mx-auto px-8 pb-24 -mt-10">
        
        {loading ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-pulse">
            <div className="grid grid-cols-2 gap-6">
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-12 bg-slate-100 rounded-xl w-3/4" />
            <div className="h-32 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl w-1/2" />
          </div>
        ) : (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
            
            {/* Status alerts */}
            {success && (
              <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              
              {/* Section 1: Personal Details */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User size={18} className="text-teal-500" /> Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="John"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Phone size={16} className="text-slate-400" /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+212 600-000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Briefcase size={16} className="text-slate-400" /> Professional Title
                    </label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Data Scientist / ML Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Biography */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText size={18} className="text-teal-500" /> Biography / Summary
                </h2>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">About Me</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Briefly describe your career background, professional goals, and what you are looking for..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700 leading-relaxed"
                  />
                </div>
              </section>

              {/* Section 3: Skills */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Tag size={18} className="text-teal-500" /> Skills & Expertise
                </h2>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">My Skills (Comma-separated)</label>
                  <input 
                    type="text" 
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Python, PyTorch, SQL, Pandas, LLMs, Docker"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                  />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Enter your technical skills separated by commas. We'll show them as elegant badges.</p>
                </div>

                {skillsArray.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <Award size={13} /> Visual Preview
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold px-3 py-1.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 4: Resume */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText size={18} className="text-teal-500" /> Resume / CV Link
                </h2>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resume URL / Portfolio URL</label>
                  <input 
                    type="url" 
                    name="resume_url"
                    value={formData.resume_url}
                    onChange={handleChange}
                    placeholder="https://myresume-link.com or Google Drive link"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-teal-500/20 disabled:opacity-75"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Profile
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </Layout>
  );
}
