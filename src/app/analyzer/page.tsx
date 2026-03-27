import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyzerPage from "@/components/analyzer/AnalyzerPage";

export const metadata: Metadata = {
  title: "Storage Layout Analyzer",
  description:
    "Analyze Solidity storage layouts and calculate MIP-8 gas savings",
};

export default function Analyzer() {
  return (
    <Suspense>
      <AnalyzerPage />
    </Suspense>
  );
}
