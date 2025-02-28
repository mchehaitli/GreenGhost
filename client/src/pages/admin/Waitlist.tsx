import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, LogOut, Pencil, Trash2, Users, Mail } from "lucide-react";
import * as XLSX from 'xlsx';
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WaitlistEntry = {
  id: number;
  email: string;
  name: string | null;
  phone_number: string | null;
  address: string | null;
  notes: string | null;
  zip_code: string;
  created_at: string;
};

const editFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

const EmailPreviewTab = () => {
  const [previewType, setPreviewType] = useState<'verification' | 'welcome'>('verification');
  const [previewHtml, setPreviewHtml] = useState('');
  const { toast } = useToast();

  const emailPreviewForm = useForm({
    defaultValues: {
      email: '',
    },
  });

  const generatePreview = async (values: { email: string }) => {
    try {
      const response = await fetch(`/api/email/preview/${previewType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email || 'test@example.com' }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      toast({
        title: "Preview generation failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    }
  };

  const sendTestEmail = async (values: { email: string }) => {
    if (!values.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address for testing",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/email/test/${previewType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) throw new Error('Failed to send test email');

      toast({
        title: "Test email sent",
        description: `${previewType} email sent to ${values.email}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send test email",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Template Preview</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={previewType === 'verification' ? 'default' : 'outline'}
              onClick={() => setPreviewType('verification')}
            >
              Verification Email
            </Button>
            <Button
              variant={previewType === 'welcome' ? 'default' : 'outline'}
              onClick={() => setPreviewType('welcome')}
            >
              Welcome Email
            </Button>
          </div>

          <Form {...emailPreviewForm}>
            <form onSubmit={emailPreviewForm.handleSubmit(generatePreview)} className="space-y-4">
              <FormField
                control={emailPreviewForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter test email address"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit">
                  Generate Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => emailPreviewForm.handleSubmit(sendTestEmail)()}
                >
                  Send Test Email
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "Email content is required"),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
type SelectEmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
};

const EmailTemplateTab = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<SelectEmailTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<SelectEmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const response = await fetch("/api/email-templates", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
  });

  const queryClient = useQueryClient();

  const templateForm = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: EmailTemplateFormData) => {
      const response = await fetch("/api/email-templates", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setShowTemplateDialog(false);
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: EmailTemplateFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/email-templates/${id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setShowTemplateDialog(false);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to delete template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const sendEmailsMutation = useMutation({
    mutationFn: async ({ templateId, zipCodes }: { templateId: number; zipCodes: string[] }) => {
      const response = await fetch(`/api/email-templates/${templateId}/send`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_codes: zipCodes }),
      });
      if (!response.ok) throw new Error("Failed to send emails");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Sent email to ${data.total_sent} recipients`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (template: SelectEmailTemplate) => {
    setSelectedTemplate(template);
    templateForm.reset({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
    });
    setShowTemplateDialog(true);
  };

  const handleDelete = async (template: SelectEmailTemplate) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplateMutation.mutateAsync(template.id);
    }
  };

  const handleSubmit = async (data: EmailTemplateFormData) => {
    if (selectedTemplate) {
      await updateTemplateMutation.mutateAsync({ ...data, id: selectedTemplate.id });
    } else {
      await createTemplateMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Button onClick={() => {
          setSelectedTemplate(null);
          templateForm.reset({
            name: "",
            subject: "",
            html_content: "",
          });
          setShowTemplateDialog(true);
        }}>
          Create Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{template.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Subject: {template.subject}</p>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      const zipCodes = prompt("Enter comma-separated ZIP codes (leave empty for all):");
                      if (zipCodes !== null) {
                        const zipCodeArray = zipCodes.split(",")
                          .map(zip => zip.trim())
                          .filter(zip => zip.length === 5);
                        sendEmailsMutation.mutate({
                          templateId: template.id,
                          zipCodes: zipCodeArray,
                        });
                      }
                    }}
                  >
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="html_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content (HTML)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={10}
                        className="font-mono"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {selectedTemplate ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const WaitlistPage = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
  });

  const { data: entries = [], isLoading: dataLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist", {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized access to waitlist data');
          return [];
        }
        throw new Error("Failed to fetch waitlist");
      }
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
    gcTime: Infinity,
  });

  const stats = useMemo(() => {
    const now = new Date();
    const oneDayAgo = subDays(now, 1);
    const oneWeekAgo = startOfWeek(now);
    const oneMonthAgo = startOfMonth(now);

    const dailySignups = entries.filter(entry =>
      new Date(entry.created_at) > oneDayAgo
    ).length;

    const weeklySignups = entries.filter(entry =>
      new Date(entry.created_at) > oneWeekAgo
    ).length;

    const monthlySignups = entries.filter(entry =>
      new Date(entry.created_at) > oneMonthAgo
    ).length;

    const zipCodeStats = entries.reduce((acc, entry) => {
      acc[entry.zip_code] = (acc[entry.zip_code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedZipCodes = Object.entries(zipCodeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      daily: dailySignups,
      weekly: weeklySignups,
      monthly: monthlySignups,
      zipCodes: sortedZipCodes,
    };
  }, [entries]);

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      toast({
        title: "Entry deleted",
        description: "The waitlist entry has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete entry",
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (data: EditFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setEditingEntry(null);
      toast({
        title: "Entry updated",
        description: "The waitlist entry has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update entry",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<WaitlistEntry>[] = [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "zip_code",
      header: "ZIP Code",
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return format(date, "PPpp"); // This format will show date and time in a detailed format
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingEntry(row.original);
                editForm.reset({
                  email: row.original.email,
                  name: row.original.name || "",
                  phone_number: row.original.phone_number || "",
                  address: row.original.address || "",
                  notes: row.original.notes || "",
                });
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this entry?")) {
                  deleteEntryMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const exportToExcel = () => {
    const exportData = entries.map(entry => ({
      Email: entry.email,
      Name: entry.name || '',
      'Phone Number': entry.phone_number || '',
      Address: entry.address || '',
      'ZIP Code': entry.zip_code,
      Notes: entry.notes || '',
      'Signup Date': format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm:ss a")
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    XLSX.utils.book_append_sheet(wb, ws, "Waitlist Entries");
    XLSX.writeFile(wb, `waitlist-entries-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Waitlist Management</h1>
          <p className="text-muted-foreground">
            Manage waitlist signups and email templates
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Waitlist Entries
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Preview Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Signups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.daily}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Weekly Signups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weekly}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Signups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthly}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top ZIP Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.zipCodes.map(([zipCode, count]) => (
                  <div key={zipCode} className="flex items-center justify-between">
                    <span className="font-medium">{zipCode}</span>
                    <span className="text-muted-foreground">{count} signups</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Waitlist Entries</h2>
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
            <DataTable columns={columns} data={entries} />
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateTab />
        </TabsContent>
        <TabsContent value="preview">
          <EmailPreviewTab />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Waitlist Entry</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) => {
                if (!editingEntry) return;
                updateEntryMutation.mutate({ ...data, id: editingEntry.id });
              })}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateEntryMutation.isPending}
                >
                  {updateEntryMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitlistPage;