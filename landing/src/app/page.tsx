"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CircleDot,
  ListChecks,
  Network,
  Radar,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const accent = "#F05A1A";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
} as const;

const modules: Array<{
  category: string;
  title: string;
  description: string;
  metricA: string;
  labelA: string;
  metricB: string;
  labelB: string;
  icon: LucideIcon;
}> = [
  {
    category: "Network",
    title: "Fiber Topology",
    description: "Live peer map, channel surfaces, route context, and node identity in one operational workspace.",
    metricA: "07",
    labelA: "Peers",
    metricB: "04",
    labelB: "Channels",
    icon: Network,
  },
  {
    category: "Liquidity",
    title: "Channel Health",
    description: "Inbound and outbound balances become readable before payment reliability degrades.",
    metricA: "78%",
    labelA: "Health",
    metricB: "02",
    labelB: "Warnings",
    icon: BarChart3,
  },
  {
    category: "Probe",
    title: "Can I Pay?",
    description: "Probe routes before money moves and surface the bottleneck hop that will block settlement.",
    metricA: "82%",
    labelA: "Confidence",
    metricB: "03",
    labelB: "Paths",
    icon: Radar,
  },
  {
    category: "Rebalance",
    title: "Self-Healing Flow",
    description: "Circular payments redistribute liquidity while every movement remains idempotent and auditable.",
    metricA: "04",
    labelA: "Stages",
    metricB: "01",
    labelB: "Ledger",
    icon: RefreshCw,
  },
  {
    category: "Audit",
    title: "Drift Detection",
    description: "The local view reconciles against the Fiber node so stale state is surfaced instead of trusted.",
    metricA: "0.02",
    labelA: "Drift",
    metricB: "Live",
    labelB: "Source",
    icon: ListChecks,
  },
  {
    category: "Alerts",
    title: "Operator Attention",
    description: "Thin channels, stale snapshots, and failed route conditions are framed as work items.",
    metricA: "02",
    labelA: "Open",
    metricB: "15m",
    labelB: "Window",
    icon: AlertTriangle,
  },
];

const steps = [
  "Initialize Fiber node",
  "Discover channels",
  "Build route graph",
  "Calculate liquidity",
  "Synchronize network state",
  "System ready",
];

const stack = ["Next.js", "NestJS", "PostgreSQL", "Prisma", "WebSocket", "Docker Compose", "Nginx", "Cloudflare", "Fiber Node"];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <AppHeader />
      <HeroGrid />
      <ModuleDirectory />
      <SystemRunbook />
      <StackPanel />
      <Footer />
    </main>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-40 grid h-16 grid-cols-[180px_1fr_auto] border-b border-line bg-paper/95 backdrop-blur-sm max-lg:grid-cols-[1fr_auto]">
      <a href="#top" className="flex items-center gap-3 border-r border-line px-5 max-lg:border-r-0">
        <span className="flex h-8 w-8 items-center justify-center border border-ink bg-ink text-paper">
          <Server className="h-4 w-4" />
        </span>
        <span className="leading-none">
          <span className="block text-sm font-black">Fiber</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-copy">liquidity layer</span>
        </span>
      </a>
      <nav className="flex items-center justify-between gap-6 px-5 text-[10px] font-bold uppercase tracking-[0.24em] text-copy max-lg:hidden">
        <a className="transition hover:text-ink" href="#modules">Modules</a>
        <a className="transition hover:text-ink" href="#runbook">Runbook</a>
        <a className="transition hover:text-ink" href="#stack">Stack</a>
        <span className="flex items-center gap-2">
          <CircleDot className="h-3.5 w-3.5" />
          Mainnet operator preview
        </span>
      </nav>
      <div className="flex items-center gap-2 border-l border-line px-3">
        <a
          href="http://localhost:3002/"
          className="inline-flex h-10 items-center justify-center border border-ink bg-ink px-4 text-[10px] font-black uppercase tracking-[0.18em] text-paper transition hover:border-accent hover:bg-accent"
        >
          Open app
        </a>
      </div>
    </header>
  );
}

