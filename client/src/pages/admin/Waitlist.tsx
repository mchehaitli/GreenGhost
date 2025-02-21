import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays, isWithinInterval } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
  id: number;
  email: string;
  zip_code: string;
  created_at: string;
}

const COLORS = [
  'var(--primary)',
  'color-mix(in srgb, var(--primary) 90%, transparent)',
  'color-mix(in srgb, var(--primary) 80%, transparent)',
  'color-mix(in srgb, var(--primary) 70%, transparent)',
  'color-mix(in srgb, var(--primary) 60%, transparent)'
];

const AdminWaitlist = () => {
  const { data: entries = [], isLoading, error } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to fetch waitlist');
      }
      return res.json();
    },
    retry: 3,
    refetchOnWindowFocus: true
  });

  if (error) {
    return <div className="p-8 text-red-500">Error loading waitlist: {error.message}</div>;
  }

  // Analytics calculations
  const totalSignups = entries.length;
  const last7DaysSignups = entries.filter(entry =>
    isWithinInterval(new Date(entry.created_at), {
      start: subDays(new Date(), 7),
      end: new Date()
    })
  ).length;

  // Prepare data for charts
  const signupsByDate = entries.reduce((acc: Record<string, number>, entry) => {
    const date = format(new Date(entry.created_at), 'MMM d');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const timelineData = Object.entries(signupsByDate).map(([date, count]) => ({
    date,
    signups: count,
  }));

  // Group by ZIP code regions (first digit)
  const regionData = entries.reduce((acc: Record<string, number>, entry) => {
    const region = entry.zip_code.charAt(0);
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(regionData).map(([region, count]) => ({
    region: `Region ${region}`,
    value: count,
  }));

  

  const handleExport = () => {
    const csv = [
      ['Email', 'ZIP Code', 'Joined Date'],
      ...entries.map(entry => [
        entry.email,
        entry.zip_code,
        format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    a.click();
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Waitlist Management</h1>
        <Button onClick={handleExport} className="gap-2 bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Signups
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalSignups}</div>
            <p className="text-xs text-muted-foreground">
              Total waitlist registrations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Last 7 Days
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{last7DaysSignups}</div>
            <p className="text-xs text-muted-foreground">
              New signups in the past week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Signup Timeline</CardTitle>
            <CardDescription>Daily registration trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)' 
                    }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Geographic Distribution</CardTitle>
            <CardDescription>Signups by ZIP code region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="var(--primary)"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)' 
                    }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Waitlist Entries</CardTitle>
          <CardDescription>
            Detailed view of all registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">ZIP Code</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-card-foreground">{entry.email}</TableCell>
                  <TableCell className="text-card-foreground">{entry.zip_code}</TableCell>
                  <TableCell className="text-card-foreground">
                    {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWaitlist;