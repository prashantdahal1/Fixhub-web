import {
  Users,
  UserCheck,
  Wallet,
  Clock,
  Wrench,
  ShieldCheck,
  ServerCog,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Bookings",
    value: "12,482",
    delta: "+12%",
    trend: "up" as const,
    sub: "Since last month",
  },
  {
    label: "Active Disputes",
    value: "862",
    delta: "-7%",
    trend: "down" as const,
    sub: "Ongoing cases",
  },
  {
    label: "Monthly Revenue",
    value: "₹41,210",
    delta: "+18%",
    trend: "up" as const,
    sub: "Estimated this month",
  },
  {
    label: "Open Requests",
    value: "145",
    delta: "-3%",
    trend: "down" as const,
    sub: "Pending allocation",
  },
];

const categoryBreakdown = [
  { label: "Plumbing", value: 42, color: "#2563eb" },
  { label: "Electrical", value: 28, color: "#60a5fa" },
  { label: "HVAC", value: 15, color: "#93c5fd" },
  { label: "Other", value: 15, color: "#dbeafe" },
];

const activity = [
  {
    icon: Wrench,
    iconBg: "bg-blue-50 text-blue-600",
    text: "New request created for Plumbing",
    meta: "Request ID #4953-EOX • 12 minutes ago",
    tag: "New",
    tagStyle: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-emerald-50 text-emerald-600",
    text: "Expert application approved for Aavas Rauniyar",
    meta: "Applicant ID #2210 • 48 minutes ago",
    tag: "Updated",
    tagStyle: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ServerCog,
    iconBg: "bg-violet-50 text-violet-600",
    text: "Payout processed for Electrical Pros LLC",
    meta: "Payout ID #33,452 • 2 hours ago",
    tag: "Completed",
    tagStyle: "bg-violet-50 text-violet-600",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-red-50 text-red-500",
    text: "System Alert: Latency spike in API Gateway",
    meta: "Region: AP-South-1 • 3 hours ago",
    tag: "Urgent",
    tagStyle: "bg-red-50 text-red-500",
  },
];

function donutGradient() {
  let acc = 0;
  return categoryBreakdown
    .map((c) => {
      const start = acc;
      acc += c.value;
      return `${c.color} ${start}% ${acc}%`;
    })
    .join(", ");
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Platform overview for the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-semibold text-slate-900">
                {s.value}
              </p>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-1 ${
                  s.trend === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {s.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {s.delta}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Platform Updates
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All Activity
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${a.iconBg}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800 truncate">
                      {a.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.meta}</p>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${a.tagStyle}`}
                  >
                    {a.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Category Breakdown
          </h2>

          <div className="flex items-center justify-center py-2">
            <div
              className="relative h-36 w-36 rounded-full"
              style={{
                background: `conic-gradient(${donutGradient()})`,
              }}
            >
              <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-slate-900">
                  2.4k
                </span>
                <span className="text-[11px] text-slate-400">jobs</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {categoryBreakdown.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                </span>
                <span className="font-medium text-slate-900">
                  {c.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
