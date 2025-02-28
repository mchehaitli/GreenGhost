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
  DollarSign,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Eye,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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

type SortDirection = 'asc' | 'desc';
type SortField = 'created_at' | 'zip_code';

type CarePlan = {
  id: number;
  name: string;
  description: string;
  base_price: number;
  features: string[];
  created_at: string;
  updated_at: string;
};

let knownZipCodeMappings: Record<string, {city: string, state: string}> = {
  '75033': {city: 'Frisco', state: 'TX'},
  // Add any other problematic ZIP codes here
};

type Service = {
  id: number;
  name: string;
  description: string;
  price_per_sqft: number;
  category: string;
  created_at: string;
  updated_at: string;
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
  const [unsavedPricingChanges, setUnsavedPricingChanges] = useState<Record<number, number>>({});
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [unsavedPlanPrices, setUnsavedPlanPrices] = useState<Record<number, number>>({});
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);


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

  const updateEntryMutation = useMutation({
    mutationFn: async (entries: Array<{ id: number } & Partial<WaitlistEntry>>) => {
      setIsSaving(true);
      try {
        const results = await Promise.all(
          entries.map(async (entry) => {
            console.log('Sending update request:', entry);
            const response = await fetch(`/api/waitlist/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            });

            const responseData = await response.json();

            if (!response.ok) {
              console.error('Update failed:', responseData);
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
      console.error('Update entries error:', error);
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

  const filteredEntries = waitlistEntries.filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.email.toLowerCase().includes(searchLower) ||
      entry.first_name?.toLowerCase().includes(searchLower) ||
      entry.last_name?.toLowerCase().includes(searchLower) ||
      entry.zip_code?.includes(searchTerm)
    );
  });

  const handleCityStateFromZip = async (zip: string, entryId: number) => {
    // Only process if it's a valid 5-digit ZIP code
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
      console.log(`Fetching data for ZIP: ${zip}`);

      // Check if this is a known problematic ZIP code
      if (knownZipCodeMappings[zip]) {
        console.log('Using fallback data for known ZIP:', zip);
        await updateEntryMutation.mutateAsync([{id: entryId, city: knownZipCodeMappings[zip].city, state: knownZipCodeMappings[zip].state}]);
        return true;
      }

      // Try API with retries and exponential backoff
      let retries = 3;
      let response;
      while (retries >= 0) {
        try {
          response = await fetch(`https://api.zippopotam.us/us/${zip}`);
          console.log(`ZIP API response for ${zip}:`, {
            status: response.status,
            statusText: response.statusText
          });

          if (response.ok) break;

          // If we get rate limited, wait longer
          if (response.status === 429) {
            const backoffTime = Math.pow(2, 3 - retries) * 2000; // Exponential backoff
            console.log(`Rate limited, waiting ${backoffTime}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

          retries--;
          if (retries < 0) {
            throw new Error(`ZIP code lookup failed after all retries: ${response?.statusText || 'Unknown error'}`);
          }
        } catch (fetchError) {
          console.error(`Fetch error for ZIP ${zip}:`, fetchError);
          if (retries < 0) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        }
      }

      if (!response?.ok) {
        throw new Error('Failed to get response from ZIP API');
      }

      let data;
      try {
        data = await response.json();
        console.log('ZIP API response data for', zip, ':', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Failed to parse ZIP API response');
      }

      if (data && data.places && data.places.length > 0 && data.places[0]) {
        const place = data.places[0];
        if (place['place name'] && place['state abbreviation']) {
          try {
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
          } catch (error) {
            console.error('Failed to update entry with ZIP data:', error);
            throw error;
          }
        } else {
          throw new Error('Invalid location data format in API response');
        }
      } else {
        // Check if we have the "post code" field but not "places"
        if (data && data['post code'] === zip) {
          // Some API responses might have a different format
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
          // Add delay between requests
          if (successCount + failCount < entriesToUpdate.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          failCount++;
          failedZips.push(entry.zip_code);
          console.error(`Error processing ZIP ${entry.zip_code}:`, error);
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
      console.error('Error in handleAutoPopulateAll:', error);
      toast({
        title: "Auto-population Failed",
        description: "An error occurred while updating locations.",
        variant: "destructive"
      });
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const saveNotes = () => {
    if (currentEntryId) {
      updateEntryMutation.mutateAsync([{id: currentEntryId, notes: currentNotes}]);
      setShowNotesDialog(false);
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
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export waitlist entries.",
        variant: "destructive"
      });
    }
  };

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

  const {
    data: services,
    isLoading: servicesLoading,
  } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: number; price: number }) => {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_per_sqft: price }),
      });
      if (!res.ok) throw new Error('Failed to update price');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Price updated",
        description: "Service price has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update price",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const handleUpdateService = async (id: number) => {
    const newPrice = unsavedPricingChanges[id];
    if (newPrice === undefined) return;

    setIsUpdatingPrice(true);
    try {
      await updateServiceMutation.mutateAsync({ id, price: newPrice });
      setUnsavedPricingChanges(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleSaveAllPricing = async () => {
    setIsUpdatingPrice(true);
    try {
      await Promise.all(
        Object.entries(unsavedPricingChanges).map(([id, price]) =>
          updateServiceMutation.mutateAsync({ id: Number(id), price })
        )
      );
      setUnsavedPricingChanges({});
      toast({
        title: "All prices updated",
        description: "All service prices have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update prices",
        description: "Some price updates failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };


  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, price }: { id: number; price: number }) => {
      const res = await fetch(`/api/care-plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_price: price }),
      });
      if (!res.ok) throw new Error('Failed to update plan price');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-plans'] });
      toast({
        title: "Plan price updated",
        description: "Care plan price has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update plan price",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const handleUpdatePlan = async (id: number) => {
    const newPrice = unsavedPlanPrices[id];
    if (newPrice === undefined) return;

    setIsUpdatingPlan(true);
    try {
      await updatePlanMutation.mutateAsync({ id, price: newPrice });
      setUnsavedPlanPrices(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const {
    data: plans,
    isLoading: plansLoading,
  } = useQuery<CarePlan[]>({
    queryKey: ['care-plans'],
    queryFn: async () => {
      const res = await fetch('/api/care-plans');
      if (!res.ok) throw new Error('Failed to fetch care plans');
      return res.json();
    },
  });

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Failed to fetch plans",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchPlans();
    }
  }, [activeTab]);


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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="waitlist-entries">
            <UserPlus className="w-4 h-4 mr-2" />
            Waitlist Entries
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            Email Templates
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

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="w-[calc(100%-2rem)] md:w-[800px] max-w-2xl p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                {selectedEntry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.first_name ?? selectedEntry.first_name ?? ''}
                          onChange={(e) => handleFieldChange(selectedEntry.id, 'first_name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.last_name ?? selectedEntry.last_name ?? ''}
                          onChange={(e) => handleFieldChange(selectedEntry.id, 'last_name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.phone_number ?? selectedEntry.phone_number ?? ''}
                          onChange={(e) => handleFieldChange(selectedEntry.id, 'phone_number', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Street Address</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.street_address ?? selectedEntry.street_address ?? ''}
                          onChange={(e) => handleFieldChange(selectedEntry.id, 'street_address', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.city ?? selectedEntry.city ?? ''}
                          onChange={(e)=> handleFieldChange(selectedEntry.id, 'city', e.target.value)}
                          className="mt-1"
                          disabled={loadingZips[selectedEntry.id]}
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={unsavedChanges[selectedEntry.id]?.state ?? selectedEntry.state ?? ''}
                          onChange={(e) => handleFieldChange(selectedEntry.id, 'state', e.target.value)}
                          className="mt-1"
                          disabled={loadingZips[selectedEntry.id]}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={unsavedChanges[selectedEntry.id]?.notes ?? selectedEntry.notes ?? ''}
                        onChange={(e) => handleFieldChange(selectedEntry.id, 'notes', e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={Object.keys(unsavedChanges).length === 0 || isSaving}
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
                </AlertDialogFooter>
              </DialogContent>
            </Dialog>

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

        <TabsContent value="email-templates">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Email Templates</h2>
            <p className="text-muted-foreground">Configure your email templates here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">Manage your application settings here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="p-4 md:p-6 relative">
            <LoadingOverlay 
              isLoading={servicesLoading || plansLoading} 
              text="Loading pricing data..."
            />
            <LoadingOverlay 
              isLoading={isUpdatingPrice || isUpdatingPlan} 
              text="Updating prices..."
            />

            <div className="flex flex-col gap-6">
              {/* Care Plans Section */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Care Plans</h2>
                <p className="text-muted-foreground mb-4">Manage your main care plan pricing.</p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {plans?.map((plan) => (
                    <Card key={plan.id} className="p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <div>
                          <Label>Base Price ($)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={unsavedPlanPrices[plan.id] ?? plan.base_price}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  setUnsavedPlanPrices(prev => ({
                                    ...prev,
                                    [plan.id]: value
                                  }));
                                }
                              }}
                              className="transition-all duration-200"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdatePlan(plan.id)}
                              disabled={unsavedPlanPrices[plan.id] === undefined}
                              className="shrink-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm">
                          <strong>Features:</strong>
                          <ul className="list-disc list-inside mt-1 text-muted-foreground">
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Additional Services</h2>
                <p className="text-muted-foreground mb-4">Update service prices per square foot.</p>

                <div className="overflow-x-auto">
                  <div className="rounded-md border min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="w-[150px]">Price ($/sqft)</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services?.map((service) => (
                          <TableRow 
                            key={service.id}
                            className="transition-colors duration-200 hover:bg-primary/5 group"
                          >
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.description}</TableCell>
                            <TableCell>{service.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    unsavedPricingChanges[service.id] !== undefined 
                                      ? unsavedPricingChanges[service.id] 
                                      : service.price_per_sqft
                                  }
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && value >= 0) {
                                      setUnsavedPricingChanges(prev => ({
                                        ...prev,
                                        [service.id]: value
                                      }));
                                    }
                                  }}
                                  className="transition-all duration-200 group-hover:border-primary/50"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateService(service.id)}
                                disabled={unsavedPricingChanges[service.id] === undefined}
                                className="transition-all duration-200 group-hover:border-primary/50 group-hover:bg-primary/10"
                              >
                                {updateServiceMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSaveAllPricing}
                    disabled={Object.keys(unsavedPricingChanges).length === 0 || isUpdatingPrice}
                    size="lg"
                    className="relative"
                  >
                    {isUpdatingPrice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the waitlist entry and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}