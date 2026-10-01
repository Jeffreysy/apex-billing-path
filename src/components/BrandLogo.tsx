import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

// LexCollect mark: white dollar sign on a Teal tile. Same artwork as public/favicon.svg.
// Size it with h-*/w-* on className; the glyph scales to half the tile.
export const BrandMark = ({ className }: { className?: string }) => (
  <span
    className={cn("flex shrink-0 items-center justify-center rounded-lg bg-[#12A594] text-white", className)}
    aria-hidden="true"
  >
    <DollarSign className="h-1/2 w-1/2" />
  </span>
);

// Wordmark: "Lex" in Plex Serif, "Collect" in Plex Sans, as on the website header.
export const BrandWordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-semibold leading-none tracking-[-0.01em]", className)}>
    <span className="font-serif">Lex</span>
    <span className="font-sans">Collect</span>
  </span>
);
