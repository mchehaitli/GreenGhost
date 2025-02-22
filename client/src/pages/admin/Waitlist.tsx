import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import WaitlistAnalytics from "@/components/WaitlistAnalytics";
import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import * as XLSX from 'xlsx';
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
};

const columns: ColumnDef<WaitlistEntry>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.original.created_at), "MMM dd, yyyy HH:mm:ss");
    },
  },
];

export default function WaitlistPage() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const { data: entries = [], isLoading: dataLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist", {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized access to waitlist data');
          return [];
        }
        throw new Error("Failed to fetch waitlist");
      }
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
    gcTime: Infinity,
  });

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const exportToExcel = () => {
    const exportData = entries.map(entry => ({
      Email: entry.email,
      'Signup Date': format(new Date(entry.created_at), "MMM dd, yyyy HH:mm:ss")
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    XLSX.utils.book_append_sheet(wb, ws, "Waitlist Entries");
    XLSX.writeFile(wb, `waitlist-entries-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Waitlist Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze waitlist signups
          </p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <WaitlistAnalytics entries={entries} />

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Waitlist Entries</h2>
          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
        <DataTable columns={columns} data={entries} />
      </div>
    </div>
  );
}