import { cn } from "@/lib/utils";

// LexCollect mark: the L (structure) cradling the C (collections).
// Paths match marketing-site/assets/img/mark.svg and mark-reversed.svg.
const MARK_COLORS = {
  default: { l: "#123A63", c: "#12A594" },
  reversed: { l: "#FFFFFF", c: "#3DD9C7" },
};

export const BrandMark = ({
  variant = "default",
  className,
}: {
  variant?: keyof typeof MARK_COLORS;
  className?: string;
}) => (
  <svg viewBox="0 0 686 759" className={className} aria-hidden="true" focusable="false">
    <path fill={MARK_COLORS[variant].l} d="M0 0H160V609H686V759H0Z" />
    <path fill={MARK_COLORS[variant].c} d="M203 0H686V227H559V127H330V439H559V360H686V567H203Z" />
  </svg>
);

// Wordmark: "Lex" in Plex Serif, "Collect" in Plex Sans, as on the website header.
export const BrandWordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-semibold leading-none tracking-[-0.01em]", className)}>
    <span className="font-serif">Lex</span>
    <span className="font-sans">Collect</span>
  </span>
);
