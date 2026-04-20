/**
 * Design tokens mirrored from globals.css @theme for use as JS values
 * (SVG fills, framer-motion props, inline style objects).
 *
 * Keep in sync with src/app/globals.css. Tailwind 4 @theme inline doesn't
 * emit these as :root CSS variables, so components that need the value at
 * runtime import from here instead of hardcoding hex.
 */

export const colors = {
  // Neutral surfaces
  surface: "#f8f6f3",
  surfaceElevated: "#ffffff",
  surfaceAlt: "#f0f7f5",
  border: "#e2ddd7",

  // Text
  textPrimary: "#1a1714",
  textSecondary: "#6b6259",
  textTertiary: "#76685a",

  // Problem palette — warm
  problemBg: "#fdf6ef",
  problemAccent: "#c4653a",
  problemAccentStrong: "#b05226",
  problemAccentLight: "#f0d9c8",
  problemMuted: "#a8856e",
  problemCell: "#ede0d4",
  problemCellHover: "#dbc9b8",

  // Solution palette — cool
  solutionBg: "#f0f7f5",
  solutionAccent: "#2a7d6a",
  solutionAccentLight: "#c8e6df",
  solutionMuted: "#6da396",
  solutionCell: "#d4e8e2",
  solutionCellHover: "#b8d9cf",

  // User palette — blue (spam-mev)
  userBg: "#edf3fc",
  userAccent: "#3b7dd8",
  userAccentLight: "#b8d4f0",
  userMuted: "#6b9dd4",
  userCell: "#d4e4f4",
} as const;
