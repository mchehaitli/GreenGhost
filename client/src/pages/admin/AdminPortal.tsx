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
import { User, Settings, DollarSign, UserPlus } from 'lucide-react';

type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
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
};

export default function AdminPortal() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist-entries");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

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
    enabled: activeTab === "waitlist-entries" && !!user, // Changed key
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
            <h2 className="text-xl font-semibold mb-4">Waitlist Entries</h2>
            <p className="text-muted-foreground">Ready for your customization requirements.</p>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          {templatesLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Email Templates</h2>
              <div className="border rounded-lg divide-y">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="p-4">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
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