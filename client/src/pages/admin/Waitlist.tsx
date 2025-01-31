import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface WaitlistEntry {
  id: number;
  email: string;
  zip_code: string;
  created_at: string;
}

const AdminWaitlist = () => {
  const { data: entries, isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ['/api/waitlist'],
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Waitlist Entries</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>ZIP Code</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries?.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.email}</TableCell>
              <TableCell>{entry.zip_code}</TableCell>
              <TableCell>
                {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminWaitlist;
