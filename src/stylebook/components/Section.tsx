interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, children, className = "" }: Props) {
  return (
    <section className={`card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
