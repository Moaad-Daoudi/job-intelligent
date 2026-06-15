// import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function CompanyDetail() {
  // const { id } = useParams(); // Get company ID from URL

  return (
    <Layout>
      <div className="bg-white p-12 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-200 rounded-2xl" />
          <div>
            <h1 className="text-3xl font-bold">Company Name</h1>
            <p className="text-slate-500">Industry: Tech / Data</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto py-12 px-8">
        <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
        {/* Here you would map jobs where company_id = {id} */}
      </div>
    </Layout>
  );
}