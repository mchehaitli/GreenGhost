import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin, 
  FileText,
  Save,
  Download,
  Eye,
  User,
  Users,
  BarChart,
  Mail,
  Loader2,
} from 'lucide-react';

// Types
type WaitlistEntry = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
};

type DateRange = {
  from: Date;
  to: Date;
} | null;

type SegmentationCriteria = {
  dateRange: DateRange;
  states: string[];
  cities: string[];
  zipCodes: string[];
};

type SortDirection = 'asc' | 'desc';
type SortField = 'created_at' | 'zip_code';

const AdminPortal = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist-entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  // Queries
  const {
    data: waitlistEntries = [],
    isLoading: waitlistLoading,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: () => fetch('/api/waitlist').then(res => res.json()),
    enabled: activeTab === "waitlist-entries" && !!user,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading
  } = useQuery({
    queryKey: ['waitlist-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: activeTab === "waitlist-analytics"
  });

  const { 
    data: emailHistory, 
    isLoading: emailHistoryLoading 
  } = useQuery({
    queryKey: ['email-history'],
    queryFn: () => fetch('/api/email-history').then(res => res.json()),
    enabled: activeTab === 'email-history'
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-10 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your platform content and settings</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <Badge variant="outline" className="flex gap-1 px-3 py-1">
            <User className="w-3 h-3" /> {user?.username}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await logout();
                setLocation('/login');
              } catch (error) {
                toast({
                  title: "Logout Failed",
                  description: "Could not log out. Please try again.",
                  variant: "destructive"
                });
              }
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="waitlist-entries">
            <Users className="w-4 h-4 mr-2" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="waitlist-analytics">
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="email-history">
            <FileText className="w-4 h-4 mr-2" />
            Email History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist-entries">
          <div className="space-y-6">
            {/* Waitlist content */}
          </div>
        </TabsContent>

        <TabsContent value="waitlist-analytics">
          <div className="space-y-6">
            {/* Analytics content */}
          </div>
        </TabsContent>

        <TabsContent value="email-templates">
          <div className="space-y-6">
            {/* Email templates content */}
          </div>
        </TabsContent>

        <TabsContent value="email-history">
          <div className="space-y-6">
            {/* Email history content */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPortal;