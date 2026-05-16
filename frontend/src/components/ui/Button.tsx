export default function Button({ children, variant = "primary", ...props }: any) {
  const base = "px-6 py-2 rounded-full font-bold transition";
  const styles = {
    primary: "bg-teal-500 text-white hover:bg-teal-600",
    outline: "border-2 border-slate-200 hover:border-teal-500 text-slate-700"
  };
  return <button className={`${base} ${styles[variant as keyof typeof styles]}`} {...props}>{children}</button>;
}