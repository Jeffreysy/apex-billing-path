import { cn } from "@/lib/utils";

// LexCollect mark from the brand kit (public/brand/mark.svg): Navy L, Teal C.
// `reversed` is the dark-ground version (public/brand/mark-reversed.svg): white L, bright-teal C.
// Size it with h-*/w-* on className; the artwork keeps its aspect ratio inside that box.
export const BrandMark = ({ reversed = false, className }: { reversed?: boolean; className?: string }) => (
  <svg viewBox="0 0 686 759" className={cn("shrink-0", className)} aria-hidden="true">
    <path fill={reversed ? "#FFFFFF" : "#123A63"} d="M0 0H160V609H686V759H0Z" />
    <path fill={reversed ? "#3DD9C7" : "#12A594"} d="M203 0H686V227H559V127H330V439H559V360H686V567H203Z" />
  </svg>
);
