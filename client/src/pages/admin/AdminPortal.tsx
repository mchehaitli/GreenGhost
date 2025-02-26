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
import { User, Settings, DollarSign, Mail, Users, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';

type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
  location?: string;
};

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
};

type PricingData = {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  serviceFrequency: string;
  maxBookingsPerMonth: number;
};

type AdminUser = {
  id: number;
  username: string;
};

export default function AdminPortal() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    subject: '',
    html_content: ''
  });

  // Queries
  const {
    data: waitlistEntries = [],
    isLoading: waitlistLoading,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: () => fetch('/api/waitlist').then(res => res.json()),
    enabled: activeTab === "waitlist" && !!user,
  });

  const {
    data: emailTemplates = [],
    isLoading: templatesLoading,
  } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates'],
    queryFn: () => fetch('/api/email-templates').then(res => res.json()),
    enabled: activeTab === "email-templates" && !!user,
  });

  const {
    data: pricingData = [],
    isLoading: pricingLoading,
  } = useQuery<PricingData[]>({
    queryKey: ['pricing'],
    queryFn: () => fetch('/api/pricing').then(res => res.json()),
    enabled: activeTab === "pricing" && !!user,
  });

  const {
    data: adminUsers = [],
    isLoading: adminsLoading,
  } = useQuery<AdminUser[]>({
    queryKey: ['admins'],
    queryFn: () => fetch('/api/admins').then(res => res.json()),
    enabled: activeTab === "settings" && !!user,
  });

  // Mutations
  const addAdminMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Failed to create admin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: "Admin created successfully" });
      setNewAdminUsername("");
      setNewAdminPassword("");
    },
    onError: () => {
      toast({ 
        title: "Failed to create admin", 
        variant: "destructive" 
      });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async (data: { id: number; username: string; password?: string }) => {
      const response = await fetch(`/api/admin/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update admin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: "Admin updated successfully" });
      setEditingAdmin(null);
    },
    onError: () => {
      toast({ 
        title: "Failed to update admin", 
        variant: "destructive" 
      });
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: PricingData) => {
      const response = await fetch(`/api/pricing/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update pricing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      toast({ title: "Pricing updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update pricing", 
        variant: "destructive" 
      });
    },
  });

  const saveEmailTemplateMutation = useMutation({
    mutationFn: async (data: Partial<EmailTemplate>) => {
      const method = data.id ? 'PATCH' : 'POST';
      const url = data.id ? `/api/email-templates/${data.id}` : '/api/email-templates';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: "Email template saved successfully" });
      setEditingTemplate(null);
      setNewTemplateData({ name: '', subject: '', html_content: '' });
    },
    onError: () => {
      toast({ 
        title: "Failed to save template", 
        variant: "destructive" 
      });
    },
  });

  // Analytics calculations
  const waitlistAnalytics = {
    total: waitlistEntries.length,
    lastWeek: waitlistEntries.filter(entry => {
      const date = new Date(entry.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length,
    byLocation: waitlistEntries.reduce((acc, entry) => {
      if (entry.location) {
        acc[entry.location] = (acc[entry.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          <TabsTrigger value="waitlist">
            <Users className="w-4 h-4 mr-2" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist">
          {waitlistLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Total Signups</h3>
                  <p className="text-2xl font-bold">{waitlistAnalytics.total}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Last 7 Days</h3>
                  <p className="text-2xl font-bold">{waitlistAnalytics.lastWeek}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Conversion Rate</h3>
                  <p className="text-2xl font-bold">
                    {waitlistAnalytics.total > 0 
                      ? `${((waitlistAnalytics.lastWeek / waitlistAnalytics.total) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </Card>
              </div>

              <Card>
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Waitlist Entries</h2>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="p-4">
                    {waitlistEntries.map((entry) => (
                      <div key={entry.id} className="py-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{entry.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined: {format(new Date(entry.created_at), 'PPP')}
                            </p>
                          </div>
                          {entry.location && (
                            <Badge variant="secondary">{entry.location}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="email-templates">
          {templatesLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Email Templates</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTemplate(null)}>
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate ? 'Edit Template' : 'Create Template'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          value={editingTemplate?.name || newTemplateData.name}
                          onChange={(e) => {
                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                name: e.target.value
                              });
                            } else {
                              setNewTemplateData({
                                ...newTemplateData,
                                name: e.target.value
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={editingTemplate?.subject || newTemplateData.subject}
                          onChange={(e) => {
                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                subject: e.target.value
                              });
                            } else {
                              setNewTemplateData({
                                ...newTemplateData,
                                subject: e.target.value
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                          id="content"
                          className="w-full min-h-[200px] p-2 border rounded-md"
                          value={editingTemplate?.html_content || newTemplateData.html_content}
                          onChange={(e) => {
                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                html_content: e.target.value
                              });
                            } else {
                              setNewTemplateData({
                                ...newTemplateData,
                                html_content: e.target.value
                              });
                            }
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (editingTemplate) {
                            saveEmailTemplateMutation.mutate(editingTemplate);
                          } else {
                            saveEmailTemplateMutation.mutate(newTemplateData);
                          }
                        }}
                      >
                        Save Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            // Implement delete functionality
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Admin Settings</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Admins</h3>
                {adminsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {adminUsers.map((admin) => (
                      <Card key={admin.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{admin.username}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAdmin(admin)}
                          >
                            Edit
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Separator className="my-6" />

                <h3 className="text-lg font-medium">Add New Admin</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newUsername">Username</Label>
                    <Input
                      id="newUsername"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="Enter new admin username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new admin password"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!newAdminUsername || !newAdminPassword) {
                        toast({
                          title: "Validation Error",
                          description: "Please fill in both username and password",
                          variant: "destructive"
                        });
                        return;
                      }
                      addAdminMutation.mutate({
                        username: newAdminUsername,
                        password: newAdminPassword
                      });
                    }}
                    disabled={addAdminMutation.isPending}
                  >
                    {addAdminMutation.isPending ? "Creating..." : "Create Admin"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Admin Dialog */}
          {editingAdmin && (
            <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Admin User</DialogTitle>
                  <DialogDescription>
                    Update the credentials for {editingAdmin.username}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editUsername">Username</Label>
                    <Input
                      id="editUsername"
                      value={editingAdmin.username}
                      onChange={(e) =>
                        setEditingAdmin({
                          ...editingAdmin,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPassword">New Password (optional)</Label>
                    <Input
                      id="editPassword"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      onChange={(e) =>
                        setEditingAdmin({
                          ...editingAdmin,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={() => {
                      updateAdminMutation.mutate({
                        id: editingAdmin.id,
                        username: editingAdmin.username,
                        ...(editingAdmin.password && { password: editingAdmin.password }),
                      });
                    }}
                  >
                    Update Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="pricing">
          {pricingLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Manage Pricing</h2>
              <div className="grid gap-6">
                {pricingData.map((plan) => (
                  <Card key={plan.id} className="p-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`name-${plan.id}`}>Plan Name</Label>
                        <Input
                          id={`name-${plan.id}`}
                          defaultValue={plan.name}
                          onChange={(e) => {
                            const updatedPlan = { ...plan, name: e.target.value };
                            updatePricingMutation.mutate(updatedPlan);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`price-${plan.id}`}>Price</Label>
                        <Input
                          id={`price-${plan.id}`}
                          type="number"
                          defaultValue={plan.price}
                          onChange={(e) => {
                            const updatedPlan = { ...plan, price: parseFloat(e.target.value) };
                            updatePricingMutation.mutate(updatedPlan);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`description-${plan.id}`}>Description</Label>
                        <Input
                          id={`description-${plan.id}`}
                          defaultValue={plan.description}
                          onChange={(e) => {
                            const updatedPlan = { ...plan, description: e.target.value };
                            updatePricingMutation.mutate(updatedPlan);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`frequency-${plan.id}`}>Service Frequency</Label>
                        <Input
                          id={`frequency-${plan.id}`}
                          defaultValue={plan.serviceFrequency}
                          onChange={(e) => {
                            const updatedPlan = { ...plan, serviceFrequency: e.target.value };
                            updatePricingMutation.mutate(updatedPlan);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`bookings-${plan.id}`}>Max Bookings per Month</Label>
                        <Input
                          id={`bookings-${plan.id}`}
                          type="number"
                          defaultValue={plan.maxBookingsPerMonth}
                          onChange={(e) => {
                            const updatedPlan = { ...plan, maxBookingsPerMonth: parseInt(e.target.value) };
                            updatePricingMutation.mutate(updatedPlan);
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}