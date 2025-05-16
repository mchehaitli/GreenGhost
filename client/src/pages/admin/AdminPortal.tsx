import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmailBuilder } from "@/components/EmailBuilder";
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
  Users,
  Plus
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
};


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
  const [selectedTemplate, setSelectedTemplate] = useState<"welcome" | "verification" | EmailTemplate | null>(null);
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
  const [newTemplateName, setNewTemplateName] = useState('');


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

  const filteredWaitlistEntries = useMemo(() => {
    return waitlistEntries.filter(entry =>
      recipientSearchTerm
        ? entry.email.toLowerCase().includes(recipientSearchTerm.toLowerCase())
        : true
    );
  }, [waitlistEntries, recipientSearchTerm]);

  useEffect(() => {
    if (selectAllRecipients) {
      const allEmails = filteredWaitlistEntries.map(entry => entry.email);
      setSelectedRecipients(new Set(allEmails));
    } else {
      setSelectedRecipients(new Set());
    }
  }, [selectAllRecipients, filteredWaitlistEntries]);

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
                <p className="text-muted-foreground">Track signup trends and location distribution</p>
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

              {/* Daily Breakdown - Now Collapsible */}
              <Accordion type="single" collapsible>
                <AccordionItem value="daily-breakdown">
                  <AccordionTrigger>
                    <h3 className="text-lg font-medium">Last 7 Days Breakdown</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto pt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Signups</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData?.daily?.breakdown?.map((day: any) => (
                            <TableRow key={day.date}>
                              <TableCell>{day.date}</TableCell>
                              <TableCell>{day.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>                      </Table>
                    </div>
                  </AccordionContent>                </AccordionItem>
              </Accordion>

              {/* Location Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* City Distribution */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Top Cities</h3>
                  <div className="overflow-x-auto"><Table>
                      <TableHeader>
                        <TableRow>
                                                    <TableHead>City</TableHead>
                          <TableHead>Signups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.cityDistribution?.map((city: any) => (
                          <TableRow key={city.name}>
                            <TableCell>{city.name}</TableCell>
                            <TableCell>{city.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* ZIP Distribution */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Top ZIP Codes</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ZIP Code</TableHead>
                          <TableHead>Signups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.zipDistribution?.map((zip: any) => (
                          <TableRow key={zip.name}>
                            <TableCell>{zip.name}</TableCell>
                            <TableCell>{zip.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Latest Signups by ZIP */}
              <div>
                <h3 className="text-lg font-medium mb-4">Latest Signups by ZIP Code</h3>
                <div className="space-y-6">
                  {analyticsData?.zipDistribution?.map((zip: any) => (
                    <Card key={zip.name} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">ZIP Code: {zip.name}</h4>
                        <Badge variant="secondary">{zip.count} total signups</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Signed Up</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {zip.latest?.map((signup: any) => (
                            <TableRow key={signup.email}>
                              <TableCell>{signup.email}</TableCell>
                              <TableCell>
                                {signup.city ? `${signup.city}, ${signup.state}` : signup.zip_code}
                              </TableCell>
                              <TableCell>
                                {format(new Date(signup.created_at), "MMM dd, yyyy 'at' h:mm a")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          <Card className="p-4 md:p-6 relative">
            <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab}>
              <TabsList>
                <TabsTrigger value="system">System Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom Templates</TabsTrigger>
                <TabsTrigger value="create">Create Template</TabsTrigger>
                <TabsTrigger value="send">Send Custom Email</TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>Welcome Email</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate("welcome");
                          setSendEmailDialogOpen(true);
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Welcome Email
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <EmailBuilder
                        defaultTemplate={{
                          subject: "Welcome to Our Platform",
                          blocks: [
                            {
                              id: "welcome-header",
                              type: "header",
                              content: {
                                text: "Welcome to Our Platform!",
                                size: "32px",
                                align: "center"
                              }
                            },
                            {
                              id: "welcome-text",
                              type: "text",
                              content: {
                                text: "Thank you for joining our waitlist. We're excited to have you with us.",
                                align: "left"
                              }
                            },
                            {
                              id: "welcome-button",
                              type: "button",
                              content: {
                                text: "Visit Our Website",
                                url: "https://ourplatform.com",
                                align: "center"
                              }
                            }
                          ]
                        }}
                        onSave={async (template) => {
                          try {
                            await fetch('/api/email-templates/welcome', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(template)
                            });
                            toast({
                              title: "Template saved",
                              description: "Welcome email template has been updated."
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to save template",
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>Verification Email</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate("verification");
                          setSendEmailDialogOpen(true);
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Verification Email
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <EmailBuilder
                        defaultTemplate={{
                          subject: "Verify Your Email",
                          blocks: [
                            {
                              id: "verify-header",
                              type: "header",
                              content: {
                                text: "Verify Your Email",
                                size: "32px",
                                align: "center"
                              }
                            },
                            {
                              id: "verify-text",
                              type: "text",
                              content: {
                                text: "Your verification code is: {verificationCode}",
                                align: "center"
                              }
                            },
                            {
                              id: "verify-instructions",
                              type: "text",
                              content: {
                                text: "Enter this code to verify your email address.",
                                align: "left"
                              }
                            }
                          ]
                        }}
                        onSave={async (template) => {
                          try {
                            await fetch('/api/email-templates/verification', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(template)
                            });
                            toast({
                              title: "Template saved",
                              description: "Verification email template has been updated."
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to save template",
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                {customTemplatesLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-medium">Custom Templates</h3>
                        <p className="text-sm text-muted-foreground">Manage your saved email templates</p>
                      </div>
                      <div className="space-x-2">
                        <Button onClick={() => setActiveTemplateTab("create")} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create New Template
                        </Button>
                        <Button 
                          onClick={() => setActiveTemplateTab("send")}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Send Custom Email
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {!customTemplates?.length ? (
                        <Card className="p-8 text-center">
                          <p className="text-muted-foreground mb-4">No custom templates yet</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTemplateTab("create")}
                          >
                            Create Your First Template
                          </Button>
                        </Card>
                      ) : (
                        customTemplates.map((template) => (
                          <Card key={template.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setSendEmailDialogOpen(true);
                                  }}
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Template
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setTemplateToDelete(template);
                                    setDeleteTemplateDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <EmailBuilder
                                defaultTemplate={{
                                  subject: template.subject,
                                  blocks: JSON.parse(template.html_content)
                                }}
                                onSave={async (templateContent) => {
                                  try {
                                    await fetch(`/api/email-templates/custom/${template.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        ...templateContent,
                                        name: template.name
                                      })
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                                    toast({
                                      title: "Template saved",
                                      description: `${template.name} has been updated.`
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to save template",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              />
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input
                          placeholder="Enter template name..."
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                      </div>
                      <EmailBuilder
                        onSave={async (template) => {
                          try {
                            if (!newTemplateName.trim()) {
                              throw new Error('Template name is required');
                            }
                            await fetch('/api/email-templates/custom', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: newTemplateName,
                                ...template
                              })
                            });
                            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                            setActiveTemplateTab('custom');
                            setNewTemplateName('');
                            toast({
                              title: "Success",
                              description: "New template created successfully"
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: error instanceof Error ? error.message : "Failed to create template",
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="send">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Custom Email</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and send a one-time email to selected recipients
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Recipient Filters */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Recipients</h4>

                        {/* Date Range Filter */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>From Date</Label>
                            <DatePicker
                              selected={segmentationCriteria.dateRange?.from}
                              onSelect={(date) => setSegmentationCriteria(prev => ({
                                ...prev,
                                dateRange: {
                                  from: date,
                                  to: prev.dateRange?.to || new Date()
                                }
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>To Date</Label>
                            <DatePicker
                              selected={segmentationCriteria.dateRange?.to}
                              onSelect={(date) => setSegmentationCriteria(prev => ({
                                ...prev,
                                dateRange: {
                                  from: prev.dateRange?.from || new Date(),
                                  to: date
                                }
                              }))}
                            />
                          </div>
                        </div>

                        {/* Location Filters */}
                        <div className="grid grid-cols-2 gap-4">
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
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Set(waitlistEntries.map(entry => entry.city).filter(Boolean))).map(city => (
                                  <SelectItem key={city} value={city as string}>{city}</SelectItem>
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
                                <SelectValue placeholder="Select a ZIP code" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Set(waitlistEntries.map(entry => entry.zip_code).filter(Boolean))).map(zip => (
                                  <SelectItem key={zip} value={zip as string}>{zip}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Clear Filters Button */}
                        <Button
                          variant="outline"
                          onClick={() => setSegmentationCriteria({
                            dateRange: null,
                            states: [],
                            cities: [],
                            zipCodes: []
                          })}
                          className="w-full"
                        >
                          Clear All Filters
                        </Button>

                        {/* Recipients List */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Recipients</Label>
                            <p className="text-sm text-muted-foreground">
                              {getFilteredRecipients().length} recipients match your filters
                            </p>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Search recipients..."
                              value={recipientSearchTerm}
                              onChange={(e) => setRecipientSearchTerm(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              onClick={() => setSelectAllRecipients(!selectAllRecipients)}
                            >
                              {selectAllRecipients ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>
                          <ScrollArea className="h-32 border rounded-md">
                            <div className="p-2">
                              {getFilteredRecipients().map((entry) => (
                                <div key={entry.email} className="flex items-center space-x-2 py-1">
                                  <Checkbox
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
                                  <span className="flex-1">{entry.email}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {entry.city && entry.state ? `${entry.city}, ${entry.state}` : entry.zip_code}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        {/* Email Builder */}
                        <EmailBuilder
                          onSave={async (template) => {
                            try {
                              if (selectedRecipients.size === 0) {
                                throw new Error('Please select at least one recipient');
                              }
                              setIsSendingEmails(true);
                              await fetch('/api/email/send-custom', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  recipients: Array.from(selectedRecipients),
                                  ...template
                                })
                              });
                              toast({
                                title: "Success",
                                description: `Email sent to ${selectedRecipients.size} recipient(s)`
                              });
                              setSelectedRecipients(new Set());
                              setRecipientSearchTerm('');
                              setSegmentationCriteria({
                                dateRange: null,
                                states: [],
                                cities: [],
                                zipCodes: []
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: error instanceof Error ? error.message : "Failed to send email",
                                variant: "destructive"
                              });
                            } finally {
                              setIsSendingEmails(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Settings className="h-6 w-6 mr-3 text-primary" />
              <h2 className="text-xl font-semibold">Settings</h2>
            </div>
            
            <Tabs defaultValue="users" className="w-full space-y-6">
              <TabsList>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>My Account</span>
                </TabsTrigger>
              </TabsList>
              
              {/* User Management Tab */}
              <TabsContent value="users">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">User Management</h3>
                    <Button
                      onClick={() => {
                        setNewUserDialogOpen(true);
                      }}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>

                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>
                                {user.is_admin ? (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                    User
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(user.created_at),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="mr-2"
                                  title="Edit user"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={user.id === (user as User).id} // Can't delete yourself
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Account Settings Tab */}
              <TabsContent value="account">
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Settings</h3>
                    <div>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (profileFormData.username) {
                            updateProfileMutation.mutate({ username: profileFormData.username });
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={profileFormData.username}
                            onChange={(e) => setProfileFormData({...profileFormData, username: e.target.value})}
                            placeholder={user?.username || ""}
                          />
                          <p className="text-sm text-muted-foreground">
                            This is your public display name.
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="mt-4"
                          disabled={updateProfileMutation.isPending || !profileFormData.username}
                        >
                          {updateProfileMutation.isPending ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Settings</h3>
                    <div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (
                            passwordFormData.currentPassword &&
                            passwordFormData.newPassword &&
                            passwordFormData.newPassword === passwordFormData.confirmPassword
                          ) {
                            changePasswordMutation.mutate({ 
                              currentPassword: passwordFormData.currentPassword,
                              newPassword: passwordFormData.newPassword 
                            });
                          } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
                            toast({
                              title: "Passwords don't match",
                              description: "Please ensure your new password and confirm password fields match.",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword" 
                            type="password"
                            value={passwordFormData.currentPassword}
                            onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password"
                            value={passwordFormData.newPassword}
                            onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                          />
                          <p className="text-sm text-muted-foreground">
                            Must be at least 6 characters.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password"
                            value={passwordFormData.confirmPassword}
                            onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="mt-4"
                          disabled={
                            changePasswordMutation.isPending || 
                            !passwordFormData.currentPassword || 
                            !passwordFormData.newPassword ||
                            !passwordFormData.confirmPassword
                          }
                        >
                          {changePasswordMutation.isPending ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <Lock className="h-4 w-4 mr-2" />
                          )}
                          Change Password
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Edit customer information and save changes
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.email ?? selectedEntry.email}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sign-up Date</Label>
                  <p className="text-muted-foreground pt-2">
                    {format(new Date(selectedEntry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.first_name ?? selectedEntry.first_name ?? ''}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'first_name', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.last_name ?? selectedEntry.last_name ?? ''}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'last_name', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.phone_number ?? selectedEntry.phone_number ?? ''}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'phone_number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={unsavedChanges[selectedEntry.id]?.zip_code ?? selectedEntry.zip_code ?? ''}
                      onChange={(e) => {
                        const zip = e.target.value;
                        handleFieldChange(selectedEntry.id, 'zip_code', zip);
                        if (zip.length === 5) {
                          handleCityStateFromZip(zip, selectedEntry.id);
                        }
                      }}
                      placeholder="Enter ZIP code"
                    />
                    {loadingZips[selectedEntry.id] && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-2" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.city ?? selectedEntry.city ?? ''}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={unsavedChanges[selectedEntry.id]?.state ?? selectedEntry.state ?? ''}
                    onChange={(e) => handleFieldChange(selectedEntry.id, 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={unsavedChanges[selectedEntry.id]?.street_address ?? selectedEntry.street_address ?? ''}
                  onChange={(e) => handleFieldChange(selectedEntry.id, 'street_address', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={unsavedChanges[selectedEntry.id]?.notes ?? selectedEntry.notes ?? ''}
                  onChange={(e) => handleFieldChange(selectedEntry.id, 'notes', e.target.value)}
                  placeholder="Add notes about this customer"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedEntry) {
                  delete unsavedChanges[selectedEntry.id];
                  setUnsavedChanges({...unsavedChanges});
                }
                setShowDetailsDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEntry && unsavedChanges[selectedEntry.id]) {
                  updateEntryMutation.mutate([{
                    id: selectedEntry.id,
                    ...unsavedChanges[selectedEntry.id]
                  }]);
                  setShowDetailsDialog(false);
                }
              }}
              disabled={!selectedEntry || !unsavedChanges[selectedEntry.id] || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
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