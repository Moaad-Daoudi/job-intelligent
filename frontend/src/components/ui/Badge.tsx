export default function Badge({ text }: { text: string }) {
  return (
    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
      {text}
    </span>
  );
}