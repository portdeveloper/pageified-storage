import type { Metadata } from "next";
import Monad101Page from "@/components/monad-101/Monad101Page";

export const metadata: Metadata = {
  title: "Monad 101",
  description:
    "A visual primer on Monad: what it is, why it exists, how its architecture fits together, and what developers should understand first.",
  openGraph: {
    title: "Monad 101 | MIP Land",
    description:
      "A visual primer on Monad's shared-state model, Ethereum compatibility, and pipelined architecture.",
  },
};

export default function Page() {
  return <Monad101Page />;
}
