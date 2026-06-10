import type { ReactNode } from "react";
import {
  useGetDashboardStats,
  useGetPredictionHistory,
  type BreakdownItem,
  type PredictionRecord,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle, Clock, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: history, isLoading: historyLoading } =
    useGetPredictionHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          High-level metrics and recent prediction activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers}
          icon={<Users size={20} className="text-primary" />}
          loading={statsLoading}
        />
        <StatCard
          title="High Risk Count"
          value={stats?.highRiskCount}
          icon={<AlertTriangle size={20} className="text-destructive" />}
          loading={statsLoading}
        />
        <StatCard
          title="Avg Tenure (Months)"
          value={stats?.avgTenure ? Math.round(stats.avgTenure) : undefined}
          icon={<Clock size={20} className="text-chart-2" />}
          loading={statsLoading}
        />
        <StatCard
          title="Avg Monthly Charges"
          value={
            stats?.avgMonthlyCharges
              ? `$${stats.avgMonthlyCharges.toFixed(2)}`
              : undefined
          }
          icon={<DollarSign size={20} className="text-chart-3" />}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Contract Breakdown</CardTitle>
            <CardDescription>Distribution by contract type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.contractBreakdown || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Internet Service</CardTitle>
            <CardDescription>Distribution by service type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.internetServiceBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="label"
                  >
                    {(stats?.internetServiceBreakdown || []).map(
                      (entry: BreakdownItem, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>
            Latest risk assessments run through the model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Prediction</th>
                    <th className="px-4 py-3 font-medium">Risk Level</th>
                    <th className="px-4 py-3 font-medium">Probability</th>
                    <th className="px-4 py-3 font-medium">Tenure</th>
                    <th className="px-4 py-3 font-medium">Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.slice(0, 8).map((record: PredictionRecord) => (
                    <tr
                      key={record.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {record.prediction}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge
                          level={record.riskLevel as "Low" | "Medium" | "High"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {(record.probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.tenure} mo
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        ${record.monthlyCharges?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {history?.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No recent predictions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value?: string | number;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const variants = {
    Low: "bg-green-500/10 text-green-500 border-green-500/20",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    High: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[level]}`}
    >
      {level}
    </span>
  );
}
