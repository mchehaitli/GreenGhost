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
  Eye,
  BarChart,
  Mail,
  CheckCircle,
  Users,
  Plus,
  DollarSign,
  Pencil,
  X
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


// User management panel component
interface User {
  id: number;
  username: string;
  is_admin?: boolean;
  created_at: string;
}

// Form schema for adding a new user
const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  is_admin: z.boolean().default(false)
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

// Form schema for updating user information
const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  is_admin: z.boolean().optional()
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UserManagementPanelProps {
  currentUser: User | null;
}

function UserManagementPanel({ currentUser }: UserManagementPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
  // Form for adding a new user
  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });
  
  // Form for editing an existing user
  const editUserForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      is_admin: false
    }
  });
  
  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load users',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  // Add a new user
  const handleAddUser = async (data: AddUserFormValues) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      setShowAddUserDialog(false);
      addUserForm.reset();
      
      toast({
        title: 'Success',
        description: `User ${newUser.username} has been created`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create user',
        variant: 'destructive'
      });
    }
  };
  
  // Select user for editing
  const handleSelectUserForEdit = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({
      username: user.username,
      is_admin: user.is_admin || false
    });
    setShowEditUserDialog(true);
  };
  
  // Select user for deletion
  const handleSelectUserForDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };
  
  // Update an existing user
  const handleUpdateUser = async (data: UpdateUserFormValues) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setShowEditUserDialog(false);
      setSelectedUser(null);
      
      toast({
        title: 'Success',
        description: `User ${updatedUser.username} has been updated`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update user',
        variant: 'destructive'
      });
    }
  };
  
  // Delete a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
      
      toast({
        title: 'Success',
        description: `User ${selectedUser.username} has been deleted`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">User Management</h3>
        <Button onClick={() => setShowAddUserDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      {/* User List */}
      {isLoading ? (
        <div className="flex justify-center p-6">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSelectUserForEdit(user)}
                        disabled={currentUser?.id === user.id}
                        title="Edit User"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSelectUserForDelete(user)}
                        disabled={currentUser?.id === user.id}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
              Create a new user account with the specified permissions.
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
                      <Input placeholder="Enter username" {...field} />
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
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Administrator</FormLabel>
                      <FormDescription>
                        This user will have full administrative privileges
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={addUserForm.formState.isSubmitting}>
                  {addUserForm.formState.isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create User
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
              Update the user's information and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password (leave empty to keep current)" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to keep the current password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editUserForm.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Administrator</FormLabel>
                      <FormDescription>
                        This user will have full administrative privileges
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={editUserForm.formState.isSubmitting}>
                  {editUserForm.formState.isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{selectedUser?.username}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Pricing Management Component
interface PricingPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  billing_period: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  features: PlanFeature[];
}

interface PlanFeature {
  id: number;
  feature: string;
  included: boolean;
  sort_order: number;
  plan_id: number;
  created_at: string;
  updated_at: string;
}

interface PricingContent {
  page_title: string;
  page_subtitle: string;
}

// Removed duplicate PricingManagement function - using imported component instead



  const planForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      billing_period: "month",
      sort_order: 0,
      features: [],
    },
  });

  // Content form schema
  const contentFormSchema = z.object({
    page_title: z.string().min(1, "Page title is required"),
    page_subtitle: z.string().min(1, "Page subtitle is required"),
  });

  type ContentFormData = z.infer<typeof contentFormSchema>;

  const contentForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      page_title: content?.page_title || "Simple, Transparent Pricing",
      page_subtitle: content?.page_subtitle || "Choose the perfect plan for your lawn. All plans include our innovative service approach and dedicated support team.",
    },
  });

  // Update content form when data loads
  useEffect(() => {
    if (content) {
      contentForm.reset({
        page_title: content.page_title,
        page_subtitle: content.page_subtitle,
      });
    }
  }, [content, contentForm]);

  // Plan mutations
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch("/api/admin/pricing/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/plans"] });
      setShowPlanDialog(false);
      planForm.reset();
      toast({ title: "Success", description: "Plan created successfully" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch(`/api/admin/pricing/plans/${editingPlan?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/plans"] });
      setShowPlanDialog(false);
      setEditingPlan(null);
      planForm.reset();
      toast({ title: "Success", description: "Plan updated successfully" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch(`/api/admin/pricing/plans/${planId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete plan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/plans"] });
      setShowDeletePlanDialog(false);
      setPlanToDelete(null);
      toast({ title: "Success", description: "Plan deleted successfully" });
    },
  });



  const updateContentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const response = await fetch("/api/admin/pricing/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/content"] });
      setShowContentDialog(false);
      toast({ title: "Success", description: "Page content updated successfully" });
    },
  });

  // Feature management
  const addFeature = () => {
    const currentFeatures = planForm.getValues("features");
    planForm.setValue("features", [
      ...currentFeatures,
      { feature: "", included: true, sort_order: currentFeatures.length },
    ]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = planForm.getValues("features");
    planForm.setValue("features", currentFeatures.filter((_, i) => i !== index));
  };

  // Handle plan edit
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    planForm.reset({
      name: plan.name,
      price: parseFloat(plan.price.toString()),
      description: plan.description,
      billing_period: plan.billing_period,
      sort_order: plan.sort_order,
      features: plan.features.map(f => ({
        feature: f.feature,
        included: f.included,
        sort_order: f.sort_order,
      })),
    });
    setShowPlanDialog(true);
  };

  // Handle plan submission
  const handlePlanSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updatePlanMutation.mutate(data);
    } else {
// Account settings panel for the current user
interface AccountSettingsPanelProps {
  currentUser: User | null;
}

function AccountSettingsPanel({ currentUser }: AccountSettingsPanelProps) {
  const { toast } = useToast();
  
  // Form schema for updating current user
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
  
  // Update account settings when the current user changes
  useEffect(() => {
    if (currentUser) {
      form.reset({
        username: currentUser.username,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, [currentUser, form]);
  
  // Handle account update submission
  const onSubmit = async (data: UpdateAccountFormValues) => {
    if (!currentUser) return;
    
    try {
      const updateData: Record<string, any> = {
        username: data.username
      };
      
      // Only include new password if provided
      if (data.newPassword) {
        updateData.password = data.newPassword;
      }
      
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }
      
      // Reset the form but keep the username
      form.reset({
        username: data.username,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: 'Success',
        description: 'Your account has been updated',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update account',
        variant: 'destructive'
      });
    }
  };
  
  if (!currentUser) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        You must be logged in to view account settings
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">My Account</h3>
        <p className="text-muted-foreground">Update your account settings and change your password</p>
      </div>
      
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Change Password</h4>
              
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
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
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to keep your current password
                    </FormDescription>
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
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="mt-4"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </Card>
    </div>
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
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
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