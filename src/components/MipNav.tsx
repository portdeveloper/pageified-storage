"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { name: "MIP-8", href: "/mip-8", ready: true, beta: false },
  { name: "MIP-3", href: "/mip-3", ready: true, beta: true },
  { name: "MIP-4", href: "/mip-4", ready: true, beta: true },
];

export default function MipNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-surface-elevated/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6 flex items-center h-12 gap-6">
        <Link
          href="/"
          className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          MIP Land
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all ${
                  isActive
                    ? "bg-text-primary text-surface"
                    : tab.ready
                    ? "text-text-secondary hover:text-text-primary hover:bg-surface"
                    : "text-text-tertiary cursor-default"
                }`}
              >
                {tab.name}
                {!tab.ready && (
                  <span className="ml-1.5 text-[10px] opacity-50">soon</span>
                )}
                {tab.beta && (
                  <span className="ml-1.5 text-[10px] opacity-50">beta</span>
                )}
              </Link>
            );
          })}
        </div>
        <Link
          href="/analyzer"
          className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all ${
            pathname === "/analyzer"
              ? "bg-text-primary text-surface"
              : "text-text-secondary hover:text-text-primary hover:bg-surface"
          }`}
        >
          Analyzer
        </Link>
      </div>
    </nav>
  );
}
