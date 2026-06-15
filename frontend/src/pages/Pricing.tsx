import { useState } from 'react';
import Layout from '../components/ui/Layout';
import { Check, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-36 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-full rounded-full bg-teal-500/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-1/3 h-1/2 rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-teal-500/20">
            Clear Pricing Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Flexible Plans Tailored for Your Growth
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto leading-relaxed">
            DataNexus is entirely free for candidates. Recruiters get access to robust tools to post listings and screen talent.
          </p>

          {/* Monthly / Annual Toggle switch */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-teal-400' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 bg-slate-800 border border-slate-700 rounded-full p-1 transition relative flex items-center"
            >
              <div className={`w-6 h-6 bg-teal-500 rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${isAnnual ? 'text-teal-400' : 'text-slate-400'}`}>
              Annually <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-teal-500/30">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-8 pb-24 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Candidate Card (Always Free) */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-6">
              <div>
                <span className="text-teal-600 font-extrabold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
                  For Candidates
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-4">Professional Talent</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Browse and apply to data engineering, AI and analytic positions across Morocco and international hubs.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-800">MAD 0</span>
                <span className="text-slate-400 text-sm font-semibold">/ always free</span>
              </div>

              <div className="h-px bg-slate-100" />

              <ul className="space-y-4">
                {[
                  "Unlimited job applications",
                  "Personalized cover letters per apply",
                  "Visual comma-separated skill tags",
                  "Resume CV link attachment",
                  "Save and bookmark positions",
                  "Real-time status updates (Reviewing/Interviewing)"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <div className="w-5 h-5 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/register"
                className="block text-center py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition text-sm shadow-md"
              >
                Create Candidate Account
              </Link>
            </div>
          </div>

          {/* Recruiter Card (Paid) */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border-2 border-teal-500 shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Ribbon */}
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-black tracking-widest uppercase px-6 py-2 rotate-45 translate-x-7 translate-y-3 w-32 text-center">
              Popular
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-teal-600 font-extrabold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
                  For Recruiters
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-4">Enterprise Recruiter</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Unlock advanced screening metrics, score matches, and post premium job listings.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-800">
                  {isAnnual ? "MAD 1,039" : "MAD 1,299"}
                </span>
                <span className="text-slate-400 text-sm font-semibold">/ month</span>
              </div>

              <div className="h-px bg-slate-100" />

              <ul className="space-y-4">
                {[
                  "Post unlimited active job listings",
                  "Priority search placement in Jobs list",
                  "Direct database candidate search access",
                  "Automatic skill-matching scoring",
                  "Download verified resumes/CVs in one-click",
                  "Dedicated recruiter portal support"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <div className="w-5 h-5 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/register?role=recruiter"
                className="block text-center py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-teal-500/20"
              >
                Start Free Recruiter Trial
              </Link>
            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="mt-24 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-800">Pricing FAQs</h2>
            <p className="text-slate-500 font-medium">Have questions about billing, plans, or cancellation? We have answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { 
                q: "Is there any setup fee for recruiters?", 
                a: "No. You can start posting jobs immediately. All recruiter accounts start with a 14-day free trial." 
              },
              { 
                q: "Can I cancel my recruiter plan at any time?", 
                a: "Yes. You can cancel your subscription inside your Recruiter settings. You will retain active premium status until the end of the billing period." 
              },
              { 
                q: "Is candidate access really always free?", 
                a: "Absolutely. We will never charge talent to browse, save, or submit job applications to companies." 
              },
              { 
                q: "What payment methods are supported?", 
                a: "We support major credit cards (Visa, MasterCard), PayPal, and wire transfers for annual enterprise subscriptions." 
              }
            ].map((faq, i) => (
              <div key={i} className="space-y-2.5">
                <h4 className="font-bold text-slate-800 flex items-start gap-2 text-base">
                  <HelpCircle size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed pl-7 font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
