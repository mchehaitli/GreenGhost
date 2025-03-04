import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import {
  Search,
  MapPin,
  FileText,
  Save,
  Loader2,
  Trash2,
  Download,
  User,
  Settings,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Eye,
  BarChart,
  Mail,
  CheckCircle,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays, subDays, isWithinInterval } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';


type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
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

let knownZipCodeMappings: Record<string, { city: string, state: string }> = {
  '75033': { city: 'Frisco', state: 'TX' },
  // Add any other problematic ZIP codes here
};

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
}

type EmailHistoryEntry = {
  id: number;
  template_name: string;
  sent_at: string;
  total_recipients: number;
  status: 'completed' | 'failed' | 'pending';
}


export default function AdminPortal() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist-entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [loadingZips, setLoadingZips] = useState<{ [key: number]: boolean }>({});
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<number, Partial<WaitlistEntry>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [selectAllRecipients, setSelectAllRecipients] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState(new Set<string>());
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<"welcome" | "verification" | null>(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [segmentationCriteria, setSegmentationCriteria] = useState<SegmentationCriteria>({
    dateRange: null,
    states: [],
    cities: [],
    zipCodes: [],
  });
  const [activeTemplateTab, setActiveTemplateTab] = useState('system');
  const { data: customTemplates, isLoading: customTemplatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates', 'custom'],
    queryFn: () => fetch('/api/email-templates/custom').then(res => res.json()),
    enabled: activeTab === 'email-templates' && activeTemplateTab === 'custom'
  });
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [deleteEmailHistoryDialogOpen, setDeleteEmailHistoryDialogOpen] = useState(false);
  const [emailHistoryToDelete, setEmailHistoryToDelete] = useState<EmailHistoryEntry | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  const {
    data: waitlistEntries = [],
    isLoading: waitlistLoading,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: () => fetch('/api/waitlist').then(res => res.json()),
    enabled: activeTab === "waitlist-entries" && !!user,
  });

  // Add new query for analytics data
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

  // Add this query for email history
  const { data: emailHistory, isLoading: emailHistoryLoading } = useQuery({
    queryKey: ['email-history'],
    queryFn: () => fetch('/api/email-history').then(res => res.json()),
    enabled: activeTab === 'email-history'
  });


  const updateEntryMutation = useMutation({
    mutationFn: async (entries: Array<{ id: number } & Partial<WaitlistEntry>>) => {
      setIsSaving(true);
      try {
        const results = await Promise.all(
          entries.map(async (entry) => {
            const response = await fetch(`/api/waitlist/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            });

            const responseData = await response.json();

            if (!response.ok) {
              throw new Error(responseData.details || responseData.error || 'Failed to update entry');
            }

            return responseData;
          })
        );
        return results;
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      setUnsavedChanges({});
      toast({
        title: "Changes saved",
        description: "All waitlist entries have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save changes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast({
        title: "Entry deleted",
        description: "The waitlist entry has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const handleFieldChange = (entryId: number, field: keyof WaitlistEntry, value: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        id: entryId,
        [field]: value
      }
    }));
  };

  const handleSaveChanges = () => {
    const changes = Object.values(unsavedChanges);
    if (changes.length > 0) {
      updateEntryMutation.mutate(changes);
    }
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntryMutation.mutate(entryToDelete);
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const getFilteredRecipients = () => {
    return waitlistEntries.filter(entry => {
      // Filter by date range
      if (segmentationCriteria.dateRange?.from && segmentationCriteria.dateRange?.to) {
        const entryDate = new Date(entry.created_at);
        if (!isWithinInterval(entryDate, {
          start: segmentationCriteria.dateRange.from,
          end: segmentationCriteria.dateRange.to
        })) {
          return false;
        }
      }

      // Filter by state
      if (segmentationCriteria.states.length > 0) {
        if (!entry.state || !segmentationCriteria.states.includes(entry.state)) {
          return false;
        }
      }

      // Filter by city
      if (segmentationCriteria.cities.length > 0) {
        if (!entry.city || !segmentationCriteria.cities.includes(entry.city)) {
          return false;
        }
      }

      // Filter by ZIP code
      if (segmentationCriteria.zipCodes.length > 0) {
        if (!entry.zip_code || !segmentationCriteria.zipCodes.includes(entry.zip_code)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredEntries = getFilteredRecipients().filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.email.toLowerCase().includes(searchLower) ||
      entry.first_name?.toLowerCase().includes(searchLower) ||
      entry.last_name?.toLowerCase().includes(searchLower) ||
      entry.zip_code?.includes(searchTerm)
    );
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return (dateA - dateB) * modifier;
    } else {
      // ZIP code sorting
      const zipA = a.zip_code || '';
      const zipB = b.zip_code || '';
      return zipA.localeCompare(zipB) * modifier;
    }
  });

  const handleViewDetails = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  const handleCityStateFromZip = async (zip: string, entryId: number) => {
    if (!/^\d{5}$/.test(zip)) {
      toast({
        title: "Invalid ZIP Code",
        description: "ZIP code must be 5 digits",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoadingZips(prev => ({ ...prev, [entryId]: true }));

      if (knownZipCodeMappings[zip]) {
        await updateEntryMutation.mutateAsync([{
          id: entryId,
          city: knownZipCodeMappings[zip].city,
          state: knownZipCodeMappings[zip].state
        }]);
        return true;
      }

      let retries = 3;
      let response;
      while (retries >= 0) {
        try {
          response = await fetch(`https://api.zippopotam.us/us/${zip}`);
          if (response.ok) break;

          if (response.status === 429) {
            const backoffTime = Math.pow(2, 3 - retries) * 2000;
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

          retries--;
          if (retries < 0) {
            throw new Error(`ZIP code lookup failed after all retries: ${response?.statusText || 'Unknown error'}`);
          }
        } catch (fetchError) {
          if (retries < 0) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        }
      }

      if (!response?.ok) {
        throw new Error('Failed to get response from ZIP API');
      }

      const data = await response.json();

      if (data && data.places && data.places.length > 0 && data.places[0]) {
        const place = data.places[0];
        if (place['place name'] && place['state abbreviation']) {
          await updateEntryMutation.mutateAsync([{
            id: entryId,
            city: place['place name'],
            state: place['state abbreviation']
          }]);
          toast({
            title: "ZIP Code Validated",
            description: `Updated to ${place['place name']}, ${place['state abbreviation']}`,
            variant: "default"
          });
          return true;
        } else {
          throw new Error('Invalid location data format in API response');
        }
      } else {
        if (data && data['post code'] === zip) {
          throw new Error('API returned data but in an unexpected format');
        } else {
          throw new Error('No location data found for this ZIP code');
        }
      }
    } catch (error) {
      console.error('Error in handleCityStateFromZip:', error);
      toast({
        title: "ZIP Code Validation Failed",
        description: error instanceof Error ? error.message : "Please enter city and state manually",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoadingZips(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const handleAutoPopulateAll = async () => {
    setIsAutoPopulating(true);
    let successCount = 0;
    let failCount = 0;
    let failedZips: string[] = [];

    try {
      const entriesToUpdate = filteredEntries.filter(
        entry => entry.zip_code && (!entry.city || !entry.state)
      );

      if (entriesToUpdate.length === 0) {
        toast({
          title: "No entries to update",
          description: "All entries with ZIP codes already have city and state information.",
        });
        return;
      }

      for (const entry of entriesToUpdate) {
        if (!entry.zip_code) continue;

        try {
          const success = await handleCityStateFromZip(entry.zip_code, entry.id);
          if (success) {
            successCount++;
          } else {
            failCount++;
            failedZips.push(entry.zip_code);
          }
          if (successCount + failCount < entriesToUpdate.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          failCount++;
          failedZips.push(entry.zip_code);
        }
      }

      let description = `Successfully updated ${successCount} entries.`;
      if (failCount > 0) {
        description += `\nFailed entries: ${failedZips.join(', ')}`;
      }

      toast({
        title: "Auto-population Complete",
        description: description,
        duration: 5000,
        variant: successCount > 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Auto-population Failed",
        description: "An error occurred while updating locations.",
        variant: "destructive"
      });
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const excelData = filteredEntries.map(entry => ({
        'Email': entry.email,
        'Sign-up Date': format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a"),
        'First Name': entry.first_name || '',
        'Last Name': entry.last_name || '',
        'Phone Number': entry.phone_number || '',
        'Street Address': entry.street_address || '',
        'City': entry.city || '',
        'State': entry.state || '',
        'ZIP Code': entry.zip_code || '',
        'Notes': entry.notes || ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Waitlist Entries');
      XLSX.writeFile(workbook, `waitlist-entries-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Waitlist entries have been exported to Excel.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export waitlist entries.",
        variant: "destructive"
      });
    }
  };


  const filteredWaitlistEntries = recipientSearchTerm
    ? waitlistEntries.filter(entry =>
      entry.email.toLowerCase().includes(recipientSearchTerm.toLowerCase())
    )
    : waitlistEntries;

  const handleSendEmails = async () => {
    try {
      setIsSendingEmails(true);
      const recipients = Array.from(selectedRecipients);

      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate as string, //Type assertion to remove type error
          recipients: recipients
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      toast({
        title: "Success",
        description: `Sent ${recipients.length} email${recipients.length > 1 ? 's' : ''} successfully.`,
      });
      setSendEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="waitlist-entries">
            <UserPlus className="w-4 h-4 mr-2" />
            Waitlist Entries
          </TabsTrigger>
          <TabsTrigger value="waitlist-analytics">
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <FileText className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="email-history">
            <Mail className="w-4 h-4 mr-2"/>
            Email History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist-entries" className="space-y-4">
          <Card className="p-4 md:p-6 relative">
            <LoadingOverlay
              isLoading={waitlistLoading}
              text="Loading entries..."
            />
            <LoadingOverlay
              isLoading={isSaving}
              text="Saving changes..."
            />
            <LoadingOverlay
              isLoading={isAutoPopulating}
              text="Auto-populating locations..."
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportToExcel}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button
                  onClick={handleAutoPopulateAll}
                  disabled={isAutoPopulating}
                >
                  {isAutoPopulating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Auto Populate City/State
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="rounded-md border min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead
                        onClick={() => handleSort('zip_code')}
                        className="cursor-pointer hover:text-primary transition-colors duration-200"
                      >
                        ZIP Code
                        {sortField === 'zip_code' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4 inline-block" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                          )
                        )}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('created_at')}
                        className="cursor-pointer hover:text-primary transition-colors duration-200"
                      >
                        Sign-up Date/Time
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4 inline-block" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                          )
                        )}
                      </TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="transition-colors duration-200 hover:bg-primary/5 group"
                      >
                        <TableCell className="font-medium">
                          <Input
                            value={unsavedChanges[entry.id]?.email ?? entry.email}
                            onChange={(e) => handleFieldChange(entry.id, 'email', e.target.value)}
                            className="transition-all duration-200 group-hover:border-primary/50"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              value={unsavedChanges[entry.id]?.zip_code ?? entry.zip_code ?? ''}
                              onChange={(e) => {
                                const zip = e.target.value;
                                handleFieldChange(entry.id, 'zip_code', zip);
                                if (zip.length === 5) {
                                  handleCityStateFromZip(zip, entry.id);
                                }
                              }}
                              className="max-w-[100px] transition-all duration-200 group-hover:border-primary/50"
                            />
                            {loadingZips[entry.id] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col md:flex-row items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(entry)}
                              className="transition-all duration-200 group-hover:border-primary/50 group-hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="transition-all duration-200 group-hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8">
              <Button
                onClick={handleSaveChanges}
                disabled={Object.keys(unsavedChanges).length === 0 || isSaving}
                size="lg"
                className="relative"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab Content */}
        <TabsContent value="waitlist-analytics" className="space-y-4">
          <Card className="p-4 md:p-6 relative">
            <LoadingOverlay
              isLoading={analyticsLoading}
              text="Loading analytics..."
            />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Waitlist Analytics</h2>
                <p className="text-muted-foreground">Track signup trends and distribution</p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.daily?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">new signups</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.monthly?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">total signups</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Verified</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.yearly?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">verified users</p>
                </Card>
              </div>

              {/* Daily Breakdown */}
              <div>
                <h3 className="text-lg font-medium mb-4">Last 7 Days</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Signups</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData?.daily?.breakdown?.slice(0, 7).map((day: any) => (
                        <TableRow key={day.date}>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{day.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ZIP Code Distribution */}
              <div>
                <h3 className="text-lg font-medium mb-4">Regional Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.zipCodeDistribution || []}
                        dataKey="count"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(analyticsData?.zipCodeDistribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          <Card className="p-4 md:p-6 relative">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
                  <p className="text-muted-foreground">
                    Manage automated email templates for different events in your application.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSendEmailDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Custom Email
                  </Button>
                </div>
              </div>

              <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab} className="w-full">
                <TabsList className="w-full flex justify-start space-x-2">
                  <TabsTrigger value="system">System Templates</TabsTrigger>
                  <TabsTrigger value="custom">Custom Templates</TabsTrigger>
                  <TabsTrigger value="create">Create Template</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Welcome Email</h3>
                      <EmailTemplateEditor
                        initialData={{
                          name: "Welcome Email",
                          subject: "Welcome to Our Platform",
                          html_content: `
                            <h1>Welcome {firstName}!</h1>
                            <p>Thank you for joining our waitlist. We're excited to have you with us.</p>
                            <p>We'll keep you updated on our progress and let you know when we're ready to launch.</p>
                          `,
                        }}
                        onSave={async (data) => {
                          const response = await fetch('/api/email-templates/welcome', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                          });
                          if (!response.ok) {
                            throw new Error('Failed to save template');
                          }
                        }}
                      />
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Verification Email</h3>
                      <EmailTemplateEditor
                        initialData={{
                          name: "Verification Email",
                          subject: "Verify Your Email",
                          html_content: `
                            <h1>Hello {firstName}!</h1>
                            <p>Your verification code is: {verificationCode}</p>
                            <p>Enter this code to verify your email address.</p>
                          `,
                        }}
                        onSave={async (data) => {
                          const response = await fetch('/api/email-templates/verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                          });
                          if (!response.ok) {
                            throw new Error('Failed to save template');
                          }
                        }}
                      />
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  {customTemplatesLoading ? (
                    <LoadingSpinner />
                  ) : customTemplates?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No custom templates yet.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTemplateTab("create")}
                      >
                        Create Your First Template
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {customTemplates?.map((template) => (
                        <Card key={template.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium">{template.name}</h3>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setTemplateToDelete(template);
                                setDeleteTemplateDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <EmailTemplateEditor
                            initialData={template}
                            onSave={async (data) => {
                              const response = await fetch(`/api/email-templates/${template.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                              });
                              if (!response.ok) {
                                throw new Error('Failed to update template');
                              }
                              queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                            }}
                          />
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="create">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Create New Template</h3>
                    <EmailTemplateEditor
                      initialData={{
                        name: "",
                        subject: "",
                        html_content: "",
                      }}
                      onSave={async (data) => {
                        const response = await fetch('/api/email-templates', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data),
                        });
                        if (!response.ok) {
                          throw new Error('Failed to create template');
                        }
                        // Refresh custom templates list
                        await queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                        // Switch to custom templates tab
                        setActiveTemplateTab("custom");
                        toast({
                          title: "Success",
                          description: "Template created successfully",
                        });
                      }}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">Configure your application settings here.</p>
          </Card>
        </TabsContent>
        <TabsContent value="email-history" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Email History</h2>
              <p className="text-muted-foreground">
                Track all sent emails and their delivery statistics
              </p>
            </div>

            {emailHistoryLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(emailHistory) ? emailHistory.map((history: EmailHistoryEntry) => (
                      <TableRow key={history.id}>
                        <TableCell className="font-medium">
                          {history.template_name}
                        </TableCell>
                        <TableCell>
                          {format(new Date(history.sent_at), "MMM dd, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>{history.total_recipients}</TableCell>
                        <TableCell>
                          <Badge variant={history.status === 'completed' ? 'default' : 'destructive'}>
                            {history.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No email history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Send Custom Email</DialogTitle>
            <DialogDescription>
              Send a custom email to segmented waitlist subscribers
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="segmentation">
                <AccordionTrigger className="text-sm font-medium">
                  Segmentation Criteria
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Date Range Selector */}
                    <div className="space-y-2">
                      <Label>Signup Date Range</Label>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          selected={segmentationCriteria.dateRange?.from}
                          onSelect={(date) => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: {
                              from: date || new Date(),
                              to: prev.dateRange?.to || new Date()
                            }
                          }))}
                        />
                        <span>to</span>
                        <DatePicker
                          selected={segmentationCriteria.dateRange?.to}
                          onSelect={(date) => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: {
                              from: prev.dateRange?.from || new Date(),
                              to: date || new Date()
                            }
                          }))}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: null
                          }))}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Location Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>States</Label>
                        <Select
                          value={segmentationCriteria.states[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            states: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.state).filter(Boolean))).map(state => (
                              <SelectItem key={state} value={state!}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cities</Label>
                        <Select
                          value={segmentationCriteria.cities[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            cities: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.city).filter(Boolean))).map(city => (
                              <SelectItem key={city} value={city!}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>ZIP Codes</Label>
                        <Select
                          value={segmentationCriteria.zipCodes[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            zipCodes: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ZIP code" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.zip_code).filter(Boolean))).map(zip => (
                              <SelectItem key={zip} value={zip!}>{zip}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSegmentationCriteria({
                          dateRange: null,
                          states: [],
                          cities: [],
                          zipCodes: [],
                        })}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectAllRecipients}
                onCheckedChange={(checked) => {
                  setSelectAllRecipients(!!checked);
                  if (checked) {
                    setSelectedRecipients(new Set(getFilteredRecipients().map(e => e.email)));
                  } else {
                    setSelectedRecipients(new Set());
                  }
                }}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All Filtered Recipients ({getFilteredRecipients().length})
              </label>
            </div>

            {!selectAllRecipients && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search subscribers..."
                    value={recipientSearchTerm}
                    onChange={(e) => setRecipientSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {getFilteredRecipients().map((entry) => (
                      <div key={entry.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`recipient-${entry.id}`}
                          checked={selectedRecipients.has(entry.email)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedRecipients);
                            if (checked) {
                              newSelected.add(entry.email);
                            } else {
                              newSelected.delete(entry.email);
                            }
                            setSelectedRecipients(newSelected);
                          }}
                        />
                        <label
                          htmlFor={`recipient-${entry.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {entry.email}
                          {entry.city && entry.state && (
                            <span className="text-muted-foreground ml-2">
                              ({entry.city}, {entry.state})
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="text-sm text-muted-foreground">
                  Selected {selectedRecipients.size} of {getFilteredRecipients().length} filtered subscribers
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select
                value={selectedTemplate || ''}
                onValueChange={(value) => setSelectedTemplate(value as "welcome" | "verification")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="verification">Verification Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={
                isSendingEmails ||
                selectedRecipients.size === 0 ||
                !selectedTemplate
              }
            >
              {isSendingEmails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email{selectedRecipients.size > 1 ? 's' : ''} ({selectedRecipients.size})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the waitlist entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Template Confirmation Dialog */}
      <AlertDialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (templateToDelete) {
                  try {
                    const response = await fetch(`/api/email-templates/${templateToDelete.id}`, {
                      method: 'DELETE',
                    });
                    if (!response.ok) {
                      throw new Error('Failed to delete template');
                    }
                    queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                    toast({
                      title: "Success",
                      description: "Template deleted successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to delete template",
                      variant: "destructive"
                    });
                  }
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}