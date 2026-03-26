interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** When true, this section will NOT start on a new page in print. Use for grouping. */
  noPageBreak?: boolean;
}

export default function Section({ title, children, className = "", noPageBreak = false }: Props) {
  return (
    <section className={`card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${noPageBreak ? "" : "print-break-before"} ${className}`}>
      <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
          {title}
        </h2>
      </div>
      <div className="p-8">{children}</div>
    </section>
  );
}
