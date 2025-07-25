import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Send, 
  Mail, 
  Users, 
  BarChart3, 
  History, 
  Settings, 
  Plus,
  Filter,
  Download,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "Email content is required"),
  from_email: z.string().email("Valid email address required"),
  recipient_type: z.string().min(1, "Recipient type is required"),
  recipient_filter: z.string().optional(),
  is_active: z.boolean().default(true)
});

// Schema for system templates (only requires name, subject, html_content)
const systemTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "Email content is required"),
  from_email: z.string().optional(),
  recipient_type: z.string().optional(),
  recipient_filter: z.string().optional(),
  is_active: z.boolean().default(true)
});

const visualEditorSchema = z.object({
  headerText: z.string().min(1, "Header text is required"),
  bodyText: z.string().min(1, "Body text is required"),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  footerText: z.string().optional(),
  backgroundColor: z.string().default("#ffffff"),
  textColor: z.string().default("#333333"),
  accentColor: z.string().default("#16a34a"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  fontFamily: z.enum(["arial", "georgia", "helvetica", "times"]).default("arial")
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
type VisualEditorData = z.infer<typeof visualEditorSchema>;

type SelectEmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  from_email: string;
  recipient_type: string;
  recipient_filter?: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EmailHistoryEntry = {
  id: number;
  template_name: string;
  sent_at: string;
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
};

const EMAIL_ALIASES = {
  'noreply@greenghost.io': 'Marketing & Newsletters',
  'welcome@greenghost.io': 'Welcome Messages',
  'verify@greenghost.io': 'Verification Emails',
  'support@greenghost.io': 'Customer Support',
  'billing@greenghost.io': 'Billing & Payments',
  'admin@greenghost.io': 'Admin Notifications'
};

const RECIPIENT_TYPES = {
  'waitlist': 'All Waitlist Members',
  'recent': 'Recently Joined (Last 30 Days)',
  'prospects': 'Potential Customers',
  'custom': 'Custom Selection'
};

export function EmailTemplateTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<SelectEmailTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('system');
  const [editingMode, setEditingMode] = useState<'visual' | 'html'>('visual');
  const [showCampaignManager, setShowCampaignManager] = useState(false);
  const [selectedCampaignTemplate, setSelectedCampaignTemplate] = useState<SelectEmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecipientType, setSelectedRecipientType] = useState('waitlist');
  const [selectedCustomRecipients, setSelectedCustomRecipients] = useState<string[]>([]);
  const [showCustomRecipients, setShowCustomRecipients] = useState(false);
  const [prospectEmails, setProspectEmails] = useState<string[]>([]);
  const [newProspectEmail, setNewProspectEmail] = useState('');
  const [campaignFromEmail, setCampaignFromEmail] = useState('');
  const [campaignSettings, setCampaignSettings] = useState<{[key: string]: {
    fromEmail: string;
    prospectEmails: string[];
    selectedRecipientType: string;
    selectedCustomRecipients: string[];
  }}>({});
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<EmailHistoryEntry | null>(null);
  const [showHistoryDetails, setShowHistoryDetails] = useState(false);
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
    defaultValues: {
      name: '',
      subject: '',
      html_content: '',
      from_email: 'noreply@greenghost.io',
      recipient_type: 'waitlist',
      recipient_filter: '',
      is_active: true
    }
  });

  const visualForm = useForm<VisualEditorData>({
    resolver: zodResolver(visualEditorSchema),
    defaultValues: {
      headerText: '',
      bodyText: '',
      buttonText: '',
      buttonLink: '',
      footerText: 'Best regards,\nGreen Ghost Team',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#16a34a',
      fontSize: 'medium',
      fontFamily: 'arial'
    }
  });

  const { data: emailHistory = [], isLoading: historyLoading } = useQuery<EmailHistoryEntry[]>({
    queryKey: ["/api/email-history"],
    queryFn: async () => {
      const response = await fetch("/api/email-history", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch email history");
      return response.json();
    },
  });

  const { data: historyDetails, isLoading: historyDetailsLoading } = useQuery({
    queryKey: ["/api/email-history", selectedHistoryEntry?.id],
    queryFn: async () => {
      if (!selectedHistoryEntry) return null;
      const response = await fetch(`/api/email-history/${selectedHistoryEntry.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch history details");
      return response.json();
    },
    enabled: !!selectedHistoryEntry
  });

  const { data: waitlistData = [] } = useQuery({
    queryKey: ["/api/waitlist"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch waitlist");
      return response.json();
    },
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
      queryClient.invalidateQueries({ queryKey: ["/api/email-history"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive",
      });
    },
  });

  // Separate mutation for system template test emails
  const sendSystemTestEmail = useMutation({
    mutationFn: async ({ templateName, testEmail }: { templateName: string; testEmail: string }) => {
      const templateType = templateName === 'Welcome Email' ? 'welcome' : 'verification';
      const response = await fetch(`/api/email/test/${templateType}`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      if (!response.ok) throw new Error("Failed to send test email");
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Test Email Sent",
        description: `Test ${variables.templateName.toLowerCase()} sent to ${variables.testEmail}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const deleteHistoryEntry = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/email-history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete history entry');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email history entry deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-history"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete history entry",
        variant: "destructive",
      });
    },
  });

  const handleEdit = async (template: SelectEmailTemplate) => {
    try {
      // For system templates (negative IDs), fetch the full template details
      if (template.id < 0) {
        const response = await fetch(`/api/email-templates/${template.id}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch template details');
        }
        const fullTemplate = await response.json();
        setSelectedTemplate(fullTemplate);
        templateForm.reset({
          name: fullTemplate.name,
          subject: fullTemplate.subject,
          html_content: fullTemplate.html_content,
        });
        // Force HTML editor for system templates
        setEditingMode('html');
      } else {
        // Regular templates can be used directly
        setSelectedTemplate(template);
        templateForm.reset({
          name: template.name,
          subject: template.subject,
          html_content: template.html_content,
        });
        setEditingMode('visual');
      }
      setShowTemplateDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load template for editing",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (template: SelectEmailTemplate) => {
    // Prevent deletion of system templates
    if (template.id < 0) {
      toast({
        title: "Cannot Delete",
        description: "System templates (Welcome and Verification emails) cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplateMutation.mutateAsync(template.id);
    }
  };

  const handleSubmit = async (data: EmailTemplateFormData) => {
    console.log('handleSubmit called with data:', data);
    console.log('selectedTemplate:', selectedTemplate);
    
    if (selectedTemplate) {
      console.log('Updating template with ID:', selectedTemplate.id);
      
      // For system templates, only send the fields that should be updated
      if (selectedTemplate.id < 0) {
        const systemData = {
          id: selectedTemplate.id,
          name: data.name,
          subject: data.subject,
          html_content: data.html_content
        };
        console.log('Updating system template with data:', systemData);
        await updateTemplateMutation.mutateAsync(systemData);
      } else {
        await updateTemplateMutation.mutateAsync({ ...data, id: selectedTemplate.id });
      }
    } else {
      console.log('Creating new template');
      await createTemplateMutation.mutateAsync(data);
    }
  };

  const generateHtmlFromVisual = (data: VisualEditorData): string => {
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    const fontFamilyMap = { 
      arial: 'Arial, sans-serif', 
      georgia: 'Georgia, serif', 
      helvetica: 'Helvetica, sans-serif', 
      times: 'Times New Roman, serif' 
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Green Ghost Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: ${fontFamilyMap[data.fontFamily]}; font-size: ${fontSizeMap[data.fontSize]}; line-height: 1.6; color: ${data.textColor}; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: ${data.backgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${data.accentColor} 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        ${data.headerText}
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <div style="margin-bottom: 30px; white-space: pre-line;">
        ${data.bodyText}
      </div>

      ${data.buttonText && data.buttonLink ? `
      <!-- Call to Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.buttonLink}" style="display: inline-block; background: linear-gradient(135deg, ${data.accentColor} 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;"
           onmouseover="this.style.transform='translateY(-2px)'"
           onmouseout="this.style.transform='translateY(0)'">
          ${data.buttonText}
        </a>
      </div>
      ` : ''}

      ${data.footerText ? `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; white-space: pre-line;">
        ${data.footerText}
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        © 2025 Green Ghost. All rights reserved.<br>
        <a href="https://greenghost.io" style="color: ${data.accentColor}; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleVisualSubmit = (visualData: VisualEditorData) => {
    const htmlContent = generateHtmlFromVisual(visualData);
    const templateData: EmailTemplateFormData = {
      ...templateForm.getValues(),
      html_content: htmlContent
    };
    handleSubmit(templateData);
  };

  const saveCampaignSettings = (templateId: string) => {
    setCampaignSettings(prev => ({
      ...prev,
      [templateId]: {
        fromEmail: campaignFromEmail,
        prospectEmails,
        selectedRecipientType,
        selectedCustomRecipients
      }
    }));
  };

  const loadCampaignSettings = (templateId: string) => {
    const settings = campaignSettings[templateId];
    if (settings) {
      setCampaignFromEmail(settings.fromEmail);
      setProspectEmails(settings.prospectEmails);
      setSelectedRecipientType(settings.selectedRecipientType);
      setSelectedCustomRecipients(settings.selectedCustomRecipients);
    } else {
      // Reset to defaults for new template
      setCampaignFromEmail('');
      setProspectEmails([]);
      setSelectedRecipientType('waitlist');
      setSelectedCustomRecipients([]);
    }
  };

  const handleStartCampaign = (template: SelectEmailTemplate) => {
    // Save current settings if there's a selected template
    if (selectedCampaignTemplate) {
      saveCampaignSettings(selectedCampaignTemplate.id.toString());
    }
    
    setSelectedCampaignTemplate(template);
    setShowCampaignManager(true);
    
    // Load settings for the new template
    loadCampaignSettings(template.id.toString());
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'system' && (template.template_type === 'system' || template.name === 'Welcome Email' || template.name === 'Verification Email')) ||
                         (filterType === 'custom' && template.template_type !== 'system' && template.name !== 'Welcome Email' && template.name !== 'Verification Email') ||
                         (filterType === 'active' && template.is_active) ||
                         (filterType === 'inactive' && !template.is_active);
    return matchesSearch && matchesFilter;
  });

  const systemTemplates = filteredTemplates.filter(t => 
    t.name === 'Welcome Email' || t.name === 'Verification Email' || t.template_type === 'system'
  );
  const customTemplates = filteredTemplates.filter(t => 
    t.name !== 'Welcome Email' && t.name !== 'Verification Email' && t.template_type !== 'system'
  );

  if (showCampaignManager && selectedCampaignTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => {
              // Save current campaign settings before going back
              if (selectedCampaignTemplate) {
                saveCampaignSettings(selectedCampaignTemplate.id.toString());
              }
              setShowCampaignManager(false);
            }}>
              ← Back to Templates
            </Button>
          </div>
          <Badge variant="outline">{selectedCampaignTemplate.template_type}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Campaign Manager: {selectedCampaignTemplate.name}
            </CardTitle>
            <CardDescription>
              Send emails to your audience using this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Template Subject</Label>
                  <p className="text-sm text-muted-foreground">{selectedCampaignTemplate.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Send From Email</Label>
                  <Select 
                    value={campaignFromEmail || selectedCampaignTemplate.from_email}
                    onValueChange={setCampaignFromEmail}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EMAIL_ALIASES).map(([email, alias]) => (
                        <SelectItem key={email} value={email}>
                          {alias} ({email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Preview (Actual Size)</h4>
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: 'auto', minHeight: '400px', maxHeight: '800px' }}>
                  <iframe 
                    srcDoc={selectedCampaignTemplate.html_content}
                    className="w-full border-0"
                    style={{ 
                      height: '600px',
                      minHeight: '400px'
                    }}
                    title="Email Preview"
                    scrolling="auto"
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (iframeDoc) {
                          const bodyHeight = iframeDoc.body?.scrollHeight || 600;
                          const adjustedHeight = Math.min(Math.max(bodyHeight + 40, 400), 800);
                          iframe.style.height = `${adjustedHeight}px`;
                        }
                      } catch (error) {
                        // Cross-origin restrictions, keep default height
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Campaign Recipients</h4>
                <p className="text-sm text-muted-foreground">Choose who will receive this email campaign</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Target Audience</label>
                    <Select 
                      value={selectedRecipientType}
                      onValueChange={(value) => {
                        console.log('Recipient type changed to:', value);
                        setSelectedRecipientType(value);
                        setShowCustomRecipients(value === 'custom');
                        if (value !== 'custom') {
                          setSelectedCustomRecipients([]);
                        }
                        console.log('Show custom recipients:', value === 'custom');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RECIPIENT_TYPES).map(([type, label]) => (
                          <SelectItem key={type} value={type}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRecipientType === 'prospects' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Potential Customer Email Addresses</label>
                        <p className="text-xs text-muted-foreground">Add emails for people not yet on your waitlist</p>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        <Input
                          type="email"
                          placeholder="Enter email address..."
                          value={newProspectEmail}
                          onChange={(e) => setNewProspectEmail(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newProspectEmail && newProspectEmail.includes('@') && !prospectEmails.includes(newProspectEmail)) {
                                setProspectEmails([...prospectEmails, newProspectEmail]);
                                setNewProspectEmail('');
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newProspectEmail && newProspectEmail.includes('@') && !prospectEmails.includes(newProspectEmail)) {
                              setProspectEmails([...prospectEmails, newProspectEmail]);
                              setNewProspectEmail('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                        {prospectEmails.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No prospect emails added yet</p>
                        ) : (
                          prospectEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between space-x-2">
                              <span className="text-sm font-medium">{email}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setProspectEmails(prospectEmails.filter((_, i) => i !== index))}
                              >
                                Remove
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                      {prospectEmails.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {prospectEmails.length} prospect email(s) added
                        </p>
                      )}
                    </div>
                  )}

                  {showCustomRecipients && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Select Recipients from Waitlist</label>
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCustomRecipients(waitlistData.map((m: any) => m.email))}
                          >
                            Select All
                          </Button>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCustomRecipients([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                        {waitlistData.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No waitlist members found</p>
                        ) : (
                          waitlistData.map((member: any) => (
                            <div key={member.email} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={member.email}
                                checked={selectedCustomRecipients.includes(member.email)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCustomRecipients([...selectedCustomRecipients, member.email]);
                                  } else {
                                    setSelectedCustomRecipients(selectedCustomRecipients.filter(email => email !== member.email));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={member.email} className="text-sm flex-1 cursor-pointer">
                                <span className="font-medium">{member.email}</span>
                                {member.zip_code && <span className="text-muted-foreground ml-2">({member.zip_code})</span>}
                                {member.is_verified && <span className="text-green-600 ml-2">✓</span>}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                      {selectedCustomRecipients.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedCustomRecipients.length} recipient(s) selected
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium block mb-2">Service Areas (Optional)</label>
                    <Input 
                      placeholder="Enter ZIP codes (e.g., 78701, 78704) or leave blank for all areas"
                      className="w-full"
                      disabled={showCustomRecipients}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {showCustomRecipients ? 
                        "ZIP filtering is disabled when using custom selection" :
                        "Leave empty to send to all areas, or specify ZIP codes to target specific service regions"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (selectedRecipientType === 'prospects') {
                      if (prospectEmails.length === 0) {
                        toast({
                          title: "No Prospect Emails",
                          description: "Please add at least one prospect email address.",
                          variant: "destructive"
                        });
                        return;
                      }
                      // Send to prospect emails
                      sendEmailsMutation.mutate({
                        templateId: selectedCampaignTemplate.id,
                        customRecipients: prospectEmails,
                        fromEmail: campaignFromEmail || selectedCampaignTemplate.from_email,
                      });
                    } else if (selectedRecipientType === 'custom') {
                      if (selectedCustomRecipients.length === 0) {
                        toast({
                          title: "No Recipients Selected",
                          description: "Please select at least one recipient for your custom campaign.",
                          variant: "destructive"
                        });
                        return;
                      }
                      // Send to custom recipients from waitlist
                      sendEmailsMutation.mutate({
                        templateId: selectedCampaignTemplate.id,
                        customRecipients: selectedCustomRecipients,
                        fromEmail: campaignFromEmail || selectedCampaignTemplate.from_email,
                      });
                    } else {
                      // Original ZIP code logic for other recipient types
                      const zipCodes = prompt("Enter comma-separated ZIP codes (leave empty for all service areas):");
                      if (zipCodes !== null) {
                        const zipCodeArray = zipCodes.split(",")
                          .map(zip => zip.trim())
                          .filter(zip => zip.length === 5);
                        sendEmailsMutation.mutate({
                          templateId: selectedCampaignTemplate.id,
                          zipCodes: zipCodeArray,
                          recipientType: selectedRecipientType
                        });
                      }
                    }
                  }}
                  className="flex items-center gap-2"
                  disabled={
                    (selectedRecipientType === 'custom' && selectedCustomRecipients.length === 0) ||
                    (selectedRecipientType === 'prospects' && prospectEmails.length === 0)
                  }
                >
                  <Send className="w-4 h-4" />
                  {selectedRecipientType === 'prospects' 
                    ? `Send to ${prospectEmails.length} Prospects`
                    : selectedRecipientType === 'custom' 
                      ? `Send to ${selectedCustomRecipients.length} Selected`
                      : 'Send to Audience'
                  }
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Management Center</h2>
        <Button onClick={() => {
          setSelectedTemplate(null);
          templateForm.reset();
          visualForm.reset();
          setEditingMode('visual');
          setShowTemplateDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="system">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Templates
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Campaign Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Email History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Templates</h2>
                <p className="text-muted-foreground">
                  Manage automated email templates for user verification and welcome messages
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Protected System Templates</h3>
                  <Badge variant="secondary">Auto-managed</Badge>
                </div>
                <div className="grid gap-4">
                  {systemTemplates.map((template) => (
                    <Card key={template.id} className="border-blue-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2">
                              {template.name === 'Verification Email' && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {template.name === 'Welcome Email' && <Mail className="w-5 h-5 text-blue-500" />}
                              {template.name}
                              <Badge variant="secondary">System</Badge>
                            </CardTitle>
                            <CardDescription>
                              From: {EMAIL_ALIASES[template.from_email] || template.from_email}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit HTML
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const testEmail = prompt("Enter test email address:");
                                if (testEmail && testEmail.includes('@')) {
                                  sendSystemTestEmail.mutate({
                                    templateName: template.name,
                                    testEmail: testEmail
                                  });
                                }
                              }}
                              disabled={sendSystemTestEmail.isPending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {sendSystemTestEmail.isPending ? 'Sending...' : 'Test'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Subject: </span>
                            <span className="text-sm">{template.subject}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Purpose: </span>
                            <span className="text-sm">
                              {template.name === 'Welcome Email' ? 'Sent to new users after email verification' : 'Contains verification code for email confirmation'}
                            </span>
                          </div>
                          <div className="border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: 'auto', minHeight: '200px', maxHeight: '400px' }}>
                            <iframe 
                              srcDoc={template.html_content}
                              className="w-full border-0"
                              style={{ 
                                height: '300px',
                                minHeight: '200px'
                              }}
                              title={`Preview of ${template.name}`}
                              scrolling="auto"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Templates</h2>
                <p className="text-muted-foreground">
                  Create and manage custom email templates for marketing campaigns and newsletters
                </p>
              </div>
              <Button onClick={() => {
                setSelectedTemplate(null);
                templateForm.reset();
                visualForm.reset();
                setEditingMode('visual');
                setShowTemplateDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign Template
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search campaign templates..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Campaign Templates</h3>
                <Badge variant="outline">{customTemplates.length} templates</Badge>
              </div>
              
              {customTemplates.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-medium mb-2">No custom templates yet</h4>
                        <p className="text-muted-foreground mb-4">
                          Create your first email template to start sending campaigns
                        </p>
                        <Button onClick={() => {
                          setSelectedTemplate(null);
                          templateForm.reset();
                          visualForm.reset();
                          setEditingMode('visual');
                          setShowTemplateDialog(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {customTemplates.map((template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <CardTitle className="flex items-center gap-2">
                                {template.name}
                                {template.id < 0 && <Badge variant="secondary" className="text-xs">System</Badge>}
                                {!template.is_active && <Badge variant="destructive">Inactive</Badge>}
                              </CardTitle>
                              <CardDescription>
                                From: {EMAIL_ALIASES[template.from_email] || template.from_email} • 
                                Recipients: {RECIPIENT_TYPES[template.recipient_type] || template.recipient_type}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStartCampaign(template)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Campaign
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              {template.id < 0 ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="text-muted-foreground"
                                  title="System templates cannot be deleted"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelete(template)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Subject: </span>
                              <span className="text-sm">{template.subject}</span>
                            </div>
                            <div className="border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: 'auto', minHeight: '300px', maxHeight: '600px' }}>
                              <iframe 
                                srcDoc={template.html_content}
                                className="w-full border-0"
                                style={{ 
                                  height: '400px',
                                  minHeight: '300px'
                                }}
                                title={`Preview of ${template.name}`}
                                scrolling="auto"
                                onLoad={(e) => {
                                  const iframe = e.target as HTMLIFrameElement;
                                  try {
                                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                    if (iframeDoc) {
                                      const bodyHeight = iframeDoc.body?.scrollHeight || 400;
                                      const adjustedHeight = Math.min(Math.max(bodyHeight + 20, 300), 600);
                                      iframe.style.height = `${adjustedHeight}px`;
                                    }
                                  } catch (error) {
                                    // Cross-origin restrictions, keep default height
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Email Sending History
              </CardTitle>
              <CardDescription>
                Track your email campaigns and delivery statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : emailHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No email history yet</h4>
                  <p className="text-muted-foreground">
                    Email sending activity will appear here once you start sending campaigns
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{entry.template_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sent on {new Date(entry.sent_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-600">{entry.total_recipients} sent</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.sent_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedHistoryEntry(entry);
                              setShowHistoryDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this email history entry for "${entry.template_name}"?`)) {
                                deleteHistoryEntry.mutate(entry.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Total Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {systemTemplates.length} system, {customTemplates.length} custom
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Emails Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {emailHistory.reduce((sum, entry) => sum + entry.successful_sends, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailHistory.length} campaigns
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {emailHistory.length > 0 ? 
                    Math.round((emailHistory.reduce((sum, entry) => sum + entry.successful_sends, 0) / 
                    emailHistory.reduce((sum, entry) => sum + entry.total_recipients, 0)) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Delivery success rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-7xl min-h-[95vh] h-[95vh] max-h-[95vh] overflow-hidden flex flex-col" style={{ height: '95vh' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate ? "Edit Template" : "Create Template"}
              <Badge variant="outline">{editingMode === 'visual' ? 'Visual Editor' : 'HTML Editor'}</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate ? "Edit your email template" : "Create a new email template using our visual editor"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={editingMode} onValueChange={(value) => setEditingMode(value as 'visual' | 'html')} className="flex-1 flex flex-col min-h-0">
            <TabsList className={`grid w-full ${selectedTemplate && selectedTemplate.id < 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {/* Only show Visual Editor for non-system templates */}
              {(!selectedTemplate || selectedTemplate.id >= 0) && (
                <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              )}
              <TabsTrigger value="html">HTML Editor</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4 max-h-[70vh] overflow-y-auto">
              <Form {...visualForm}>
                <form onSubmit={visualForm.handleSubmit(handleVisualSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={templateForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="My Email Template" />
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
                              <Input {...field} placeholder="Welcome to Green Ghost!" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={templateForm.control}
                        name="from_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sender email" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(EMAIL_ALIASES).map(([email, alias]) => (
                                  <SelectItem key={email} value={email}>
                                    {alias} ({email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={templateForm.control}
                        name="recipient_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Category</FormLabel>
                            <FormDescription>
                              What type of recipients is this template designed for?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(RECIPIENT_TYPES).map(([type, label]) => (
                                  <SelectItem key={type} value={type}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Email Content</h4>
                      
                      <FormField
                        control={visualForm.control}
                        name="headerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Welcome to Green Ghost!" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={visualForm.control}
                        name="bodyText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Main Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={4}
                                placeholder="Thank you for joining Green Ghost! We're excited to help you maintain a beautiful, healthy lawn with our automated lawn care services."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={visualForm.control}
                          name="buttonText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Text (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Get Started" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visualForm.control}
                          name="buttonLink"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Link (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://greenghost.io" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={visualForm.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={2}
                                placeholder="Best regards,&#10;Green Ghost Team"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Design Settings</h4>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={visualForm.control}
                          name="fontFamily"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Font Family</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="arial">Arial</SelectItem>
                                  <SelectItem value="georgia">Georgia</SelectItem>
                                  <SelectItem value="helvetica">Helvetica</SelectItem>
                                  <SelectItem value="times">Times New Roman</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visualForm.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Font Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visualForm.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accent Color</FormLabel>
                              <FormControl>
                                <Input {...field} type="color" className="h-10" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={visualForm.control}
                          name="backgroundColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background Color</FormLabel>
                              <FormControl>
                                <Input {...field} type="color" className="h-10" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visualForm.control}
                          name="textColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text Color</FormLabel>
                              <FormControl>
                                <Input {...field} type="color" className="h-10" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Live Preview (Actual Size)</h4>
                      <div className="border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: 'auto', minHeight: '300px', maxHeight: '700px' }}>
                        <iframe 
                          srcDoc={generateHtmlFromVisual(visualForm.watch())}
                          className="w-full border-0"
                          style={{ 
                            height: '500px',
                            minHeight: '300px'
                          }}
                          title="Email Preview"
                          scrolling="auto"
                          onLoad={(e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            try {
                              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                              if (iframeDoc) {
                                const bodyHeight = iframeDoc.body?.scrollHeight || 500;
                                const adjustedHeight = Math.min(Math.max(bodyHeight + 40, 300), 700);
                                iframe.style.height = `${adjustedHeight}px`;
                              }
                            } catch (error) {
                              // Cross-origin restrictions, keep default height
                            }
                          }}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedTemplate ? "Update Template" : "Create Template"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
            </TabsContent>

            <TabsContent value="html" className="space-y-4 flex-1 flex flex-col min-h-0">
              <Form {...templateForm}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  console.log('HTML Form onSubmit triggered');
                  
                  // For system templates, bypass form validation and call handleSubmit directly
                  if (selectedTemplate && selectedTemplate.id < 0) {
                    const formData = templateForm.getValues();
                    console.log('System template: bypassing validation, form data:', formData);
                    handleSubmit(formData);
                  } else {
                    // For regular templates, use normal form validation
                    templateForm.handleSubmit(handleSubmit)(e);
                  }
                }} className="space-y-4 flex-1 flex flex-col">
                  {/* Show simplified form for system templates */}
                  {selectedTemplate && selectedTemplate.id < 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Badge variant="secondary">System Template</Badge>
                          <span className="font-medium">{selectedTemplate.name}</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          This is an automated email template. Only the HTML content can be edited. 
                          Recipients and sender settings are managed automatically by the system.
                        </p>
                      </div>

                      <FormField
                        control={templateForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    /* Regular template form */
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="from_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Email</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sender email" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(EMAIL_ALIASES).map(([email, alias]) => (
                                    <SelectItem key={email} value={email}>
                                      {alias} ({email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={templateForm.control}
                          name="recipient_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipients</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select recipient type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(RECIPIENT_TYPES).map(([type, label]) => (
                                    <SelectItem key={type} value={type}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex-1 grid grid-cols-2 gap-4 min-h-0" style={{ height: '60vh' }}>
                    <div className="space-y-2 flex flex-col">
                      <FormField
                        control={templateForm.control}
                        name="html_content"
                        render={({ field }) => (
                          <FormItem className="flex-1 flex flex-col">
                            <FormLabel>HTML Content</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="font-mono flex-1 resize-none min-h-0"
                                style={{ height: '55vh' }}
                                placeholder="Enter your HTML email content here..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <label className="text-sm font-medium">Live Preview</label>
                      <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex-1" style={{ height: '55vh' }}>
                        <iframe 
                          srcDoc={templateForm.watch('html_content') || '<div style="padding: 20px; text-align: center; color: #6b7280; font-family: Arial, sans-serif;">Start typing HTML to see preview...</div>'}
                          className="w-full h-full border-0"
                          title="HTML Preview"
                          scrolling="auto"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 pt-4 border-t">
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        onClick={(e) => {
                          console.log('HTML Editor Submit button clicked, selectedTemplate:', selectedTemplate);
                          console.log('Form errors:', templateForm.formState.errors);
                          console.log('Form values:', templateForm.getValues());
                        }}
                      >
                        {selectedTemplate ? "Update Template" : "Create Template"}
                      </Button>
                    </DialogFooter>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Email History Details Dialog */}
      <Dialog open={showHistoryDetails} onOpenChange={setShowHistoryDetails}>
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
          <div className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Email Campaign Details
              </DialogTitle>
              <DialogDescription>
                View the complete email that was sent and recipient information
              </DialogDescription>
            </DialogHeader>
          </div>

          {historyDetailsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <LoadingSpinner size="lg" />
            </div>
          ) : historyDetails ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Campaign Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Template Name</Label>
                        <p className="font-medium">{historyDetails.template?.name || 'Unknown Template'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Subject Line</Label>
                        <p className="font-medium">{historyDetails.template?.subject || 'No Subject'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Sent Date</Label>
                        <p className="font-medium">{new Date(historyDetails.sent_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Recipients</Label>
                        <p className="font-medium">{historyDetails.recipient_info.total_count} recipients</p>
                      </div>
                    </div>
                    
                    {historyDetails.recipient_info.zip_codes.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Target ZIP Codes</Label>
                        <p className="font-medium">{historyDetails.recipient_info.zip_codes.join(', ')}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Targeting</Label>
                      <p className="font-medium">
                        {historyDetails.recipient_info.targeting_type === 'zip_code' 
                          ? 'Specific ZIP Codes' 
                          : 'All Waitlist Members'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recipients Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recipients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {historyDetails.recipient_info.recipient_emails && historyDetails.recipient_info.recipient_emails.length > 0 ? (
                          historyDetails.recipient_info.recipient_emails.map((email: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{email}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {historyDetails.recipient_info.targeting_type === 'zip_code' 
                              ? `Sent to ${historyDetails.recipient_info.total_count} recipients in ZIP codes: ${historyDetails.recipient_info.zip_codes.join(', ')}`
                              : `Sent to all ${historyDetails.recipient_info.total_count} waitlist members`}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Email Content Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Email Content Preview</CardTitle>
                    <CardDescription>Full scrollable preview of the sent email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <iframe 
                        srcDoc={historyDetails.template?.html_content || '<div style="padding: 20px; text-align: center; color: #6b7280;">No content available</div>'}
                        className="w-full border-0"
                        style={{ height: '600px', minHeight: '400px' }}
                        title="Email Content Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p className="text-muted-foreground">No details available for this email campaign.</p>
            </div>
          )}

          <div className="flex-shrink-0 p-6 pt-4 border-t">
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHistoryDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};