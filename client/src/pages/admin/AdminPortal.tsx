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


type SortField = 'created_at' | 'zip_code';
type SortDirection = 'asc' | 'desc';

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

let knownZipCodeMappings: Record<string, {city: string, state: string}> = {
  '75033': {city: 'Frisco', state: 'TX'},
  // Add any other problematic ZIP codes here
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
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'created_at',
    direction: 'desc'
  });
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<number, Partial<WaitlistEntry>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);


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

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  const filteredAndSortedEntries = [...waitlistEntries]
    .filter(entry => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        entry.email.toLowerCase().includes(searchLower) ||
        entry.first_name?.toLowerCase().includes(searchLower) ||
        entry.last_name?.toLowerCase().includes(searchLower) ||
        entry.zip_code?.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      const { field, direction } = sortConfig;
      const modifier = direction === 'asc' ? 1 : -1;

      if (field === 'created_at') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier;
      }

      if (field === 'zip_code') {
        const zipA = a.zip_code || '';
        const zipB = b.zip_code || '';
        return zipA.localeCompare(zipB) * modifier;
      }

      return 0;
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
      const entriesToUpdate = filteredAndSortedEntries.filter(
        entry => entry.zip_code && (!entry.city || !entry.state)
      );

      if (entriesToUpdate.length === 0) {
        toast({
          title: "No entries to update",
          description: "All entries with ZIP codes already have city and state information.",
        });
        setIsAutoPopulating(false);
        return;
      }

      for (const entry of entriesToUpdate) {
        if (!entry.zip_code) continue;

        // Validate ZIP code format
        if (!/^\d{5}$/.test(entry.zip_code)) {
          failCount++;
          failedZips.push(`${entry.zip_code} (Invalid format)`);
          continue;
        }

        try {
          setLoadingZips(prev => ({ ...prev, [entry.id]: true }));

          // Add delay between requests to avoid rate limiting
          if (successCount + failCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
          }
          

          // Check if this is a known problematic ZIP code
          if (knownZipCodeMappings[entry.zip_code]) {
            const mapping = knownZipCodeMappings[entry.zip_code];
            await updateEntryMutation.mutateAsync([{
              id: entry.id, 
              city: mapping.city, 
              state: mapping.state
            }]);
            successCount++;
            continue;
          }

          // Try API with retries and exponential backoff
          let retries = 3;
          let response;
          while (retries >= 0) {
            try {
              response = await fetch(`https://api.zippopotam.us/us/${entry.zip_code}`);
              console.log(`ZIP API response for ${entry.zip_code}:`, {
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
                throw new Error(`ZIP code lookup failed after all retries: ${response.statusText}`);
              }
            } catch (fetchError) {
              console.error(`Fetch error for ZIP ${entry.zip_code}:`, fetchError);
              if (retries < 0) throw fetchError;
              await new Promise(resolve => setTimeout(resolve, 3000));
              retries--;
            }
          }

          if (!response?.ok) {
            throw new Error('Failed to get response from ZIP API');
          }

          const data = await response.json();
          console.log('ZIP API data for', entry.zip_code, ':', data);

          if (data && data.places && data.places[0]) {
            const place = data.places[0];
            await updateEntryMutation.mutateAsync([{id: entry.id, city: place['place name'], state: place['state abbreviation']}]);
            successCount++;
          } else {
            throw new Error('No location data found');
          }
        } catch (error) {
          failCount++;
          failedZips.push(`${entry.zip_code} (${error instanceof Error ? error.message : 'Unknown error'})`);
          console.error(`Error processing ZIP code ${entry.zip_code}:`, error);
        } finally {
          setLoadingZips(prev => ({ ...prev, [entry.id]: false }));
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
      const excelData = filteredAndSortedEntries.map(entry => ({
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="ml-2 h-4 w-4" /> :
      <ChevronDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your platform content and settings</p>
        </div>
        <div className="flex items-center gap-2">
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
        <TabsList>
          <TabsTrigger value="waitlist-entries">
            <UserPlus className="w-4 h-4 mr-2" />
            Waitlist Entries
          </TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist-entries" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      Email / Sign-up Time
                      {getSortIcon('created_at')}
                    </TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Street Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('zip_code')}
                    >
                      ZIP Code
                      {getSortIcon('zip_code')}
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        <div>
                          {entry.email}
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.first_name ?? entry.first_name ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'first_name', e.target.value)}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.last_name ?? entry.last_name ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'last_name', e.target.value)}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.phone_number ?? entry.phone_number ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'phone_number', e.target.value)}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.street_address ?? entry.street_address ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'street_address', e.target.value)}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.city ?? entry.city ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'city', e.target.value)}
                          className="max-w-[150px]"
                          disabled={loadingZips[entry.id]}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unsavedChanges[entry.id]?.state ?? entry.state ?? ''}
                          onChange={(e) => handleFieldChange(entry.id, 'state', e.target.value)}
                          className="max-w-[80px]"
                          disabled={loadingZips[entry.id]}
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
                            className="max-w-[100px]"
                          />
                          {loadingZips[entry.id] && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentNotes(entry.notes || '');
                                setCurrentEntryId(entry.id);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Notes for {entry.email}</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              value={currentNotes}
                              onChange={(e) => setCurrentNotes(e.target.value)}
                              placeholder="Add notes here..."
                              className="min-h-[200px]"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={saveNotes}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Notes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
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

            <div className="fixed bottom-8 right-8">
              <Button 
                onClick={handleSaveChanges}
                disabled={Object.keys(unsavedChanges).length === 0 || isSaving}
                size="lg"
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

        <TabsContent value="pricing">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <p className="text-muted-foreground">Configure your pricing plans here.</p>
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