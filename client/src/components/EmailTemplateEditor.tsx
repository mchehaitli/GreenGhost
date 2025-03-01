import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { EmailTemplateCustomizer } from './EmailTemplateCustomizer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  html_content: z.string().min(1, "Email content is required"),
  styles: z.object({
    primaryColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    fontSize: z.number(),
    spacing: z.number(),
    alignment: z.enum(['left', 'center', 'right']),
    layout: z.enum(['single-column', 'two-column']),
  }).optional(),
});

type FormData = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateEditorProps {
  initialData?: {
    id?: number;
    name: string;
    subject: string;
    html_content: string;
    styles?: FormData['styles'];
  };
  onSave: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export function EmailTemplateEditor({
  initialData,
  onSave,
  isLoading = false,
}: EmailTemplateEditorProps) {
  const { toast } = useToast();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      ...initialData,
      styles: initialData?.styles || {
        primaryColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#374151',
        fontSize: 16,
        spacing: 20,
        alignment: 'left',
        layout: 'single-column',
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await onSave(data);
      toast({
        title: "Success",
        description: `Template ${initialData ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      const styles = form.watch('styles');
      const content = form.watch('html_content');

      // Apply styles to content
      const styledContent = `
        <div style="
          background-color: ${styles?.backgroundColor};
          color: ${styles?.textColor};
          font-size: ${styles?.fontSize}px;
          padding: ${styles?.spacing}px;
          text-align: ${styles?.alignment};
          max-width: ${styles?.layout === 'single-column' ? '600px' : '800px'};
          margin: 0 auto;
        ">
          <div style="
            ${styles?.layout === 'two-column' ? 'column-count: 2; column-gap: 40px;' : ''}
          ">
            ${content.replace(
              /{(\w+)}/g,
              (match, key) => `<span style="color: ${styles?.primaryColor}">{${key}}</span>`
            )}
          </div>
        </div>
      `;

      const response = await fetch('/api/email/preview/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'preview@example.com',
          template: styledContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LoadingOverlay isLoading={isLoading} text="Loading template..." />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Template Name" />
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
                    <Input {...field} placeholder="Email Subject" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="html_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTML Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="HTML Content"
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={previewLoading}
              >
                {previewLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  'Preview'
                )}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="styles"
              render={({ field }) => (
                <EmailTemplateCustomizer
                  initialStyles={field.value}
                  onStyleChange={(newStyles) => {
                    field.onChange(newStyles);
                    // Trigger preview update when styles change
                    handlePreview();
                  }}
                />
              )}
            />

            {previewHtml && (
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}