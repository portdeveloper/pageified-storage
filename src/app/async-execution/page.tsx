import type { Metadata } from "next";
import AsyncExecutionHeroSection from "@/components/async-execution/AsyncExecutionHeroSection";
import BudgetComparisonSection from "@/components/async-execution/BudgetComparisonSection";
import DelayedRootSection from "@/components/async-execution/DelayedRootSection";
import DeterminismSection from "@/components/async-execution/DeterminismSection";
import DeveloperImplicationsSection from "@/components/async-execution/DeveloperImplicationsSection";
import AsyncExecutionFooterSection from "@/components/async-execution/AsyncExecutionFooterSection";

export const metadata: Metadata = {
  title: "Asynchronous Execution",
  description:
    "An interactive explainer for Monad asynchronous execution: consensus decides transaction order while execution runs in a separate, slightly lagged lane.",
  openGraph: {
    title: "Asynchronous Execution | MIP Land",
    description:
      "Consensus decides transaction order while execution runs in a separate, slightly lagged lane.",
  },
};

export default function AsyncExecutionPage() {
  return (
    <main>
      <AsyncExecutionHeroSection />
      <BudgetComparisonSection />
      <DelayedRootSection />
      <DeterminismSection />
      <DeveloperImplicationsSection />
      <AsyncExecutionFooterSection />
    </main>
  );
}
