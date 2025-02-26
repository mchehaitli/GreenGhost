import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import WaitlistAnalytics from "@/components/WaitlistAnalytics";
import WaitlistMapView from "@/components/WaitlistMapView";

import {
  User,
  Settings,
  Mail,
  Edit,
  Trash,
  Plus,
  FileText,
  Database,
  BarChart,
  MapPin,
  FileSpreadsheet,
  Eye,
  Layout,
  FileBox,
  Radio,
  ExternalLink,
  Camera,
} from "lucide-react";

// Types
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
  id: z.number(),
  email: z.string().email("Invalid email address"),
  name: z.string().nullable(),
  phone_number: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
  zip_code: z.string().min(5, "Zip code must be at least 5 characters"),
});

type EditFormData = z.infer<typeof editFormSchema>;

const emailTemplateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  html_content: z.string().min(10, "Content must be at least 10 characters"),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

type SelectEmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
};

export default function AdminPortal() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("waitlist");
  const [editMode, setEditMode] = useState(false);
  const [templateEditMode, setTemplateEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SelectEmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'verification' | 'welcome' | null>(null);
  const [previewEmail, setPreviewEmail] = useState("user@example.com");

  // Waitlist data query
  const {
    data: waitlistEntries = [],
    isLoading: waitlistLoading,
    error: waitlistError,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['/api/waitlist'],
    enabled: activeTab === "waitlist",
  });

  // Email templates query
  const {
    data: emailTemplates = [],
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery<SelectEmailTemplate[]>({
    queryKey: ['/api/email-templates'],
    enabled: activeTab === "email-templates",
  });

  // Form for editing waitlist entries
  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      id: 0,
      email: "",
      name: "",
      phone_number: "",
      address: "",
      notes: "",
      zip_code: "",
    },
  });

  // Form for email templates
  const templateForm = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      html_content: "",
    },
  });

  // Email template preview query
  const {
    data: previewHtml,
    isLoading: previewLoading,
  } = useQuery({
    queryKey: ['/api/email-templates/preview', previewMode, previewEmail],
    queryFn: async () => {
      if (!previewMode) return null;
      const response = await fetch(`/api/email-templates/preview?type=${previewMode}&email=${encodeURIComponent(previewEmail)}`);
      return response.text();
    },
    enabled: !!previewMode,
  });

  // Mutations
  const updateWaitlistMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      return apiRequest(`/api/waitlist/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waitlist'] });
      setEditMode(false);
      toast({
        title: "Waitlist entry updated",
        description: "The waitlist entry has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWaitlistMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/waitlist/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waitlist'] });
      toast({
        title: "Waitlist entry deleted",
        description: "The waitlist entry has been successfully deleted.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createEmailTemplateMutation = useMutation({
    mutationFn: async (data: EmailTemplateFormData) => {
      return apiRequest('/api/email-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      templateForm.reset();
      setTemplateEditMode(false);
      toast({
        title: "Email template created",
        description: "The email template has been successfully created.",
        variant: "default",
      });
    },
  });

  const updateEmailTemplateMutation = useMutation({
    mutationFn: async (data: EmailTemplateFormData) => {
      return apiRequest(`/api/email-templates/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      templateForm.reset();
      setTemplateEditMode(false);
      setSelectedTemplate(null);
      toast({
        title: "Email template updated",
        description: "The email template has been successfully updated.",
        variant: "default",
      });
    },
  });

  const deleteEmailTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      setDeleteConfirm(false);
      setSelectedTemplate(null);
      toast({
        title: "Email template deleted",
        description: "The email template has been successfully deleted.",
        variant: "default",
      });
    },
  });

  // Handle waitlist entry editing
  const handleEditWaitlist = (entry: WaitlistEntry) => {
    editForm.reset({
      id: entry.id,
      email: entry.email,
      name: entry.name || "",
      phone_number: entry.phone_number || "",
      address: entry.address || "",
      notes: entry.notes || "",
      zip_code: entry.zip_code,
    });
    setEditMode(true);
  };

  // Handle waitlist entry deletion
  const handleDeleteWaitlist = (id: number) => {
    deleteWaitlistMutation.mutate(id);
  };

  // Handle waitlist form submission
  const onWaitlistSubmit = (data: EditFormData) => {
    updateWaitlistMutation.mutate(data);
  };

  // Handle email template editing
  const handleEdit = (template: SelectEmailTemplate) => {
    templateForm.reset({
      id: template.id,
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
    });
    setSelectedTemplate(template);
    setTemplateEditMode(true);
  };

  // Handle email template deletion
  const handleDelete = async (template: SelectEmailTemplate) => {
    setSelectedTemplate(template);
    setDeleteConfirm(true);
  };

  // Handle email template form submission
  const handleSubmit = async (data: EmailTemplateFormData) => {
    if (data.id) {
      updateEmailTemplateMutation.mutate(data);
    } else {
      createEmailTemplateMutation.mutate(data);
    }
  };

  // Data table columns for waitlist
  const waitlistColumns = [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <span>{row.original.name || "—"}</span>
      ),
    },
    {
      accessorKey: "zip_code",
      header: "Zip Code",
    },
    {
      accessorKey: "created_at",
      header: "Joined On",
      cell: ({ row }: any) => (
        <span>{new Date(row.original.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleEditWaitlist(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleDeleteWaitlist(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Loading state
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Logout</Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="waitlist">
            <Database className="w-4 h-4 mr-2" /> Waitlist
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="w-4 h-4 mr-2" /> Email Templates
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" /> AI Content
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Waitlist Management Tab */}
        <TabsContent value="waitlist">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Entries</CardTitle>
                <CardDescription>View and manage users who have joined the waitlist</CardDescription>
              </CardHeader>
              <CardContent>
                {waitlistLoading ? (
                  <div className="flex justify-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : waitlistError ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500">Error loading waitlist data</p>
                  </div>
                ) : (
                  <DataTable columns={waitlistColumns} data={waitlistEntries} />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" /> Analytics
                  </CardTitle>
                  <CardDescription>Waitlist signup metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {waitlistEntries.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground">
                      No data available yet
                    </div>
                  ) : (
                    <WaitlistAnalytics entries={waitlistEntries} />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Geographic Distribution
                  </CardTitle>
                  <CardDescription>Waitlist signups by location</CardDescription>
                </CardHeader>
                <CardContent>
                  {waitlistEntries.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground">
                      No data available yet
                    </div>
                  ) : (
                    <WaitlistMapView entries={waitlistEntries} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="email-templates">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Manage templates used for customer communications</CardDescription>
                </div>
                <Button onClick={() => {
                  templateForm.reset({
                    name: "",
                    subject: "",
                    html_content: "",
                  });
                  setSelectedTemplate(null);
                  setTemplateEditMode(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> New Template
                </Button>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="flex justify-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : templatesError ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500">Error loading email templates</p>
                  </div>
                ) : emailTemplates.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No templates yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create your first email template to get started
                    </p>
                    <Button onClick={() => {
                      templateForm.reset({
                        name: "",
                        subject: "",
                        html_content: "",
                      });
                      setSelectedTemplate(null);
                      setTemplateEditMode(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg divide-y">
                      {emailTemplates.map((template) => (
                        <div key={template.id} className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              const win = window.open("", "_blank");
                              if (win) {
                                win.document.write(template.html_content);
                                win.document.close();
                              }
                            }}>
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(template)}>
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>Preview system email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <FormLabel htmlFor="preview-email">Test Email Address</FormLabel>
                      <div className="flex gap-2 mt-2">
                        <Input 
                          id="preview-email"
                          placeholder="user@example.com" 
                          value={previewEmail}
                          onChange={(e) => setPreviewEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:self-end">
                      <Button 
                        variant={previewMode === 'verification' ? "default" : "outline"}
                        onClick={() => setPreviewMode('verification')}
                      >
                        <Radio className="h-4 w-4 mr-2" /> Verification
                      </Button>
                      <Button 
                        variant={previewMode === 'welcome' ? "default" : "outline"}
                        onClick={() => setPreviewMode('welcome')}
                      >
                        <Radio className="h-4 w-4 mr-2" /> Welcome
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 min-h-40 mt-2">
                    {previewLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <LoadingSpinner />
                      </div>
                    ) : previewMode ? (
                      <div 
                        className="preview-html h-[400px] overflow-auto" 
                        dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                      ></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Mail className="h-10 w-10 mb-2" />
                        <p>Select a template type to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Template Edit Dialog */}
          <Dialog open={templateEditMode} onOpenChange={setTemplateEditMode}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? "Edit Email Template" : "Create Email Template"}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate
                    ? "Make changes to the email template below."
                    : "Create a new email template for customer communications."}
                </DialogDescription>
              </DialogHeader>
              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit(handleSubmit)} className="space-y-6">
                  {selectedTemplate && (
                    <FormField
                      control={templateForm.control}
                      name="id"
                      render={({ field }) => (
                        <input type="hidden" {...field} value={selectedTemplate.id} />
                      )}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={templateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={templateForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome to GreenGhost Tech!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={templateForm.control}
                    name="html_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Content (HTML)</FormLabel>
                        <FormControl>
                          <Textarea className="font-mono h-[300px]" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the HTML content of your email template. You can use variables like
                          {" "}<code className="text-xs bg-muted p-1 rounded">{"{{name}}"}</code>
                          {" "}and{" "}<code className="text-xs bg-muted p-1 rounded">{"{{email}}"}</code>.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setTemplateEditMode(false)}>Cancel</Button>
                    <Button type="submit" disabled={createEmailTemplateMutation.isPending || updateEmailTemplateMutation.isPending}>
                      {(createEmailTemplateMutation.isPending || updateEmailTemplateMutation.isPending) && (
                        <LoadingSpinner size="sm" className="mr-2" />
                      )}
                      {selectedTemplate ? "Update Template" : "Create Template"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Waitlist Edit Dialog */}
          <Dialog open={editMode} onOpenChange={setEditMode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Waitlist Entry</DialogTitle>
                <DialogDescription>
                  Make changes to the waitlist entry below.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onWaitlistSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="id"
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Textarea rows={3} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setEditMode(false)}>Cancel</Button>
                    <Button type="submit" disabled={updateWaitlistMutation.isPending}>
                      {updateWaitlistMutation.isPending && (
                        <LoadingSpinner size="sm" className="mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the email template "{selectedTemplate?.name}".
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    if (selectedTemplate) {
                      deleteEmailTemplateMutation.mutate(selectedTemplate.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteEmailTemplateMutation.isPending && (
                    <LoadingSpinner size="sm" className="mr-2" />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* AI Content Tab */}
        <TabsContent value="content">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Review Content</CardTitle>
                <CardDescription>Access AI-readable documentation for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-start">
                    <FileText className="h-10 w-10 text-primary mr-4" />
                    <div>
                      <h3 className="font-medium mb-1">AI Review Page</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comprehensive documentation about the GreenGhost Tech platform in a format that's accessible to AI systems.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/admin/ai-review" target="_blank">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/admin/ai-review" target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Capture Tool</CardTitle>
                <CardDescription>Capture website content for AI analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-start">
                    <Camera className="h-10 w-10 text-primary mr-4" />
                    <div>
                      <h3 className="font-medium mb-1">Content Capture</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Visit all pages of the website and capture content for AI-readability and analysis.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/admin/capture" target="_blank">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/admin/capture" target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Content Documentation</CardTitle>
                <CardDescription>Resources for AI content management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col items-center text-center">
                      <Layout className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">AI Review Structure</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Learn about the organization of the AI review page
                      </p>
                      <Button variant="outline" size="sm">View Documentation</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col items-center text-center">
                      <FileBox className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Content Templates</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Standard formats for AI-readable content
                      </p>
                      <Button variant="outline" size="sm">View Templates</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-col items-center text-center">
                      <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Export Data</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Export platform data in machine-readable formats
                      </p>
                      <Button variant="outline" size="sm">Export Options</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Manage your account and platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account</h3>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel>Username</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input value={user?.username} disabled />
                      <Button variant="outline" disabled>Change</Button>
                    </div>
                  </div>
                  <div>
                    <FormLabel>Password</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input type="password" value="••••••••" disabled />
                      <Button variant="outline" disabled>Change</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <Separator />
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for new waitlist signups
                      </p>
                    </div>
                    <Button variant="outline" disabled>Configure</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Access</h3>
                <Separator />
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    API access is currently disabled for this account.
                    Contact support to enable API access for your account.
                  </p>
                  <Button variant="outline" disabled>Request API Access</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}