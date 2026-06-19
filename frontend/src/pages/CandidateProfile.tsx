import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from "react";
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import {
  User, Phone, Briefcase, FileText, Tag, Award, Save, RefreshCw,
  X, Plus, Sparkles, FileCheck
} from 'lucide-react';

export default function CandidateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    title: '',
    bio: '',
    education: '',
    experience: '',
  });

  // Skills managed as an array of tags
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${baseUrl}/candidate/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Server returned error ${res.status}`);
        const data = await res.json();
        setCandidateId(data.id);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          title: data.title || '',
          bio: data.bio || '',
          education: data.education || '',
          experience: data.experience || '',
        });
        // Parse stored comma-separated skills into array
        if (data.skills && data.skills.trim()) {
          setSkills(data.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Skill tag helpers ──────────────────────────────────────────────────────
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    // Prevent duplicates (case-insensitive)
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
    skillInputRef.current?.focus();
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
      // Remove last skill with backspace when input is empty
      setSkills(skills.slice(0, -1));
    }
  };

  // ── Save & redirect to AI matches ─────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('token');

    const payload = {
      ...formData,
      skills: skills.join(', '),
    };

    try {
      const res = await fetch(`${baseUrl}/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update profile');
      }

      localStorage.setItem('user_name', `${formData.first_name} ${formData.last_name}`);
      setSuccess('Profile saved! Taking you to your AI job matches...');

      // After 1.5 s, navigate to dashboard with ai-matches tab active
      setTimeout(() => {
        navigate('/candidate/dashboard?tab=ai-matches');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* ── Top Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            My Professional Profile
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Fill in your details — your CV will be auto-generated and AI will match you with the best jobs.
          </p>
        </div>
      </div>

      {/* ── Main Form ── */}
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
              <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl font-bold flex items-center gap-2">
                <Sparkles size={18} /> {success}
              </div>
            )}
            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">

              {/* ── Section 1: Personal Info ── */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User size={18} className="text-teal-500" /> Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text" name="first_name" value={formData.first_name}
                      onChange={handleChange} required placeholder="John"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text" name="last_name" value={formData.last_name}
                      onChange={handleChange} required placeholder="Doe"
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
                      type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} placeholder="+212 600-000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Briefcase size={16} className="text-slate-400" /> Professional Title
                    </label>
                    <input
                      type="text" name="title" value={formData.title}
                      onChange={handleChange} placeholder="e.g. Data Scientist / ML Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700"
                    />
                  </div>
                </div>
              </section>

              {/* ── Section 2: Bio ── */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText size={18} className="text-teal-500" /> Biography / Summary
                </h2>
                <label className="block text-sm font-bold text-slate-700 mb-2">About Me</label>
                <textarea
                  name="bio" value={formData.bio} onChange={handleChange} rows={4}
                  placeholder="Briefly describe your career background, professional goals, and what you are looking for..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700 leading-relaxed"
                />
              </section>

              {/* ── Section 3: Skills Tag Input ── */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Tag size={18} className="text-teal-500" /> Skills &amp; Expertise
                </h2>

                {/* Tag chips area */}
                <div
                  className="min-h-[56px] flex flex-wrap gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-text focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white transition"
                  onClick={() => skillInputRef.current?.focus()}
                >
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 font-bold text-xs px-3 py-1.5 rounded-full group"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSkill(index); }}
                        className="text-teal-400 hover:text-red-500 transition ml-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  <input
                    ref={skillInputRef}
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
                    className="flex-1 min-w-[160px] bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 py-1 px-1"
                  />
                </div>

                {/* Add button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={!skillInput.trim()}
                    className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={15} /> Add Skill
                  </button>
                  <p className="text-xs text-slate-400 font-medium">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">Enter</kbd> or click Add · Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">⌫</kbd> to remove last
                  </p>
                </div>

                {skills.length > 0 && (
                  <p className="text-xs text-slate-400 font-medium">
                    {skills.length} skill{skills.length !== 1 ? 's' : ''} added — these will be used by the AI to match you with jobs.
                  </p>
                )}
              </section>

              {/* ── Section 4: Education & Experience ── */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Award size={18} className="text-teal-500" /> Education &amp; Experience
                </h2>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Education Background</label>
                  <textarea
                    name="education" value={formData.education} onChange={handleChange} rows={3}
                    placeholder={"Master's in Data Science — University of Rabat (2022–2024)\nBachelor's in Computer Science — ENSIAS (2019–2022)"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700 leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Add your degrees, diplomas, and certifications — one per line.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Work Experience</label>
                  <textarea
                    name="experience" value={formData.experience} onChange={handleChange} rows={5}
                    placeholder={"Junior Data Engineer — TechCompany (2024–Present)\n• Built ETL pipelines with Apache Spark\n• Optimized PostgreSQL queries reducing latency by 40%\n\nData Analyst Intern — StartupXYZ (2023)\n• Built dashboards in Power BI"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-medium text-slate-700 leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Add your roles and accomplishments — the AI uses these to rank job matches.</p>
                </div>
              </section>

              {/* ── Section 5: Auto-Generated CV Banner ── */}
              <section>
                <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-indigo-50 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-200">
                    <FileCheck size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm mb-1">Your CV is Auto-Generated 🎉</p>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Once you save your profile, a beautiful professional CV will be automatically generated from your information — no upload needed.
                      You can view, print, or save it as PDF from your dashboard.
                    </p>
                    {candidateId && (
                      <a
                        href={`/cv/${candidateId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-teal-600 hover:text-teal-800 transition underline underline-offset-2"
                      >
                        <Sparkles size={13} /> Preview my generated CV →
                      </a>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Save Button ── */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-teal-400" />
                  After saving, AI will instantly find the best job matches for your profile.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-teal-500/20 disabled:opacity-75"
                >
                  {saving ? (
                    <><RefreshCw size={18} className="animate-spin" /> Saving & Matching...</>
                  ) : (
                    <><Save size={18} /> Save &amp; Find My Matches</>
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
