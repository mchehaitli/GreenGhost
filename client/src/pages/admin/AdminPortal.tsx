import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmailBuilder } from "@/components/EmailBuilder";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  EyeOff,
  Pencil,
  BarChart,
  Mail,
  CheckCircle,
  Users,
  Plus,
  Lock
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import WaitlistMapView from '@/components/WaitlistMapView';
import WaitlistAnalytics from '@/components/WaitlistAnalytics';
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar } from "@/components/ui/calendar";
import { queryClient } from '@/lib/queryClient';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // State variables
  const [activeTab, setActiveTab] = useState("waitlist");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  
  // User management state
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [userDeleteDialogOpen, setUserDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState("account");
  
  // Email template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [emailViewOpen, setEmailViewOpen] = useState(false);
  const [emailToView, setEmailToView] = useState<any>(null);
  const [emailBuilderOpen, setEmailBuilderOpen] = useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);
  
  // Segmentation and campaign state
  const [segmentationCriteria, setSegmentationCriteria] = useState<{
    dateRange: { from: Date; to: Date } | null;
    states: string[];
    cities: string[];
    zipCodes: string[];
  }>({
    dateRange: null,
    states: [],
    cities: [],
    zipCodes: []
  });
  
  // Validation schemas
  const userEditSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().optional(),
    is_admin: z.boolean().default(false)
  });

  const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    is_admin: z.boolean().default(false)
  });

  const profileSchema = z.object({
    current_username: z.string(),
    new_username: z.string().min(3).optional(),
    email: z.string().email().optional(),
  });

  const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters")
  }).refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: "Passwords do not match",
  });

  // Form hooks
  const userEditForm = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });
  
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      current_username: user?.username || "",
      new_username: "",
      email: ""
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: ""
    }
  });
  
  // Data fetching queries
  const { data: waitlistEntries = [], isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist');
      if (!res.ok) throw new Error('Failed to fetch waitlist');
      return res.json();
    },
    enabled: activeTab === "waitlist"
  });

  const { data: analyticsData = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['waitlist-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: activeTab === "waitlist-analytics"
  });
  
  // Query for users list (admin only)
  const { data: usersList = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) {
        if (res.status === 403) {
          toast({
            title: "Access denied",
            description: "You do not have permission to view users",
            variant: "destructive"
          });
          return [];
        }
        throw new Error('Failed to fetch users');
      }
      return res.json();
    },
    enabled: activeTab === 'settings' && settingsSubTab === "users" && user?.is_admin
  });
  
  // Email template queries
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const res = await fetch('/api/email-templates');
      if (!res.ok) throw new Error('Failed to fetch email templates');
      return res.json();
    },
    enabled: activeTab === 'email'
  });
  
  // Mutations
  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete entry');
      return res.json();
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-analytics'] });
      toast({
        title: "Success",
        description: "Waitlist entry deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // User management mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof createUserSchema>) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setNewUserDialogOpen(false);
      createUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userEditSchema> & { id: number }) => {
      const { id, ...data } = userData;
      // Don't send empty password
      if (!data.password) {
        delete data.password;
      }
      
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setUserDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      profileForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update password');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      passwordForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Template mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create template");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setEmailBuilderOpen(false);
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Effect to set form values when user to edit changes
  useEffect(() => {
    if (userToEdit) {
      userEditForm.reset({
        username: userToEdit.username,
        password: '',
        is_admin: userToEdit.is_admin
      });
    }
  }, [userToEdit, userEditForm]);
  
  // Filtered waitlist entries
  const filteredEntries = useMemo(() => {
    if (!waitlistEntries) return [];
    return waitlistEntries.filter((entry: any) => {
      const searchString = searchTerm.toLowerCase();
      return (
        entry.email?.toLowerCase().includes(searchString) ||
        entry.first_name?.toLowerCase().includes(searchString) ||
        entry.last_name?.toLowerCase().includes(searchString) ||
        entry.zip_code?.toLowerCase().includes(searchString)
      );
    });
  }, [waitlistEntries, searchTerm]);
  
  // Handlers
  const handleDateFromChange = (date: Date | null) => {
    if (date) {
      setSegmentationCriteria(prev => ({
        ...prev,
        dateRange: {
          from: date,
          to: prev.dateRange?.to || new Date()
        }
      }));
    }
  };
  
  const handleDateToChange = (date: Date | null) => {
    if (date) {
      setSegmentationCriteria(prev => ({
        ...prev,
        dateRange: {
          from: prev.dateRange?.from || new Date(),
          to: date
        }
      }));
    }
  };
  
  const handleSaveTemplate = async (templateData: any) => {
    try {
      await createTemplateMutation.mutateAsync({
        name: templateData.name || "New Template",
        subject: templateData.subject,
        html_content: templateData.html,
        plain_content: templateData.text
      });
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };
  
  const handleDeleteEntry = (id: number) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleExportWaitlist = () => {
    const dataToExport = filteredEntries.map((entry: any) => ({
      Email: entry.email,
      FirstName: entry.first_name || '',
      LastName: entry.last_name || '',
      Phone: entry.phone_number || '',
      Address: entry.street_address || '',
      City: entry.city || '',
      State: entry.state || '',
      ZipCode: entry.zip_code || '',
      JoinedOn: entry.created_at ? format(new Date(entry.created_at), 'MM/dd/yyyy') : '',
      Notes: entry.notes || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Waitlist");
    XLSX.writeFile(wb, `GreenGhost_Waitlist_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Success",
      description: "Waitlist data exported successfully",
    });
  };
  
  // User management handlers
  const onSubmitUserEdit = (data: z.infer<typeof userEditSchema>) => {
    if (!userToEdit) return;
    
    updateUserMutation.mutate({
      ...data,
      id: userToEdit.id
    });
  };
  
  const onSubmitCreateUser = (data: z.infer<typeof createUserSchema>) => {
    createUserMutation.mutate(data);
  };
  
  const onSubmitProfile = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  const onSubmitPassword = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(data);
  };
  
  // If not authenticated or not admin, show access denied
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be logged in to access this page.</p>
        <Button onClick={() => navigate("/login")}>Login</Button>
      </div>
    );
  }
  
  // For non-admin users who are logged in
  if (!user.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">This area is restricted to administrators only.</p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Portal</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Logged in as {user.username} {user.is_admin && "(Admin)"}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="waitlist" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="waitlist-analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Waitlist Management</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleExportWaitlist}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by email, name, or zip code..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {waitlistLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  {searchTerm ? "No results found" : "No waitlist entries yet"}
                </div>
              ) : (
                <div className="rounded-md border">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[20%]">Email</TableHead>
                          <TableHead className="w-[15%]">Name</TableHead>
                          <TableHead className="w-[10%]">Zip Code</TableHead>
                          <TableHead className="w-[15%]">Phone</TableHead>
                          <TableHead className="w-[15%]">Date Added</TableHead>
                          <TableHead className="w-[10%]">Status</TableHead>
                          <TableHead className="w-[15%] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((entry: any) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.email}</TableCell>
                            <TableCell>
                              {entry.first_name} {entry.last_name}
                            </TableCell>
                            <TableCell>{entry.zip_code}</TableCell>
                            <TableCell>{entry.phone_number || "-"}</TableCell>
                            <TableCell>
                              {entry.created_at
                                ? format(new Date(entry.created_at), "MMM d, yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    /* View entry details */
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    /* Edit entry */
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Waitlist Analytics Tab */}
        <TabsContent value="waitlist-analytics">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (
                <WaitlistAnalytics entries={waitlistEntries} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Templates Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Email Templates</CardTitle>
                <Button 
                  onClick={() => setEmailBuilderOpen(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : emailTemplates.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No email templates created yet
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Name</TableHead>
                        <TableHead className="w-[40%]">Subject</TableHead>
                        <TableHead className="w-[15%]">Created</TableHead>
                        <TableHead className="w-[15%] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.map((template: any) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.subject}</TableCell>
                          <TableCell>
                            {template.created_at
                              ? format(new Date(template.created_at), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEmailToView(template);
                                  setEmailViewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTemplateId(template.id);
                                  /* Edit template implementation */
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setTemplateToDelete(template);
                                  setDeleteTemplateDialogOpen(true);
                                }}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Map View Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[600px] w-full">
                <WaitlistMapView entries={waitlistEntries} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={settingsSubTab} 
                onValueChange={setSettingsSubTab} 
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value="account">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users className="mr-2 h-4 w-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="system">
                    <Settings className="mr-2 h-4 w-4" />
                    System
                  </TabsTrigger>
                </TabsList>
                
                {/* Account Tab */}
                <TabsContent value="account" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...profileForm}>
                          <form
                            onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                            className="space-y-4"
                          >
                            <FormField
                              control={profileForm.control}
                              name="current_username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Username</FormLabel>
                                  <FormControl>
                                    <Input disabled {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="new_username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Username (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Update Profile
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                            className="space-y-4"
                          >
                            <FormField
                              control={passwordForm.control}
                              name="current_password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showCurrentPassword ? "text" : "password"} 
                                        {...field} 
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      >
                                        {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="new_password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showNewPassword ? "text" : "password"} 
                                        {...field} 
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                      >
                                        {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirm_password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        {...field} 
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      >
                                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              disabled={updatePasswordMutation.isPending}
                            >
                              {updatePasswordMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Update Password
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">User Management</h3>
                    <Button 
                      onClick={() => setNewUserDialogOpen(true)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                  
                  {usersLoading ? (
                    <div className="flex justify-center py-10">
                      <LoadingSpinner />
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Username</TableHead>
                            <TableHead className="w-[20%]">Role</TableHead>
                            <TableHead className="w-[20%]">Created</TableHead>
                            <TableHead className="w-[20%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersList.map((userItem) => (
                            <TableRow key={userItem.id}>
                              <TableCell className="font-medium">{userItem.username}</TableCell>
                              <TableCell>
                                <Badge variant={userItem.is_admin ? "default" : "outline"}>
                                  {userItem.is_admin ? "Admin" : "User"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {userItem.created_at
                                  ? format(new Date(userItem.created_at), "MMM d, yyyy")
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUserToEdit(userItem);
                                      setEditUserDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => {
                                      setUserToDelete(userItem);
                                      setUserDeleteDialogOpen(true);
                                    }}
                                    disabled={userItem.id === user?.id} // Can't delete yourself
                                    title="Delete user"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                {/* System Tab */}
                <TabsContent value="system" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Application Version
                            </h4>
                            <p>1.0.0</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Environment
                            </h4>
                            <p>Production</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Database Status
                            </h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Connected
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Last Backup
                            </h4>
                            <p>{format(new Date(), "MMM d, yyyy HH:mm")}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this waitlist entry.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (entryToDelete !== null) {
                  deleteWaitlistEntryMutation.mutate(entryToDelete);
                }
              }}
              disabled={deleteWaitlistEntryMutation.isPending}
            >
              {deleteWaitlistEntryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Email Template Viewer */}
      <Dialog open={emailViewOpen} onOpenChange={setEmailViewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{emailToView?.name}</DialogTitle>
            <DialogDescription>
              {emailToView?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 h-[500px] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: emailToView?.html_content }} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Email Builder Dialog */}
      <Dialog open={emailBuilderOpen} onOpenChange={setEmailBuilderOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Design your email template below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full">
            <EmailBuilder onSave={handleSaveTemplate} />
          </div>
        </DialogContent>
      </Dialog>
      
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

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <Form {...userEditForm}>
              <form onSubmit={userEditForm.handleSubmit(onSubmitUserEdit)} className="space-y-4">
                <FormField
                  control={userEditForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userEditForm.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Administrator</FormLabel>
                        <FormDescription>
                          Give this user admin privileges
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={userEditForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showUserPassword ? "text" : "password"} 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowUserPassword(!showUserPassword)}
                          >
                            {showUserPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={userDeleteDialogOpen} onOpenChange={setUserDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{userToDelete?.username}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (userToDelete) {
                  try {
                    deleteUserMutation.mutate(userToDelete.id);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to delete user",
                      variant: "destructive"
                    });
                  }
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account to the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(onSubmitCreateUser)} className="space-y-4">
              <FormField
                control={createUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showUserPassword ? "text" : "password"} 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                        >
                          {showUserPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createUserForm.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Administrator</FormLabel>
                      <FormDescription>
                        Grant admin privileges to this user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}