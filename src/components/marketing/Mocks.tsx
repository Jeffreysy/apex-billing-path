/**
 * Product mocks for the marketing pages: small, light "app" cards that show a
 * LexCollect screen. Every figure in them is example data and each card says so
 * on screen. One fictional client, Ana Morales, appears across them so the site
 * tells one story.
 */

export const usd = (n: number, decimals = 0) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

type Tone = "ok" | "info" | "warn";

/* ---------- Open receivables chart ---------- */

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const OPEN_AR = [2.71, 2.66, 2.61, 2.58, 2.52, 2.49]; // $M, example

const ArChart = ({ id }: { id: string }) => {
  const w = 440;
  const h = 200;
  const base = 172;
  const top = 28;
  const bw = 40;
  const gap = (w - 40 - bw * MONTHS.length) / (MONTHS.length - 1);
  const y = (v: number) => base - (v / 3) * (base - top);
  return (
    <svg className="hm-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>Open receivables by month, certified on the 1st. Example data, falling from $2.71M in April to $2.49M in September.</title>
      {[1, 2, 3].map((g) => (
        <line key={g} className="hm-chart__grid" x1="20" x2={w - 20} y1={y(g)} y2={y(g)} />
      ))}
      <line className="hm-chart__base" x1="20" x2={w - 20} y1={base} y2={base} />
      {OPEN_AR.map((v, i) => {
        const x = 20 + i * (bw + gap);
        const edge = i === 0 || i === OPEN_AR.length - 1;
        return (
          <g key={MONTHS[i]} className={`hm-chart__bar${edge ? " is-labelled" : ""}`}>
            <title>{`${MONTHS[i]}: $${v.toFixed(2)}M`}</title>
            <rect className="hm-chart__hit" x={x - gap / 2} y={top - 20} width={bw + gap} height={base - top + 40} />
            <path d={`M${x},${base} V${y(v) + 4} q0,-4 4,-4 h${bw - 8} q4,0 4,4 V${base} Z`} />
            <text className="hm-chart__val" x={x + bw / 2} y={y(v) - 8} textAnchor="middle">
              ${v.toFixed(2)}M
            </text>
            <text className="hm-chart__tick" x={x + bw / 2} y={base + 18} textAnchor="middle">
              {MONTHS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const MockSee = ({ id = "ar-chart" }: { id?: string }) => (
  <div className="hm-mock">
    <div className="hm-mock__head">
      <span>Open receivables · certified on the 1st</span>
      <span className="hm-example">Example data</span>
    </div>
    <ArChart id={id} />
    <div className="hm-mock__foot">
      <span>
        <i className="hm-dot hm-dot--ok" aria-hidden="true" /> 6 of 6 monthly snapshots certified
      </span>
      <span>−8.1% in six months</span>
    </div>
  </div>
);

/* ---------- Message thread ---------- */

export const MockConnect = () => (
  <div className="hm-mock hm-mock--thread">
    <div className="hm-mock__head">
      <span>Ana Morales · Payment plan</span>
      <span className="hm-example">Example data</span>
    </div>
    <ol className="hm-thread">
      <li className="hm-msg hm-msg--out">
        <span className="hm-msg__meta">Text · 9:14 AM · Delivered</span>
        Hi Ana, it's the billing team at Morgan &amp; Hale. The card on your payment plan didn't go through. You can
        update it here in about a minute: <u>pay.morganhale.com/u/8F2K</u>
      </li>
      <li className="hm-msg hm-msg--in">
        <span className="hm-msg__meta">Reply · 9:31 AM</span>
        Done, sorry about that. Can I catch up on the 15th?
      </li>
      <li className="hm-event">
        <i className="hm-dot hm-dot--ok" aria-hidden="true" /> Card updated · promise logged: $1,050 on Oct 15
      </li>
    </ol>
  </div>
);

/* ---------- Promises to pay ---------- */

const PROMISES: { client: string; amt: number; due: string; status: string; tone: Tone }[] = [
  { client: "L. Nguyen", amt: 500, due: "Oct 3", status: "Kept", tone: "ok" },
  { client: "A. Morales", amt: 1050, due: "Oct 15", status: "Reminder Oct 14", tone: "info" },
  { client: "R. Diaz", amt: 250, due: "Oct 10", status: "Due Friday", tone: "info" },
  { client: "T. Walker", amt: 400, due: "Sep 30", status: "Missed · follow-up sent", tone: "warn" },
];

export const MockRecover = () => (
  <div className="hm-mock">
    <div className="hm-mock__head">
      <span>Promises to pay</span>
      <span className="hm-example">Example data</span>
    </div>
    <table className="hm-table">
      <thead>
        <tr>
          <th scope="col">Client</th>
          <th scope="col" className="num">
            Amount
          </th>
          <th scope="col">Due</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {PROMISES.map((p) => (
          <tr key={p.client}>
            <td>
              <b>{p.client}</b>
            </td>
            <td className="num">{usd(p.amt)}</td>
            <td>{p.due}</td>
            <td>
              <span className={`hm-chip hm-chip--${p.tone}`}>{p.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- Daily checks ---------- */

const CHECKS: { name: string; meta: string; state: string; tone: Tone }[] = [
  { name: "Monthly receivables snapshot", meta: "Captured on the 1st · 12-month trend", state: "Certified", tone: "ok" },
  { name: "Processor to client system", meta: "2,013 matched · 759 queued for a person", state: "Healthy", tone: "ok" },
  { name: "Contracts marked paid with no payments", meta: "428 found with ~4% collected · reclassified, reversible", state: "Flagged", tone: "warn" },
  { name: "Duplicate and orphan clients", meta: "561 contracts re-linked · 89 duplicates merged", state: "Healthy", tone: "ok" },
  { name: "Double-booking guard", meta: "A retried payment can't be booked twice", state: "Healthy", tone: "ok" },
];

export const MockRun = () => (
  <div className="hm-mock">
    <div className="hm-mock__head">
      <span>Daily checks</span>
      <span className="hm-example">Example data</span>
    </div>
    <ul className="hm-checks">
      {CHECKS.map((c) => (
        <li key={c.name} className={c.tone === "warn" ? "is-flagged" : undefined}>
          <span className="hm-checks__name">{c.name}</span>
          <span className={`hm-chip hm-chip--${c.tone}`}>{c.state}</span>
          <span className="hm-checks__meta">{c.meta}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ---------- Escalation ---------- */

export const MockEscalation = () => (
  <div className="hm-mock">
    <div className="hm-mock__head">
      <span>Escalation · Service team inbox</span>
      <span className="hm-example">Example data</span>
    </div>
    <div className="hm-esc">
      <div className="hm-esc__top">
        <span className="hm-chip hm-chip--warn">High priority</span>
        <span className="hm-esc__age">Opened 2h ago · due today</span>
      </div>
      <p className="hm-esc__title">Client asks to move this month's installment to the 30th</p>
      <dl>
        <div>
          <dt>Client</dt>
          <dd>Ana Morales · Payment plan</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>Client reply to a text</dd>
        </div>
        <div>
          <dt>From</dt>
          <dd>Billing team</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>Service team · case lead</dd>
        </div>
      </dl>
      <div className="hm-esc__trail">
        <span>
          <i className="hm-dot hm-dot--ok" aria-hidden="true" /> Ledger attached
        </span>
        <span>
          <i className="hm-dot hm-dot--ok" aria-hidden="true" /> Deadline watch: no conflict
        </span>
      </div>
    </div>
  </div>
);

/* ---------- Client account ---------- */

export interface AccountState {
  status: string;
  tone: Tone;
  rows: [string, string][];
}

export const AccountCard = ({ state }: { state: AccountState }) => (
  <div className="hm-account">
    <div className="hm-account__head">
      <span className="hm-account__avatar" aria-hidden="true">
        AM
      </span>
      <span>
        <b>Ana Morales</b>
        <span>Payment plan · $350 a month</span>
      </span>
      <span className="hm-example">Example</span>
    </div>
    <span className={`hm-chip hm-chip--${state.tone} hm-account__status`}>{state.status}</span>
    <dl>
      {state.rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  </div>
);
