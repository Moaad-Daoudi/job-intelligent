import Layout from '../components/ui/Layout';
import { Target, Users, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-28 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <span className="bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-teal-500/20">
            About DataNexus AI
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Bridging the Gap Between Talent and Data Careers
          </h1>
          <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            DataNexus is a state-of-the-art job board built specifically for data professionals. We curate high-impact opportunities in Data Science, Machine Learning, and Big Data.
          </p>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="max-w-6xl mx-auto px-8 pb-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Job Offers", value: "10,000+" },
            { label: "Partner Companies", value: "850+" },
            { label: "Candidates Placed", value: "3,200+" },
            { label: "Match Accuracy", value: "94%" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-4xl font-extrabold text-teal-600 mb-2">{stat.value}</p>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="max-w-5xl mx-auto px-8 pb-24 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Our Core Mission</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Data roles are distinct. Traditional recruitment processes struggle to evaluate specific frameworks, mathematical expertise, and engineering credentials. We have solved this.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              By isolating and structuring data fields natively on our platform, we match skilled professionals with organizations built around dynamic decision architectures.
            </p>
          </div>
          <div className="bg-gradient-to-tr from-slate-900 to-teal-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden h-72 flex flex-col justify-end">
            <div className="absolute top-6 right-6 text-teal-400/20 text-8xl font-black font-serif">AI</div>
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">The Future</p>
            <h3 className="text-2xl font-bold mb-3 leading-snug">Empowering Moroccan Tech Growth</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We coordinate directly with local clusters and global hubs to open up state-of-the-art positions in Casablanca, Rabat, and beyond.
            </p>
          </div>
        </div>

        {/* Corporate Values */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-800">Our Pillars of Excellence</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Values that drive our decisions and design systems every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Shield className="text-teal-600" size={24} />, 
                title: "Strict Privacy & Trust", 
                desc: "Your resume, cover letters, and contact details are fully encrypted and only shared with verified companies." 
              },
              { 
                icon: <Users className="text-teal-600" size={24} />, 
                title: "Curated Partnerships", 
                desc: "We screen every listing. No duplicates, outdated posts, or vague placements." 
              },
              { 
                icon: <TrendingUp className="text-teal-600" size={24} />, 
                title: "Continuous Innovation", 
                desc: "We parse and clean unstructured job files natively, bringing clean metrics directly to your screen." 
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-10 md:p-12 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3 max-w-lg">
            <h3 className="text-2xl md:text-3xl font-bold">Ready to take your data career to the next level?</h3>
            <p className="text-teal-50 text-sm md:text-base leading-relaxed">
              Create a free candidate profile now and start applying directly to high-impact offers.
            </p>
          </div>
          <Link
            to="/register"
            className="flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition shadow-lg shrink-0"
          >
            Create Account <ChevronRight size={18} />
          </Link>
        </div>

      </div>
    </Layout>
  );
}
