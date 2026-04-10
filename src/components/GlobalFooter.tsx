"use client";

import Link from "next/link";

export default function GlobalFooter() {
  return (
    <footer className="w-full bg-text-primary text-surface">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-surface/25 mr-2">Experimental</span>
            <Link
              href="/spam-mev"
              className="text-surface/40 hover:text-surface transition-colors px-2 py-1 rounded"
            >
              Blockspace Under Pressure
            </Link>
            <Link
              href="/infra"
              className="text-surface/40 hover:text-surface transition-colors px-2 py-1 rounded"
            >
              Interactive Infra Playground
            </Link>
          </div>
          <p className="font-mono text-[11px] text-surface/25">
            made by{" "}
            <a
              href="https://x.com/port_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-surface/40 hover:text-surface transition-colors underline underline-offset-2"
            >
              port
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
