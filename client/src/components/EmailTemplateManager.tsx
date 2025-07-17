import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Send, Eye, Trash2, Copy, Calendar, Users, Mail, BarChart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { EmailCampaignManager } from './EmailCampaignManager';
import { AdvancedEmailEditor } from './AdvancedEmailEditor';

const EMAIL_ALIASES = {
  'noreply@greenghost.io': 'Marketing & Newsletters',
  'welcome@greenghost.io': 'Welcome Messages',
  'verify@greenghost.io': 'Verification Emails',
  'support@greenghost.io': 'Support & Admin',
  'contact@greenghost.io': 'General Contact'
};

const RECIPIENT_TYPES = {
  'all': 'All Waitlist Members',
  'waitlist': 'Waitlist Members Only',
  'custom': 'Custom Selection'
};

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().min(1, 'Email content is required'),
  from_email: z.string().email('Valid email required'),
  recipient_type: z.enum(['all', 'waitlist', 'custom']),
  recipient_filter: z.string().optional(),
  is_active: z.boolean().default(true)
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EmailTemplate {
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
}

interface EmailTemplateManagerProps {
  templates: EmailTemplate[];
  onTemplateSelect?: (template: EmailTemplate) => void;
}

export function EmailTemplateManager({ templates, onTemplateSelect }: EmailTemplateManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [previewContent, setPreviewContent] = useState('');
  const [campaignTemplate, setCampaignTemplate] = useState<EmailTemplate | null>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      subject: '',
      html_content: '',
      from_email: 'noreply@greenghost.io',
      recipient_type: 'custom',
      recipient_filter: '',
      is_active: true
    }
  });

  // Fetch templates
  const { data: allTemplates, isLoading } = useQuery({
    queryKey: ['/api/email-templates'],
    staleTime: 5 * 60 * 1000
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({ title: 'Template created successfully' });
      setIsEditing(false);
      form.reset();
    }
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TemplateFormData }) => {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({ title: 'Template updated successfully' });
      setIsEditing(false);
      setSelectedTemplate(null);
      form.reset();
    }
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({ title: 'Template deleted successfully' });
    }
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async ({ templateId, testEmail }: { templateId: number; testEmail: string }) => {
      const response = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, testEmail })
      });
      if (!response.ok) throw new Error('Failed to send test email');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Test email sent successfully' });
    }
  });

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      from_email: template.from_email,
      recipient_type: template.recipient_type as 'all' | 'waitlist' | 'custom',
      recipient_filter: template.recipient_filter || '',
      is_active: template.is_active
    });
    setIsEditing(true);
  };

  const handleSubmit = (data: TemplateFormData) => {
    if (selectedTemplate) {
      updateTemplate.mutate({ id: selectedTemplate.id, data });
    } else {
      createTemplate.mutate(data);
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
  };

  const customTemplates = allTemplates?.filter((t: EmailTemplate) => t.template_type === 'custom') || [];
  const systemTemplates = allTemplates?.filter((t: EmailTemplate) => t.template_type === 'system') || [];

  // If campaign template is selected, show campaign manager
  if (campaignTemplate) {
    return (
      <EmailCampaignManager 
        selectedTemplate={campaignTemplate}
        onBack={() => setCampaignTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Create and manage email templates for your campaigns</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* System Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-3">System Templates</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemTemplates.map((template) => (
                <Card key={template.id} className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">System</Badge>
                    </div>
                    <CardDescription className="text-xs">{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        {template.from_email}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePreview(template.html_content)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Custom Templates</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                      <div className="flex gap-1">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Custom</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        {template.from_email}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {RECIPIENT_TYPES[template.recipient_type as keyof typeof RECIPIENT_TYPES]}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePreview(template.html_content)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setCampaignTemplate(template)}>
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteTemplate.mutate(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Campaigns</h3>
            <p className="text-muted-foreground">Campaign management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Analytics</h3>
            <p className="text-muted-foreground">Analytics dashboard coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select email address" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(EMAIL_ALIASES).map(([email, description]) => (
                            <SelectItem key={email} value={email}>
                              <div className="flex flex-col">
                                <span className="font-medium">{email}</span>
                                <span className="text-xs text-muted-foreground">{description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipient_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipients</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipients" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(RECIPIENT_TYPES).map(([type, description]) => (
                            <SelectItem key={type} value={type}>
                              {description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="html_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <AdvancedEmailEditor 
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Create your email content with rich formatting..."
                        height="500px"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Active Template
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                >
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handlePreview(form.getValues('html_content'))}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent('')}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 border rounded-lg overflow-hidden">
            <iframe 
              srcDoc={previewContent}
              className="w-full h-full"
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}