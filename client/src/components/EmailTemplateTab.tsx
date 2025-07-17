import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

export function EmailTemplateTab() {
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
            <DialogDescription>
              {selectedTemplate ? "Edit your email template configuration" : "Create a new custom email template"}
            </DialogDescription>
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