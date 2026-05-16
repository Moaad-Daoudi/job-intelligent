export default function Input(props: any) {
  return (
    <input 
      className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition" 
      {...props} 
    />
  );
}