"use client";

import { Highlight, type PrismTheme } from "prism-react-renderer";

/* Theme tuned to match the warm/cool design palette */
const theme: PrismTheme = {
  plain: { color: "#1a1714", backgroundColor: "transparent" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "#9b9084", fontStyle: "italic" as const },
    },
    { types: ["punctuation"], style: { color: "#6b6259" } },
    {
      types: ["property", "tag", "constant", "symbol", "deleted"],
      style: { color: "#c4653a" },
    },
    { types: ["boolean", "number"], style: { color: "#3b7dd8" } },
    {
      types: ["string", "char", "attr-value", "inserted"],
      style: { color: "#2a7d6a" },
    },
    { types: ["operator", "entity", "url"], style: { color: "#6b6259" } },
    { types: ["keyword"], style: { color: "#836eab" } },
    {
      types: ["function", "class-name"],
      style: { color: "#c4653a" },
    },
    { types: ["builtin"], style: { color: "#3b7dd8" } },
  ],
};

const LANG_MAP: Record<string, string> = {
  js: "javascript",
  sol: "typescript", // closest match for Solidity
  solidity: "typescript",
  yaml: "yaml",
  bash: "bash",
  typescript: "typescript",
  javascript: "javascript",
};

interface Props {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "javascript" }: Props) {
  const lang = LANG_MAP[language] || language;

  return (
    <Highlight theme={theme} code={code} language={lang}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