function HeroGrid() {
  return (
    <section id="top" className="grid min-h-[calc(100vh-4rem)] grid-cols-12 border-b border-line bg-[linear-gradient(90deg,rgba(17,17,17,0.08)_1px,transparent_1px),linear-gradient(rgba(17,17,17,0.08)_1px,transparent_1px)] bg-[length:18rem_7rem]">
      <motion.div {...reveal} className="col-span-12 border-b border-line px-8 py-8 md:px-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-copy">CKB Fiber Builder Hackathon / Operational liquidity OS</p>
        <h1 className="mt-8 max-w-[15ch] text-[clamp(4rem,14vw,12.5rem)] font-black uppercase leading-[0.75]">
          Fiber Liquidity Layer
        </h1>
      </motion.div>

      <motion.div {...reveal} className="col-span-12 border-b border-line lg:col-span-3 lg:border-b-0 lg:border-r">
        <InfoBlock label="Purpose" value="Make liquidity visible, payments predictable, and channels self-healing." />
        <InfoBlock label="Environment" value="A professional workspace for Fiber node operators." />
      </motion.div>

      <motion.div {...reveal} className="col-span-12 min-h-[22rem] border-b border-line bg-paper-muted p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
        <NetworkPlate />
      </motion.div>

      <motion.div {...reveal} className="col-span-12 grid lg:col-span-6">
        <div className="grid min-h-[14rem] grid-cols-[1fr_11rem] border-b border-line max-sm:grid-cols-1">
          <div className="flex flex-col justify-center px-8 py-8">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-7 w-7" />
              <h2 className="text-2xl font-black">Fiber operations cockpit</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-copy">
              A modular interface for channel health, route probing, rebalancing, alerts, and reconciliation.
            </p>
          </div>
          <a href="http://localhost:3002/" className="group flex items-center justify-center border-l border-line text-ink max-sm:min-h-24 max-sm:border-l-0 max-sm:border-t">
            <ArrowUpRight className="h-8 w-8 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
        <div className="grid grid-cols-4 max-sm:grid-cols-2">
          {[
            ["07", "Peers"],
            ["04", "Channels"],
            ["82%", "Probe confidence"],
            ["02", "Warnings"],
          ].map(([value, label]) => (
            <div key={label} className="border-r border-line px-5 py-5 last:border-r-0 max-sm:border-b">
              <p className="font-mono text-2xl font-black">{value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-copy">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-40 border-b border-line p-6 last:border-b-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-copy">{label}</p>
      <p className="mt-5 max-w-sm text-sm leading-6">{value}</p>
    </div>
  );
}

function NetworkPlate() {
  const points = [
    [28, 122],
    [84, 62],
    [154, 100],
    [230, 48],
    [298, 132],
    [198, 192],
    [82, 204],
  ];

  return (
    <div className="relative h-full min-h-72 border border-line bg-paper p-4">
      <div className="absolute left-3 top-3 border border-line bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-copy">
        Live route graph
      </div>
      <svg viewBox="0 0 330 250" className="h-full w-full" aria-hidden>
        {points.slice(1).map(([x, y], index) => (
          <motion.line
            key={`${x}-${y}`}
            x1={points[index][0]}
            y1={points[index][1]}
            x2={x}
            y2={y}
            stroke="#111111"
            strokeOpacity="0.28"
            strokeDasharray="5 8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.06 }}
          />
        ))}
        <motion.path
          d="M28 122 C98 26 196 236 298 132"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.25 }}
        />
        {points.map(([x, y], index) => (
          <motion.circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={index === 2 ? 12 : 8}
            fill={index === 2 ? "#111111" : "#F5F5F2"}
            stroke="#111111"
            strokeWidth="2"
            animate={{ opacity: [0.64, 1, 0.64] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.16 }}
          />
        ))}
      </svg>
    </div>
  );
}

function ModuleDirectory() {
  return (
    <section id="modules" className="border-b border-line px-6 py-10 md:px-14">
      <motion.div {...reveal} className="grid grid-cols-[1fr_1.2fr] gap-6 border-b border-line pb-6 max-lg:grid-cols-1">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-copy">Modules</p>
          <h2 className="mt-3 text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.82]">
            Operator system
          </h2>
        </div>
        <div className="grid content-end gap-3">
          <p className="max-w-2xl text-sm leading-6 text-copy">
            Each module maps to a real application surface: network, channels, liquidity, route probe, rebalancing, alerts, and audit log.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Network", "Liquidity", "Routing", "Audit"].map((item, index) => (
              <span
                key={item}
                className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] ${
                  index === 0 ? "border-ink bg-ink text-paper" : "border-line text-copy"
                }`}
              >
                {item}
              </span>
            ))}
            <div className="ml-auto flex h-9 min-w-64 items-center gap-2 border border-line px-3 text-copy max-sm:ml-0 max-sm:w-full">
              <Search className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]">Search modules</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-px bg-line lg:grid-cols-3">
        {modules.map((module, index) => (
          <ModuleCard key={module.title} module={module} index={index} />
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ module, index }: { module: (typeof modules)[number]; index: number }) {
  const Icon = module.icon;
  return (
    <motion.article
      {...reveal}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group grid min-h-[21rem] grid-rows-[auto_1fr_auto] bg-paper transition hover:bg-[#FAFAF8]"
    >
      <div className="flex items-center justify-between border-b border-line p-4">
        <span className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-copy">
          {module.category}
        </span>
        <Icon className="h-5 w-5 text-ink" />
      </div>
      <div className="flex flex-col justify-center p-7">
        <h3 className="text-3xl font-black uppercase leading-[0.9]">{module.title}</h3>
        <p className="mt-5 text-sm leading-6 text-copy">{module.description}</p>
      </div>
      <div className="grid grid-cols-[1fr_1fr_4rem] border-t border-line">
        <MetricCell value={module.metricA} label={module.labelA} />
        <MetricCell value={module.metricB} label={module.labelB} />
        <a href="http://localhost:3002/" className="flex items-center justify-center border-l border-line transition group-hover:bg-ink group-hover:text-paper">
          <ArrowUpRight className="h-5 w-5" />
        </a>
      </div>
    </motion.article>
  );
}

function MetricCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-line p-4 first:border-l-0">
      <p className="font-mono text-xl font-black">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-copy">{label}</p>
    </div>
  );
}

function SystemRunbook() {
  return (
    <section id="runbook" className="grid border-b border-line lg:grid-cols-[1fr_1.15fr]">
      <motion.div {...reveal} className="border-b border-line p-8 md:p-14 lg:border-b-0 lg:border-r">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-copy">Boot sequence</p>
        <h2 className="mt-4 text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.82]">
          From node state to operator action
        </h2>
      </motion.div>
      <motion.div {...reveal} className="grid">
        {steps.map((step, index) => (
          <div key={step} className="grid grid-cols-[5rem_1fr_auto] items-center border-b border-line px-6 py-5 last:border-b-0">
            <span className="font-mono text-3xl font-black">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-bold uppercase tracking-[0.08em]">{step}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${index === steps.length - 1 ? "bg-accent" : "bg-ink"}`} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function StackPanel() {
  return (
    <section id="stack" className="grid border-b border-line lg:grid-cols-[1.2fr_1fr]">
      <motion.div {...reveal} className="p-8 md:p-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-copy">Stack</p>
        <h2 className="mt-4 text-[clamp(2.25rem,6vw,5.5rem)] font-black uppercase leading-[0.85]">Typed infrastructure surface</h2>
      </motion.div>
      <motion.div {...reveal} className="grid grid-cols-2 border-l border-line max-lg:border-l-0 max-lg:border-t sm:grid-cols-3">
        {stack.map((item) => (
          <div key={item} className="min-h-24 border-b border-r border-line p-4">
            <Activity className="mb-5 h-4 w-4 text-copy" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]">{item}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="grid grid-cols-[1fr_auto] items-center px-6 py-6 font-mono text-[10px] uppercase tracking-[0.18em] text-copy md:px-14">
      <span>2025 Fiber Liquidity Layer / CKB Fiber Builder Hackathon</span>
      <a href="http://localhost:3002/" className="border border-line px-3 py-2 text-ink transition hover:border-ink">
        Launch dashboard
      </a>
    </footer>
  );
}
