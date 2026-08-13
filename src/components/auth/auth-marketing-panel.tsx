import { BellRing, PieChart, ShieldCheck, Wallet } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Real burn rate, automatically",
    description:
      "Annual plans are pro-rated to a true monthly cost — no mental math, ever.",
    color: "#3987e5",
    glow: "rgb(57 135 229 / 18%)",
  },
  {
    icon: PieChart,
    title: "See where it's actually going",
    description:
      "Spend broken down by category, updated the moment you add something.",
    color: "#9085e9",
    glow: "rgb(144 133 233 / 18%)",
  },
  {
    icon: BellRing,
    title: "Never get blindsided again",
    description:
      "Renewal warnings 7 and 30 days out, right on your dashboard.",
    color: "#d55181",
    glow: "rgb(213 81 129 / 18%)",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Your subscriptions are visible only to your account.",
    color: "#199e70",
    glow: "rgb(25 158 112 / 18%)",
  },
];

const previewCategories = [
  { label: "Dev Tools", amount: "$21.00", color: "#3987e5" },
  { label: "Hosting & Infra", amount: "$105.50", color: "#d95926" },
  { label: "Marketing", amount: "$13.00", color: "#d55181" },
];

export function AuthMarketingPanel() {
  return (
    <div className="gradient-mesh animate-gradient-shift relative hidden flex-col justify-center overflow-hidden px-10 pt-24 pb-12 text-white lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            For everyone who cares about their money
          </span>
          <h1 className="text-4xl leading-[1.1] font-semibold text-balance">
            Every subscription.
            <br />
            <span className="text-gradient-brand">One dashboard.</span>
            <br />
            Zero surprises.
          </h1>
          <p className="text-sm leading-relaxed text-white/65">
            Stop losing track of what you&apos;re paying for. Add every SaaS
            and cloud subscription once, and always know your real burn rate
            — before the bill hits.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {features.map((feature) => (
            <li key={feature.title} className="group flex items-start gap-3">
              <span
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110"
                style={{ background: feature.glow, color: feature.color }}
              >
                <feature.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-sm text-white/55">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.09]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              This month
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
              Renews in 3 days
            </span>
          </div>
          <p className="mt-1 text-2xl font-semibold">$139.50</p>
          <p className="text-xs text-white/50">Projected monthly burn</p>
          <div className="mt-4 flex flex-col gap-2">
            {previewCategories.map((category) => (
              <div
                key={category.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-white/70">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full"
                    style={{ background: category.color }}
                  />
                  {category.label}
                </span>
                <span className="font-medium">{category.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
