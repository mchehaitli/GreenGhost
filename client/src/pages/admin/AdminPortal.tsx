import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User } from 'lucide-react';

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

export default function AdminPortal() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist");

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
          <p className="text-muted-foreground mt-1">Manage your platform content and user data</p>
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
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist">
          {waitlistLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Waitlist Entries</h2>
              <div className="border rounded-lg divide-y">
                {waitlistEntries.map((entry) => (
                  <div key={entry.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{entry.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      </Tabs>
    </div>
  );
}