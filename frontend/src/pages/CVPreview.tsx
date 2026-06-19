import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Printer, ArrowLeft, Loader2, Sparkles, Award, Briefcase, FileText } from 'lucide-react';

export default function CVPreview() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${baseUrl}/candidate/profile/${candidateId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 403) throw new Error("You do not have permission to view this profile.");
          if (res.status === 404) throw new Error("Candidate profile not found.");
          throw new Error(`Failed to load profile (${res.status})`);
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchProfile();
    }
  }, [candidateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-teal-600" size={36} />
        <p className="font-bold text-slate-500">Generating Professional CV Layout...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-800">An Error Occurred</h2>
        <p className="text-slate-500 max-w-md">{error || "Could not retrieve profile."}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:underline"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const skillsArray = profile.skills
    ? profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 md:px-8 print:bg-white print:py-0 print:px-0">
      
      {/* Printable CSS Optimization */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .skills-badge {
            border: 1px solid #ccc !important;
            background-color: transparent !important;
            color: black !important;
          }
        }
      `}} />

      {/* Control bar */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center no-print">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition bg-white py-2.5 px-4 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 transition py-2.5 px-5 rounded-xl shadow-md shadow-teal-500/20"
        >
          <Printer size={16} /> Print / Save to PDF
        </button>
      </div>

      {/* Premium CV Template Layout */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print-container">
        
        {/* Header Ribbon Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 py-12 px-8 md:px-12 text-white relative">
          <div className="absolute top-4 right-6 text-teal-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 no-print">
            <Sparkles size={14} className="animate-pulse" /> Verified System CV
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {profile.first_name} {profile.last_name}
            </h1>
            
            {profile.title && (
              <p className="text-lg md:text-xl font-bold text-teal-400 border-l-4 border-teal-500 pl-3">
                {profile.title}
              </p>
            )}

            {/* Contact details */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-teal-400" /> {profile.email}</span>
              {profile.phone && (
                <span className="flex items-center gap-1.5"><Phone size={14} className="text-teal-400" /> {profile.phone}</span>
              )}
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-teal-400" /> Morocco</span>
            </div>
          </div>
        </div>

        {/* CV Content Section */}
        <div className="p-8 md:p-12 space-y-10">
          
          {/* Bio / Professional Summary */}
          {profile.bio && (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600 border-b border-teal-100 pb-2 flex items-center gap-2">
                <FileText size={16} /> Professional Summary
              </h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {skillsArray.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600 border-b border-teal-100 pb-2 flex items-center gap-2">
                <Sparkles size={16} /> Technical Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {skillsArray.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-slate-50 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition duration-200 skills-badge"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {profile.experience && (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600 border-b border-teal-100 pb-2 flex items-center gap-2">
                <Briefcase size={16} /> Work Experience
              </h2>
              <p className="text-slate-650 text-sm font-medium leading-relaxed whitespace-pre-wrap pl-1">
                {profile.experience}
              </p>
            </div>
          )}

          {/* Education */}
          {profile.education && (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600 border-b border-teal-100 pb-2 flex items-center gap-2">
                <Award size={16} /> Education & Credentials
              </h2>
              <p className="text-slate-650 text-sm font-medium leading-relaxed whitespace-pre-wrap pl-1">
                {profile.education}
              </p>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 py-6 px-8 text-center text-xs text-slate-400 font-medium">
          Generated automatically by JobIntelligent Career Platform.
        </div>

      </div>
    </div>
  );
}
