import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center px-6 text-center">
      {/* 4x4 grid echoing the favicon / pageified storage concept */}
      <div className="grid grid-cols-4 gap-1 mb-8">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-[3px]"
            style={{
              backgroundColor:
                i === 5 || i === 10 ? "#c4653a" : "#e2ddd7",
            }}
          />
        ))}
      </div>

      <p className="font-mono text-xs text-text-tertiary tracking-widest uppercase mb-3">
        Page not found
      </p>
      <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
        404
      </h1>
      <p className="text-text-secondary max-w-sm mb-8">
        This slot doesn&apos;t map to any page. The address space here is empty.
      </p>
      <Link
        href="/"
        className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg>
        Back to MIP Land
      </Link>
    </main>
  );
}
