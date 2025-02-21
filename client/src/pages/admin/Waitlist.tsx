import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import WaitlistAnalytics from "@/components/WaitlistAnalytics";

type WaitlistEntry = {
  id: number;
  email: string;
  zip_code: string;
  created_at: string;
};

const columns: ColumnDef<WaitlistEntry>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "zip_code",
    header: "Zip Code",
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
  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["waitlist"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist");
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist");
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    gcTime: Infinity, // Keep the data indefinitely
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-48">
          <p className="text-lg text-muted-foreground">Loading waitlist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Waitlist Analytics</h1>
        <p className="text-muted-foreground mb-6">
          Track and analyze waitlist signups and regional distribution
        </p>
        <WaitlistAnalytics entries={entries} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6">Waitlist Entries</h2>
        <DataTable columns={columns} data={entries} />
      </div>
    </div>
  );
}