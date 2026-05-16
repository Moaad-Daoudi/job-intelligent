import Layout from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-8">
        <h2 className="text-3xl font-bold mb-8">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Avg Salary", value: "25,000 MAD" },
            { label: "Most In-Demand", value: "Python" },
            { label: "Market Growth", value: "+12%" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-teal-600">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}