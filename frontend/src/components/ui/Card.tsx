export default function Card({ children, className = "" }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 transition ${className}`}>
      {children}
    </div>
  );
}