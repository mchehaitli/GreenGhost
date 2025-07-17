import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { getQueryFn } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmailBuilder } from "@/components/EmailBuilder";
import { EmailTemplateManager } from "@/components/EmailTemplateManager";
import PricingManagement from "./PricingManagement";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Edit,
  Calendar,
  Mail,
  Users,
  Plus,
  BarChart3,
  Send,
  Eye,
  Filter,
  X,
  Pencil,
  CheckCircle,
  UserX,
  AlertTriangle,
  Banknote,
  TrendingUp,
  Clock,
} from 'lucide-react';
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
import { addDays, subDays, isWithinInterval, format } from 'date-fns';
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

interface User {
  id: number;
  username: string;
  is_admin?: boolean;
  created_at: string;
}

type AddUserFormValues = z.infer<typeof addUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  is_admin: z.boolean().default(false)
});

const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  is_admin: z.boolean().default(false)
});

interface UserManagementPanelProps {
  currentUser: User | null;
}

function UserManagementPanel({ currentUser }: UserManagementPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });

  const updateUserForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: AddUserFormValues) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddUserDialog(false);
      addUserForm.reset();
      toast({ title: "Success", description: "User added successfully" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserFormValues) => {
      const response = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditUserDialog(false);
      setSelectedUser(null);
      updateUserForm.reset();
      toast({ title: "Success", description: "User updated successfully" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteUserDialog(false);
      setSelectedUser(null);
      toast({ title: "Success", description: "User deleted successfully" });
    },
  });

  const handleAddUser = async (data: AddUserFormValues) => {
    addUserMutation.mutate(data);
  };

  const handleSelectUserForEdit = (user: User) => {
    setSelectedUser(user);
    updateUserForm.reset({
      username: user.username,
      password: "",
      is_admin: user.is_admin || false
    });
    setShowEditUserDialog(true);
  };

  const handleSelectUserForDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
  };

  const handleUpdateUser = async (data: UpdateUserFormValues) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Button onClick={() => setShowAddUserDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {usersLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectUserForEdit(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectUserForDelete(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with admin or user privileges
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Admin privileges</FormLabel>
                      <FormDescription>
                        Give this user admin access to the dashboard
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account details and privileges
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateUserForm}>
            <form onSubmit={updateUserForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={updateUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Leave blank to keep current password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateUserForm.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Admin privileges</FormLabel>
                      <FormDescription>
                        Give this user admin access to the dashboard
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedUser?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AccountSettingsPanelProps {
  currentUser: User | null;
}

function AccountSettingsPanel({ currentUser }: AccountSettingsPanelProps) {
  const { toast } = useToast();
  
  const updateAccountSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional()
  })
  .refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });
  
  type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;
  
  const form = useForm<UpdateAccountFormValues>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      username: currentUser?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: UpdateAccountFormValues) => {
      const response = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update account");
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      toast({ title: "Success", description: "Account updated successfully" });
    },
  });

  const onSubmit = async (data: UpdateAccountFormValues) => {
    updateAccountMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={updateAccountMutation.isPending}>
              {updateAccountMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Update Account
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}

// Edit Entry Form Component
type EditEntryFormProps = {
  entry: WaitlistEntry;
  onSave: (data: Partial<WaitlistEntry>) => void;
  onCancel: () => void;
  isLoading: boolean;
};

const editEntrySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().min(5, "ZIP code must be at least 5 characters"),
  notes: z.string().optional(),
});

