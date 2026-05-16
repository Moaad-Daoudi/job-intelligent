import Layout from '../components/ui/Layout';
import { MapPin, Briefcase, DollarSign, Globe, Clock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobDetail() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-8">
        {/* Back Link */}
        <Link to="/jobs" className="flex items-center text-slate-500 hover:text-teal-600 mb-8 font-semibold">
          <ChevronLeft size={20} /> Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mb-6"></div>
              <h1 className="text-4xl font-extrabold mb-2">Senior Data Scientist</h1>
              <p className="text-xl text-teal-600 font-semibold mb-6">Tech Innovators Inc.</p>
              
              <div className="flex flex-wrap gap-4 text-slate-600">
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg"><MapPin size={18} /> Casablanca</span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg"><Briefcase size={18} /> Full-time</span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg"><DollarSign size={18} /> 25k - 35k MAD</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Description</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                We are looking for a highly skilled Data Scientist to join our team in Casablanca. 
                You will be responsible for building predictive models, optimizing data pipelines, 
                and helping our product team make data-driven decisions.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Requirements</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                <li>3+ years of experience in Data Science</li>
                <li>Expertise in Python, PyTorch, and SQL</li>
                <li>Experience with Cloud platforms (AWS/Azure)</li>
                <li>Strong communication skills</li>
              </ul>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm sticky top-8">
              <h4 className="font-bold text-lg mb-6">Job Overview</h4>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-semibold">2 days ago</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Industry</span>
                  <span className="font-semibold">Fintech</span>
                </div>
              </div>
              <button className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition shadow-lg shadow-teal-200">
                Apply Now
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}