"use client";

import { motion } from "framer-motion";

const ROWS = 8;
const COLS = 16;

interface PageGridProps {
  label?: string;
  highlightedSlots?: number[];
  warmSlots?: number[];
  coldColor?: string;
  warmColor?: string;
  highlightColor?: string;
  borderColor?: string;
  onSlotClick?: (slot: number) => void;
  showBorder?: boolean;
  compact?: boolean;
}

export default function PageGrid({
  label,
  highlightedSlots = [],
  warmSlots = [],
  coldColor = "bg-problem-cell",
  warmColor = "bg-solution-accent-light",
  highlightColor = "bg-problem-accent",
  borderColor = "border-border",
  onSlotClick,
  showBorder = false,
  compact = false,
}: PageGridProps) {
  const cellSize = compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6";
  const gap = compact ? "gap-[2px]" : "gap-[3px]";

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 ${
        showBorder ? `border-2 border-dashed ${borderColor}` : ""
      } bg-surface-elevated/50`}
    >
      {label && (
        <p className="text-xs font-mono text-text-tertiary mb-2 tracking-wide">
          {label}
        </p>
      )}
      <div className={`grid grid-cols-16 ${gap}`} style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const isHighlighted = highlightedSlots.includes(i);
          const isWarm = warmSlots.includes(i);

          let bgClass = coldColor;
          if (isHighlighted) bgClass = highlightColor;
          else if (isWarm) bgClass = warmColor;

          return (
            <motion.button
              key={i}
              className={`${cellSize} rounded-sm ${bgClass} cell-transition ${
                onSlotClick ? "cursor-pointer hover:scale-110" : "cursor-default"
              }`}
              onClick={() => onSlotClick?.(i)}
              whileTap={onSlotClick ? { scale: 0.9 } : undefined}
              layout
            />
          );
        })}
      </div>
    </div>
  );
}
