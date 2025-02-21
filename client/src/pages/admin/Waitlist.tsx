import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["waitlist"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist");
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist");
      }
      return response.json();
    },
    refetchInterval: 1000,
    staleTime: 0,
    cacheTime: 0,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Waitlist Entries</h1>
      <DataTable columns={columns} data={entries} />
    </div>
  );
}