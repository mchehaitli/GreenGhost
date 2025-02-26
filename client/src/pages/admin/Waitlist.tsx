import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { LogOut, Pencil, Trash2, Users, Mail, Terminal, ChevronRight, Download, RefreshCw, Camera, FileText, Check, Archive, ExternalLink } from "lucide-react";
import * as XLSX from 'xlsx';
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo, useRef, useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// Documentation Tab component
const DocumentationTab = () => {
  // States for the capture functionality
  const [routes, setRoutes] = useState<{
    path: string;
    name: string;
    screenshotUrl?: string;
    status: 'pending' | 'captured' | 'failed';
    content?: string;
  }[]>([
    { path: '/', name: 'Home', status: 'pending' },
    { path: '/services', name: 'Services', status: 'pending' },
    { path: '/how-it-works', name: 'How It Works', status: 'pending' },
    { path: '/blog', name: 'Blog', status: 'pending' },
    { path: '/pricing', name: 'Pricing', status: 'pending' },
    { path: '/quote', name: 'Quote', status: 'pending' },
    { path: '/about', name: 'About', status: 'pending' },
    { path: '/waitlist', name: 'Waitlist', status: 'pending' },
    { path: '/theme', name: 'Theme Customization', status: 'pending' },
  ]);
  
  const [capturing, setCapturing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [allCaptured, setAllCaptured] = useState(false);
  const [activeTab, setActiveTab] = useState('capture-status');
  const captureInProgress = useRef(false);
  const { toast } = useToast();

  // Function to extract text from any page
  const extractPageContent = async (path: string): Promise<string | null> => {
    try {
      const response = await fetch(path);
      const html = await response.text();
      
      // Create a DOM parser to extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get main content
      const mainContent = doc.querySelector('main');
      const textContent = mainContent ? mainContent.textContent || '' : doc.body.textContent || '';
      
      // Clean up the text (remove excessive whitespace)
      const cleanedText = textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanedText;
    } catch (error) {
      console.error(`Error extracting content from ${path}:`, error);
      return null;
    }
  };

  // Function to capture screenshots by loading each page in an iframe
  const captureScreenshots = async () => {
    if (captureInProgress.current) return;
    
    captureInProgress.current = true;
    setCapturing(true);
    setAllCaptured(false);
    setCurrentIndex(0);
    
    // Reset all routes to pending
    setRoutes(prevRoutes => 
      prevRoutes.map(route => ({ ...route, status: 'pending', screenshotUrl: undefined, content: undefined }))
    );
    
    // Content capture only - AI Review functionality has been removed
    toast({
      title: "Documentation capture started",
      description: "Capturing content from all website pages"
    });
  };

  // Effect to capture screenshots sequentially
  useEffect(() => {
    if (!capturing || currentIndex < 0 || currentIndex >= routes.length) {
      captureInProgress.current = false;
      return;
    }

    const captureCurrentRoute = async () => {
      try {
        // Update current route status to "capturing"
        setRoutes(prevRoutes => {
          const newRoutes = [...prevRoutes];
          newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'pending' };
          return newRoutes;
        });

        // Create an iframe to load the page
        const iframe = document.createElement('iframe');
        iframe.style.width = '1280px';
        iframe.style.height = '900px';
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);

        // Load the page in the iframe
        const route = routes[currentIndex];
        const fullUrl = window.location.origin + route.path;
        iframe.src = fullUrl;

        // Wait for the iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Add a timeout in case the page fails to load
          setTimeout(resolve, 10000);
        });

        // Wait a bit for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Extract the text content from the current page
          const content = await extractPageContent(route.path);
          
          // Mark as captured
          setRoutes(prevRoutes => {
            const newRoutes = [...prevRoutes];
            newRoutes[currentIndex] = { 
              ...newRoutes[currentIndex], 
              status: 'captured',
              screenshotUrl: fullUrl,
              content: content || undefined
            };
            return newRoutes;
          });
        } catch (error) {
          console.error(`Error capturing screenshot for ${route.name}:`, error);
          
          // Mark as failed
          setRoutes(prevRoutes => {
            const newRoutes = [...prevRoutes];
            newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'failed' };
            return newRoutes;
          });
        } finally {
          // Remove the iframe
          document.body.removeChild(iframe);
        }

        // Move to the next route
        if (currentIndex < routes.length - 1) {
          setCurrentIndex(prevIndex => prevIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
          captureInProgress.current = false;
          toast({
            title: "Documentation complete",
            description: "All pages have been captured and documented"
          });
        }
      } catch (error) {
        console.error('Error in capture process:', error);
        setRoutes(prevRoutes => {
          const newRoutes = [...prevRoutes];
          newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'failed' };
          return newRoutes;
        });
        
        // Move to the next route despite the error
        if (currentIndex < routes.length - 1) {
          setCurrentIndex(prevIndex => prevIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
          captureInProgress.current = false;
        }
      }
    };

    const timer = setTimeout(() => {
      captureCurrentRoute();
    }, 500);

    return () => clearTimeout(timer);
  }, [capturing, currentIndex, routes, toast]);

  // Function to download all content as a single file
  const downloadAllContent = () => {
    // Create a combined text file with content from all pages
    let allContent = "# GreenGhost Tech Website Content\n\n";
    
    routes.forEach(route => {
      if (route.content) {
        allContent += `## ${route.name}\n`;
        allContent += `URL: ${route.path}\n\n`;
        allContent += `${route.content}\n\n`;
        allContent += "---\n\n";
      }
    });
    
    // Create a download link
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenghosttech-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to generate HTML summary
  const downloadHtmlSummary = () => {
    const capturedPages = routes.filter(route => route.status === 'captured');
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenGhost Tech Website Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #166534; border-bottom: 2px solid #166534; padding-bottom: 10px; }
    h2 { color: #166534; margin-top: 30px; }
    .page-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
    .page-header { background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .page-content { padding: 20px; max-height: 300px; overflow: auto; }
    .page-link { display: inline-block; padding: 8px 16px; background-color: #166534; color: white; text-decoration: none; border-radius: 4px; }
    .page-link:hover { background-color: #125a30; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; margin-left: 10px; }
    .status-captured { background-color: #dcfce7; color: #166534; }
    .status-failed { background-color: #fee2e2; color: #b91c1c; }
    .toc { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .toc ul { padding-left: 20px; }
    .summary { margin-bottom: 30px; background-color: #f0fdf4; padding: 20px; border-radius: 8px; }
    .summary-stats { display: flex; gap: 20px; margin-top: 15px; }
    .summary-stat { padding: 10px 15px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; }
    .meta { font-size: 14px; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>GreenGhost Tech Website Documentation</h1>
  
  <div class="summary">
    <h2>Capture Summary</h2>
    <p>Documentation generated on ${new Date().toLocaleString()}</p>
    
    <div class="summary-stats">
      <div class="summary-stat">
        <strong>Total Pages:</strong> ${routes.length}
      </div>
      <div class="summary-stat">
        <strong>Captured:</strong> ${capturedPages.length}
      </div>
      <div class="summary-stat">
        <strong>Failed:</strong> ${routes.filter(route => route.status === 'failed').length}
      </div>
    </div>
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${routes.map(route => `
        <li>
          <a href="#${route.path.replace(/\//g, '-') || 'home'}">${route.name}</a>
          ${route.status === 'captured' ? 
            '<span class="status status-captured">Captured</span>' : 
            route.status === 'failed' ? 
            '<span class="status status-failed">Failed</span>' : ''}
        </li>
      `).join('')}
    </ul>
  </div>`;
  
    // Add page content
    routes.forEach(route => {
      const anchorId = route.path.replace(/\//g, '-') || 'home';
      
      html += `
  <div class="page-card" id="${anchorId}">
    <div class="page-header">
      <h2>${route.name}</h2>
      <a href="${route.path}" target="_blank" class="page-link">View Page</a>
    </div>
    <div class="page-content">
      <p class="meta">Path: ${route.path}</p>
      <p class="meta">Status: ${route.status}</p>
      ${route.content ? `<div>${route.content.substring(0, 500)}${route.content.length > 500 ? '...' : ''}</div>` : ''}
    </div>
  </div>`;
    });
  
    html += `
</body>
</html>`;
  
    // Create download link
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenghosttech-documentation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Website Documentation Tool</h2>
          <p className="text-muted-foreground mt-1">
            Capture and document website pages for content review
          </p>
        </div>
        
        <Button 
          onClick={captureScreenshots} 
          disabled={capturing}
          size="lg"
        >
          {capturing ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> 
              Capturing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" /> 
              Start Capture
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="capture-status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="capture-status">Capture Status</TabsTrigger>
          <TabsTrigger value="download-all" disabled={!allCaptured}>Download All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture-status" className="space-y-4 mt-4">
          {/* Capture Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" /> Capture Status
              </CardTitle>
              <CardDescription>
                Status of website page captures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route, index) => (
                  <div key={route.path} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {route.status === 'pending' && (
                        currentIndex === index && capturing ? 
                        <LoadingSpinner size="sm" className="text-muted-foreground" /> : 
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      )}
                      {route.status === 'captured' && <Check className="h-5 w-5 text-green-500" />}
                      {route.status === 'failed' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                      <span className={currentIndex === index && capturing ? "font-semibold" : ""}>
                        {route.name}
                      </span>
                    </div>
                    
                    {route.status === 'captured' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route.path} target="_blank">
                          Visit <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="download-all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="mr-2 h-5 w-5" /> Download All Content
              </CardTitle>
              <CardDescription>
                Download all captured website content in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">All Content as Text</h3>
                      <p className="text-sm text-muted-foreground">
                        Download all page content as a single text file
                      </p>
                      <Button onClick={downloadAllContent} className="mt-2" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download Text
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">HTML Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a rich HTML documentation with summary
                      </p>
                      <Button onClick={downloadHtmlSummary} className="mt-2" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capture Complete */}
      {allCaptured && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Capture Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  All pages have been visited and documented
                </p>
              </div>
              
              <div className="ml-auto space-x-2">
                <Button variant="outline" onClick={() => setActiveTab('download-all')}>
                  <Archive className="mr-2 h-4 w-4" /> View Downloads
                </Button>
                <Button variant="outline" onClick={captureScreenshots}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Capture Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function WaitlistPage() {
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
        return format(new Date(row.original.created_at), "MMM dd, yyyy HH:mm:ss");
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
      'Signup Date': format(new Date(entry.created_at), "MMM dd, yyyy HH:mm:ss")
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
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
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
        <TabsContent value="documentation">
          <DocumentationTab />
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
}