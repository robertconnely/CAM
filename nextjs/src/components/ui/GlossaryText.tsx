"use client";

import { type ReactNode } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

const INLINE_TERMS = ["SCAMPER", "PDLC", "IRR", "NPV", "NPS", "ARR", "ROIC", "CAM"];

/**
 * Renders text with automatic InfoTooltips for glossary terms.
 * Use in place of raw text output when the content may contain jargon.
 */
export function GlossaryText({ children }: { children: string }) {
  const pattern = new RegExp(`\\b(${INLINE_TERMS.join("|")})\\b`, "g");
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(children)) !== null) {
    if (match.index > last) {
      parts.push(children.slice(last, match.index));
    }
    const term = match[1];
    if (GLOSSARY[term]) {
      parts.push(
        <InfoTooltip key={match.index} text={GLOSSARY[term]}>
          {term}
        </InfoTooltip>
      );
    } else {
      parts.push(term);
    }
    last = pattern.lastIndex;
  }
  if (last < children.length) parts.push(children.slice(last));

  return <>{parts.length > 0 ? parts : children}</>;
}
