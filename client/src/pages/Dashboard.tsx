import { useTransactions } from "@/hooks/use-transactions";
import { useMerchant } from "@/hooks/use-merchants";
import { TransactionList } from "@/components/TransactionList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { data: merchant } = useMerchant();
  const { data: transactions, isLoading } = useTransactions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const txs = transactions || [];
  const totalVolume = txs
    .filter((t) => t.status === "success")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const successCount = txs.filter((t) => t.status === "success").length;
  const uniqueCustomers = new Set(txs.map((t) => t.customerEmail).filter(Boolean)).size;

  // Mock chart data - in real app, aggregate on backend
  const chartData = [
    { name: "Mon", value: 400 },
    { name: "Tue", value: 300 },
    { name: "Wed", value: 550 },
    { name: "Thu", value: 450 },
    { name: "Fri", value: 600 },
    { name: "Sat", value: 200 },
    { name: "Sun", value: 300 },
  ];

  const stats = [
    {
      label: "Total Volume",
      value: (totalVolume / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: DollarSign,
      trend: "+12.5%",
      color: "text-emerald-600",
    },
    {
      label: "Successful Payments",
      value: successCount,
      icon: Activity,
      trend: "+4.3%",
      color: "text-blue-600",
    },
    {
      label: "Customers",
      value: uniqueCustomers,
      icon: Users,
      trend: "+8.1%",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {merchant?.businessName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your payments today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="card-hover border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold mt-2 font-mono tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-600 font-medium flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Transaction volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
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
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest processed payments</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
             <div className="px-6">
                <TransactionList transactions={txs} limit={5} />
             </div>
             <div className="mt-6 px-6">
                <button className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 rounded-lg hover:bg-primary/5">
                   View All Transactions
                </button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
