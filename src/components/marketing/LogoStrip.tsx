import { LOGO_STRIP } from "@/lib/marketing";
import { INTEGRATION_MARKS } from "@/lib/integration-logos";

// One pass of the strip. The track holds two passes and slides left by one pass, so the loop is
// seamless; the copy is hidden from screen readers. Without motion (or before CSS loads) the
// strip is the first pass, wrapped. Pure CSS, so the WordPress build needs no script for it.
const Pass = ({ copy = false }: { copy?: boolean }) => (
  <ul className="logo-strip__pass" aria-hidden={copy || undefined}>
    {LOGO_STRIP.map((name) => (
      <li key={name}>
        {INTEGRATION_MARKS[name] && (
          <svg viewBox={INTEGRATION_MARKS[name].viewBox} aria-hidden="true" focusable="false">
            <path d={INTEGRATION_MARKS[name].d} />
          </svg>
        )}
        {name}
      </li>
    ))}
    <li className="logo-strip__more">Your bank</li>
  </ul>
);

const LogoStrip = () => (
  <div className="hm-works">
    <span>Works across</span>
    <div className="logo-strip">
      <div className="logo-strip__track">
        <Pass />
        <Pass copy />
      </div>
    </div>
  </div>
);

export default LogoStrip;
