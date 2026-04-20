import type { HTMLAttributes, ReactNode } from "react";

type CardTone = "elevated" | "flat" | "highlighted" | "solution";
type CardPadding = "sm" | "md" | "lg";

const toneClasses: Record<CardTone, string> = {
  elevated: "bg-surface-elevated border border-border",
  flat: "bg-surface border border-border",
  highlighted: "bg-surface-elevated border-2 border-solution-accent/30",
  solution: "bg-solution-bg border border-solution-accent/20",
};

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  padding?: CardPadding;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  tone = "elevated",
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-xl ${toneClasses[tone]} ${paddingClasses[padding]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}
