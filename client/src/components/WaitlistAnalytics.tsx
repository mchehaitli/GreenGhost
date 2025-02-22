import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WaitlistEntry {
  id: number;
  email: string;
  created_at: string;
}

interface WaitlistAnalyticsProps {
  entries: WaitlistEntry[];
}

const WaitlistAnalytics = ({ entries }: WaitlistAnalyticsProps) => {
  // Calculate daily signups
  const dailySignups = useMemo(() => {
    const signupsByDate = entries.reduce((acc: Record<string, number>, entry) => {
      const date = format(new Date(entry.created_at), 'MM/dd/yyyy');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(signupsByDate)
      .map(([date, count]) => ({
        date,
        signups: count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [entries]);

  return (
    <div className="grid gap-4">
      {/* Total Entries Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {entries.length}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total waitlist entries
          </p>
        </CardContent>
      </Card>

      {/* Daily Signups Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Signups (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="signups" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistAnalytics;