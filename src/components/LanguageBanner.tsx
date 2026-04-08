"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageBanner() {
  const { showBanner, setLocale, dismissBanner } = useLanguage();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden bg-solution-bg border-b border-solution-accent-light"
        >
          <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-center gap-4">
            <p className="font-mono text-xs text-text-secondary">
              Detected Chinese browser / 检测到中文浏览器
            </p>
            <button
              onClick={() => setLocale("zh")}
              className="font-mono text-xs px-3 py-1 rounded-md bg-solution-accent text-white hover:bg-solution-accent/90 transition-colors cursor-pointer"
            >
              切换到中文
            </button>
            <button
              onClick={dismissBanner}
              className="font-mono text-xs px-3 py-1 rounded-md border border-border text-text-tertiary hover:text-text-primary hover:border-text-secondary transition-all cursor-pointer"
            >
              Stay in English
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