function EditEntryForm({ entry, onSave, onCancel, isLoading }: EditEntryFormProps) {
  const form = useForm<z.infer<typeof editEntrySchema>>({
    resolver: zodResolver(editEntrySchema),
    defaultValues: {
      email: entry.email,
      first_name: entry.first_name || "",
      last_name: entry.last_name || "",
      phone_number: entry.phone_number || "",
      street_address: entry.street_address || "",
      city: entry.city || "",
      state: entry.state || "",
      zip_code: entry.zip_code,
      notes: entry.notes || "",
    },
  });

  const onSubmit = (data: z.infer<typeof editEntrySchema>) => {
    onSave(data);
  };

  const handleZipChange = async (zip: string) => {
    if (zip.length === 5) {
      try {
        const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (response.ok) {
          const data = await response.json();
          const place = data.places[0];
          form.setValue('city', place['place name']);
          form.setValue('state', place['state abbreviation']);
        }
      } catch (error) {
        // Silently fail
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="ZIP code"
                    onChange={(e) => {
                      field.onChange(e);
                      handleZipChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="First name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Last name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Street address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="City" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="State" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional notes" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
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
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [segmentationCriteria, setSegmentationCriteria] = useState<SegmentationCriteria>({
    dateRange: null,
    states: [],
    cities: [],
    zipCodes: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WaitlistEntry | null>(null);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: waitlistEntries, isLoading: waitlistLoading, error: waitlistError } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.is_admin,
  });

  const { data: emailTemplates, isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const response = await fetch("/api/email-templates", {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized access to email templates');
          return [];
        }
        throw new Error("Failed to fetch email templates");
      }
      return response.json();
    },
    enabled: !!user,
  });

  const { data: emailHistory, isLoading: emailHistoryLoading } = useQuery<EmailHistoryEntry[]>({
    queryKey: ["/api/email-history"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await fetch(`/api/admin/waitlist/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error("Failed to update notes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/waitlist"] });
      setShowNotesDialog(false);
      setCurrentNotes("");
      setCurrentEntryId(null);
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
    },
  });

  const deleteWaitlistEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete entry: ${response.status} ${errorText}`);
      }
      // The backend returns 200 with no body, so just return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      toast({
        title: "Success",
        description: "Waitlist entry deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ templateId, recipientIds }: { templateId: number; recipientIds: number[] }) => {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, recipientIds }),
      });
      if (!response.ok) throw new Error("Failed to send email");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-history"] });
      setShowEmailDialog(false);
      setSelectedEntries([]);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
    },
  });

  // Handle field changes for inline editing
  const handleFieldChange = (id: number, field: string, value: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Handle ZIP code lookup for city/state
  const handleCityStateFromZip = async (zip: string, entryId: number) => {
    if (zip.length !== 5) return;
    
    setLoadingZips(prev => ({ ...prev, [entryId]: true }));
    
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (response.ok) {
        const data = await response.json();
        const city = data.places[0]['place name'];
        const state = data.places[0]['state abbreviation'];
        
        setUnsavedChanges(prev => ({
          ...prev,
          [entryId]: {
            ...prev[entryId],
            city,
            state
          }
        }));
      }
    } catch (error) {
      console.log('ZIP lookup failed:', error);
    } finally {
      setLoadingZips(prev => ({ ...prev, [entryId]: false }));
    }
  };

  // Handle auto-populate all locations
  const handleAutoPopulateAll = async () => {
    if (!waitlistEntries) return;
    
    setIsAutoPopulating(true);
    const updates: Record<number, Partial<WaitlistEntry>> = {};
    
    for (const entry of waitlistEntries) {
      if (entry.zip_code && (!entry.city || !entry.state)) {
        try {
          const response = await fetch(`https://api.zippopotam.us/us/${entry.zip_code}`);
          if (response.ok) {
            const data = await response.json();
            updates[entry.id] = {
              city: data.places[0]['place name'],
              state: data.places[0]['state abbreviation']
            };
          }
        } catch (error) {
          console.log(`ZIP lookup failed for ${entry.zip_code}:`, error);
        }
      }
    }
    
    setUnsavedChanges(prev => ({
      ...prev,
      ...updates
    }));
    setIsAutoPopulating(false);
  };

  // Edit entry mutation
  const editEntryMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<WaitlistEntry> }) => {
      const response = await fetch(`/api/waitlist/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setShowEditDialog(false);
      setEditingEntry(null);
      toast({
        title: "Success",
        description: "Entry updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle edit entry
  const handleEditEntry = (entry: WaitlistEntry) => {
    setEditingEntry(entry);
    setShowEditDialog(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => setLocation("/")}>
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredEntries = useMemo(() => {
    if (!waitlistEntries) return [];
    
    let filtered = waitlistEntries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.zip_code.includes(searchTerm) ||
        (entry.first_name && entry.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.last_name && entry.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortField === 'created_at') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else {
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
      }
      
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

    return filtered;
  }, [waitlistEntries, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (entry: WaitlistEntry) => {
    setCurrentEntryId(entry.id);
    setCurrentNotes(entry.notes || "");
    setShowNotesDialog(true);
  };

  const handleSaveNotes = () => {
    if (currentEntryId !== null) {
      updateNotesMutation.mutate({
        id: currentEntryId,
        notes: currentNotes,
      });
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Email', 'First Name', 'Last Name', 'Phone', 'Address', 'City', 'State', 'ZIP', 'Created', 'Notes'].join(','),
      ...filteredEntries.map(entry => [
        entry.email,
        entry.first_name || '',
        entry.last_name || '',
        entry.phone_number || '',
        entry.street_address || '',
        entry.city || '',
        entry.state || '',
        entry.zip_code,
        new Date(entry.created_at).toLocaleDateString(),
        (entry.notes || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueStates = useMemo(() => {
    if (!waitlistEntries) return [];
    return [...new Set(waitlistEntries.map(e => e.state).filter(Boolean))];
  }, [waitlistEntries]);

  const uniqueCities = useMemo(() => {
    if (!waitlistEntries) return [];
    return [...new Set(waitlistEntries.map(e => e.city).filter(Boolean))];
  }, [waitlistEntries]);

  const uniqueZipCodes = useMemo(() => {
    if (!waitlistEntries) return [];
    return [...new Set(waitlistEntries.map(e => e.zip_code).filter(Boolean))];
  }, [waitlistEntries]);

  const getFilteredForSegmentation = () => {
    if (!waitlistEntries) return [];
    
    return waitlistEntries.filter(entry => {
      if (segmentationCriteria.dateRange) {
        const entryDate = new Date(entry.created_at);
        if (!isWithinInterval(entryDate, segmentationCriteria.dateRange)) {
          return false;
        }
      }
      
      if (segmentationCriteria.states.length > 0 && 
          (!entry.state || !segmentationCriteria.states.includes(entry.state))) {
        return false;
      }
      
      if (segmentationCriteria.cities.length > 0 && 
          (!entry.city || !segmentationCriteria.cities.includes(entry.city))) {
        return false;
      }
      
      if (segmentationCriteria.zipCodes.length > 0 && 
          !segmentationCriteria.zipCodes.includes(entry.zip_code)) {
        return false;
      }
      
      return true;
    });
  };

  const analyticsData = useMemo(() => {
    if (!waitlistEntries) return null;
    
    const totalEntries = waitlistEntries.length;
    const last7Days = waitlistEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const weekAgo = subDays(new Date(), 7);
      return entryDate >= weekAgo;
    }).length;
    
    const last30Days = waitlistEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const monthAgo = subDays(new Date(), 30);
      return entryDate >= monthAgo;
    }).length;
    
    const zipCodeCounts = waitlistEntries.reduce((acc, entry) => {
      acc[entry.zip_code] = (acc[entry.zip_code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topZipCodes = Object.entries(zipCodeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([zip, count]) => ({ zip, count }));
    
    const pieData = topZipCodes.map((item, index) => ({
      name: item.zip,
      value: item.count,
      fill: `hsl(${index * 72}, 70%, 50%)`
    }));
    
    return {
      totalEntries,
      last7Days,
      last30Days,
      topZipCodes,
      pieData
    };
  }, [waitlistEntries]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.username}
          </p>
        </div>
        <Button variant="outline" onClick={async () => {
          console.log('Logout button clicked');
          try {
            console.log('Calling logout function...');
            await logout();
            console.log('Logout successful, redirecting...');
            setLocation('/login');
          } catch (error) {
            console.error('Logout error:', error);
            toast({
              title: "Logout Failed",
              description: error instanceof Error ? error.message : "Could not log out. Please try again.",
              variant: "destructive"
            });
          }
        }}>
          <User className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="waitlist-entries">
            <Users className="w-4 h-4 mr-2" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="email-campaigns">
            <Mail className="w-4 h-4 mr-2" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <Banknote className="w-4 h-4 mr-2" />
            Pricing Management
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist-entries" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Waitlist Entries</h2>
                <p className="text-muted-foreground">
                  Manage and export waitlist submissions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={handleAutoPopulateAll}
                  disabled={isAutoPopulating}
                  variant="outline"
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

            {waitlistLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('zip_code')}
                      >
                        <div className="flex items-center">
                          ZIP Code
                          {sortField === 'zip_code' && (
                            sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Joined
                          {sortField === 'created_at' && (
                            sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.email}</TableCell>
                        <TableCell>
                          {entry.first_name || entry.last_name ? 
                            `${entry.first_name || ''} ${entry.last_name || ''}`.trim() : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            {entry.city && entry.state ? `${entry.city}, ${entry.state}` : '-'}
                          </div>
                        </TableCell>
                        <TableCell>{entry.zip_code}</TableCell>
                        <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEntryToDelete(entry);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!waitlistLoading && filteredEntries.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No waitlist entries yet.'}
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Debug: waitlistEntries={waitlistEntries ? waitlistEntries.length : 'null'}, 
                  loading={waitlistLoading ? 'true' : 'false'}, 
                  error={waitlistError ? String(waitlistError) : 'none'}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Waitlist Analytics</h2>
              <p className="text-muted-foreground">
                Track growth and engagement metrics
              </p>
            </div>

            {waitlistLoading ? (
              <LoadingSpinner />
            ) : analyticsData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                        <p className="text-2xl font-bold">{analyticsData.totalEntries}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                        <p className="text-2xl font-bold">{analyticsData.last7Days}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Last 30 Days</p>
                        <p className="text-2xl font-bold">{analyticsData.last30Days}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Top ZIP Codes</h3>
                    <div className="space-y-2">
                      {analyticsData.topZipCodes.map((item, index) => (
                        <div key={item.zip} className="flex items-center justify-between">
                          <span className="font-medium">{item.zip}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${(item.count / analyticsData.topZipCodes[0].count) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Distribution by ZIP</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No data available</h3>
                <p className="text-muted-foreground">Analytics will appear once you have waitlist entries.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="email-campaigns" className="space-y-4">
          <Card className="p-4 md:p-6">
            <EmailTemplateManager 
              templates={emailTemplates || []}
              onTemplateSelect={(template) => {
                setSelectedTemplate(template);
                setShowEmailDialog(true);
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <Tabs defaultValue="user-management">
              <TabsList className="mb-4">
                <TabsTrigger value="user-management">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </TabsTrigger>
                <TabsTrigger value="account">
                  <User className="w-4 h-4 mr-2" />
                  My Account
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="user-management">
                <UserManagementPanel currentUser={user} />
              </TabsContent>
              
              <TabsContent value="account">
                <AccountSettingsPanel currentUser={user} />
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
                        <TableCell className="font-medium">{history.template_name}</TableCell>
                        <TableCell>{new Date(history.sent_at).toLocaleDateString()}</TableCell>
                        <TableCell>{history.total_recipients}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              history.status === 'completed' ? 'default' : 
                              history.status === 'failed' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {history.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No email history found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Details & Notes</DialogTitle>
            <DialogDescription>
              View and update notes for this waitlist entry
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Add notes about this entry..."
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
              {updateNotesMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Campaign Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Send Email Campaign</DialogTitle>
            <DialogDescription>
              Select recipients and compose your email campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Recipient Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Recipients</h3>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="segmentation">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Advanced Segmentation
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date Range</Label>
                        <div className="flex gap-2">
                          <DatePicker
                            date={segmentationCriteria.dateRange?.from}
                            onDateChange={(date) => {
                              setSegmentationCriteria(prev => ({
                                ...prev,
                                dateRange: date ? {
                                  from: date,
                                  to: prev.dateRange?.to || new Date()
                                } : null
                              }));
                            }}
                            placeholder="From date"
                          />
                          <DatePicker
                            date={segmentationCriteria.dateRange?.to}
                            onDateChange={(date) => {
                              setSegmentationCriteria(prev => ({
                                ...prev,
                                dateRange: prev.dateRange?.from ? {
                                  from: prev.dateRange.from,
                                  to: date || new Date()
                                } : null
                              }));
                            }}
                            placeholder="To date"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>States</Label>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (!segmentationCriteria.states.includes(value)) {
                              setSegmentationCriteria(prev => ({
                                ...prev,
                                states: [...prev.states, value]
                              }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add state" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {segmentationCriteria.states.map(state => (
                            <Badge key={state} variant="secondary">
                              {state}
                              <X 
                                className="w-3 h-3 ml-1 cursor-pointer" 
                                onClick={() => {
                                  setSegmentationCriteria(prev => ({
                                    ...prev,
                                    states: prev.states.filter(s => s !== state)
                                  }));
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="text-sm text-muted-foreground">
                Selected recipients: {getFilteredForSegmentation().length}
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Email Template</h3>
              {selectedTemplate ? (
                <Card className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{selectedTemplate.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.subject}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Change Template
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {emailTemplates?.map((template) => (
                    <Card 
                      key={template.id} 
                      className="p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedTemplate) {
                  const recipients = getFilteredForSegmentation();
                  sendEmailMutation.mutate({
                    templateId: selectedTemplate.id,
                    recipientIds: recipients.map(r => r.id)
                  });
                }
              }}
              disabled={!selectedTemplate || getFilteredForSegmentation().length === 0 || sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Waitlist Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this waitlist entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {entryToDelete && (
            <div className="space-y-2">
              <p><strong>Email:</strong> {entryToDelete.email}</p>
              <p><strong>ZIP Code:</strong> {entryToDelete.zip_code}</p>
              {entryToDelete.first_name || entryToDelete.last_name ? (
                <p><strong>Name:</strong> {`${entryToDelete.first_name || ''} ${entryToDelete.last_name || ''}`.trim()}</p>
              ) : null}
              <p><strong>Joined:</strong> {new Date(entryToDelete.created_at).toLocaleDateString()}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (entryToDelete) {
                  deleteWaitlistEntryMutation.mutate(entryToDelete.id);
                }
              }}
              disabled={deleteWaitlistEntryMutation.isPending}
            >
              {deleteWaitlistEntryMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
            <DialogDescription>
              Detailed information for this waitlist entry
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ZIP Code</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.zip_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">First Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.first_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.last_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.street_address || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">City</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.city || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">State</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.state || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.notes || 'No notes'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Signed Up</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedEntry.created_at), "MMMM do, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Waitlist Entry</DialogTitle>
            <DialogDescription>
              Update the information for this waitlist entry
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <EditEntryForm 
              entry={editingEntry} 
              onSave={(data) => editEntryMutation.mutate({ id: editingEntry.id, updates: data })}
              onCancel={() => setShowEditDialog(false)}
              isLoading={editEntryMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}