/** Illustrative six-month trend. In the product this view is the firm's live data. */
const MOMENTUM = {
  months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  payingClients: [412, 438, 467, 503, 541, 586],
  hardDebtCollected: [61, 74, 92, 118, 139, 163], // $K per month
  cashFlow: [388, 402, 431, 468, 507, 549], // $K per month
};

const Spark = ({ values, id }: { values: number[]; id: string }) => {
  const w = 220;
  const h = 56;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${h - 1} ${pts} ${x(values.length - 1)},${h - 1}`;
  const last = values.length - 1;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${id}-t`} preserveAspectRatio="none">
      <title id={`${id}-t`}>Six-month trend, rising</title>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3DD9C7" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3DD9C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id}-g)`} />
      <polyline points={pts} fill="none" stroke="#3DD9C7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(last)} cy={y(values[last])} r="4" fill="#3DD9C7" stroke="#F1F4F7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const pct = (arr: number[]) => Math.round(((arr[arr.length - 1] - arr[0]) / arr[0]) * 100);

const MomentumCard = () => (
  <figure className="momentum" aria-label="Illustrative collections momentum over six months">
    <div className="momentum__head">
      <span>
        <b>Collections momentum</b> · {MOMENTUM.months[0]}–{MOMENTUM.months[5]}
      </span>
      <span className="hm-example">Example data</span>
    </div>
    <div className="momentum__grid">
      <div className="panel-stat">
        <span className="panel-stat__label">Paying clients</span>
        <span className="panel-stat__num">
          {MOMENTUM.payingClients[5].toLocaleString()}
          <small>+{pct(MOMENTUM.payingClients)}%</small>
        </span>
        <Spark values={MOMENTUM.payingClients} id="sp-clients" />
        <span className="panel-stat__foot">current and on plan, up every month</span>
      </div>
      <div className="panel-stat">
        <span className="panel-stat__label">Hard-delinquent $ collected</span>
        <span className="panel-stat__num">
          ${MOMENTUM.hardDebtCollected[5]}K<small>+{pct(MOMENTUM.hardDebtCollected)}%</small>
        </span>
        <Spark values={MOMENTUM.hardDebtCollected} id="sp-debt" />
        <span className="panel-stat__foot">90+ day balances recovered per month</span>
      </div>
      <div className="panel-stat">
        <span className="panel-stat__label">Monthly cash flow</span>
        <span className="panel-stat__num">
          ${MOMENTUM.cashFlow[5]}K<small>+{pct(MOMENTUM.cashFlow)}%</small>
        </span>
        <Spark values={MOMENTUM.cashFlow} id="sp-cash" />
        <span className="panel-stat__foot">collected across all sources</span>
      </div>
    </div>
    <div className="momentum__foot">
      <span className="k">Traced to LexCollect</span>
      <strong className="v">every dollar</strong>
      <span className="s">each payment carries its origin, message and outcome</span>
    </div>
  </figure>
);

export default MomentumCard;
