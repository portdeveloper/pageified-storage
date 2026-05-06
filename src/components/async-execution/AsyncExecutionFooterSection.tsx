export default function AsyncExecutionFooterSection() {
  return (
    <footer className="py-16 px-6 bg-text-primary text-surface">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="font-mono text-xs uppercase text-surface/50 mb-3">
              Source material
            </p>
            <a
              href="https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface/80 hover:text-surface transition-colors underline underline-offset-4 decoration-surface/20 hover:decoration-surface/60"
            >
              Asynchronous Execution in Monad docs -&gt;
            </a>
          </div>
          <div>
            <p className="font-mono text-xs uppercase text-surface/50 mb-3">
              About
            </p>
            <p className="text-sm text-surface/60 leading-relaxed">
              A visual companion for Monad&apos;s consensus-execution pipeline:
              ordering first, execution alongside, verification through delayed
              state roots.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
