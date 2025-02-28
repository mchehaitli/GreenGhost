import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Settings,
  DollarSign,
  UserPlus,
  Search,
  SlidersHorizontal,
  FileText,
  Save,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

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
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'created_at',
    direction: 'desc'
  });

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
    mutationFn: async (entry: Partial<WaitlistEntry>) => {
      const response = await fetch(`/api/waitlist/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error('Failed to update entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast({ title: "Entry updated successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to update entry",
        variant: "destructive"
      });
    },
  });

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
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
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      const data = await response.json();
      if (data && data.places && data.places[0]) {
        const place = data.places[0];
        updateEntryMutation.mutate({
          id: entryId,
          city: place['place name'],
          state: place['state abbreviation'],
        });
      }
    } catch (error) {
      toast({
        title: "Failed to fetch location data",
        description: "Please enter city and state manually",
        variant: "destructive"
      });
    }
  };

  const saveNotes = () => {
    if (currentEntryId) {
      updateEntryMutation.mutate({
        id: currentEntryId,
        notes: currentNotes,
      });
      setShowNotesDialog(false);
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
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
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
                          value={entry.first_name || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              first_name: e.target.value,
                            });
                          }}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.last_name || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              last_name: e.target.value,
                            });
                          }}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.phone_number || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              phone_number: e.target.value,
                            });
                          }}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.street_address || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              street_address: e.target.value,
                            });
                          }}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.city || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              city: e.target.value,
                            });
                          }}
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.state || ''}
                          onChange={(e) => {
                            updateEntryMutation.mutate({
                              id: entry.id,
                              state: e.target.value,
                            });
                          }}
                          className="max-w-[80px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.zip_code || ''}
                          onChange={(e) => {
                            const zip = e.target.value;
                            updateEntryMutation.mutate({
                              id: entry.id,
                              zip_code: zip,
                            });
                            if (zip.length === 5) {
                              handleCityStateFromZip(zip, entry.id);
                            }
                          }}
                          className="max-w-[100px]"
                        />
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </div>
  );
}