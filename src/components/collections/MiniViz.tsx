import { ReactNode } from "react";

// Tiny inline SVG sparkline.
export function Sparkline({
  values,
  width = 80,
  height = 22,
  stroke = "hsl(var(--secondary))",
  fill = "hsl(var(--secondary) / 0.18)",
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (!values || values.length === 0) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `0,${height} ${pts.join(" ")} ${width},${height}`;
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polygon points={area} fill={fill} />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={1.4} />
    </svg>
  );
}

// Inline horizontal bar (used inside a table cell).
export function BarCell({ value, max, format }: { value: number; max: number; format: (n: number) => string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="relative h-2 flex-1 rounded-sm bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-secondary"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums">{format(value)}</span>
    </div>
  );
}

// Progress-style percent bar.
export function PctBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const color =
    pct >= 0.5 ? "bg-secondary" : pct >= 0.3 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="relative h-2 flex-1 rounded-sm bg-muted overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums w-9 text-right">{Math.round(pct * 100)}%</span>
    </div>
  );
}

// Heatmap cell — background intensity scales with value/max.
export function HeatCell({ value, max, children }: { value: number; max: number; children: ReactNode }) {
  const intensity = max > 0 ? Math.min(1, value / max) : 0;
  // Use teal secondary token with variable alpha.
  const bg = intensity > 0 ? `hsl(var(--secondary) / ${(intensity * 0.6).toFixed(3)})` : "transparent";
  const textClass = intensity > 0.55 ? "text-white" : "text-foreground";
  return (
    <td
      className={`px-3 py-2 font-mono whitespace-nowrap tabular-nums ${textClass}`}
      style={{ backgroundColor: bg }}
    >
      {children}
    </td>
  );
}

// Delta indicator (▲ x% vs last)
export function Delta({ prev, curr }: { prev: number; curr: number }) {
  if (!prev) return <span className="text-[10px] text-muted-foreground">new</span>;
  const pct = (curr - prev) / prev;
  const up = pct >= 0;
  const color = up ? "text-success" : "text-destructive";
  return (
    <span className={`text-[10px] font-medium ${color}`}>
      {up ? "▲" : "▼"} {Math.abs(pct * 100).toFixed(1)}%
    </span>
  );
}