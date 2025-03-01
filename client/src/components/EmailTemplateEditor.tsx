import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Eye } from 'lucide-react';
import { EmailTemplateCustomizer } from './EmailTemplateCustomizer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

// Sample data for preview
const SAMPLE_DATA = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  verificationCode: '123456',
  city: 'Austin',
  state: 'TX',
};

export function EmailTemplateEditor({
  initialData,
  onSave,
  isLoading = false,
}: EmailTemplateEditorProps) {
  const { toast } = useToast();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

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

  const generatePreview = async (content: string, styles: FormData['styles']) => {
    try {
      setPreviewLoading(true);

      // Apply variable substitutions
      let processedContent = content;
      Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });

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
            ${processedContent.replace(
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
          email: SAMPLE_DATA.email,
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

  // Watch for changes in content and styles
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('styles.') || name === 'html_content') {
        generatePreview(value.html_content || '', value.styles);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LoadingOverlay isLoading={isLoading} text="Loading template..." />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-4 flex-1">
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
            </div>
            <div className="ml-4">
              <Button
                type="button"
                variant={activeView === "preview" ? "default" : "outline"}
                onClick={() => setActiveView(activeView === "edit" ? "preview" : "edit")}
                className="w-[120px]"
              >
                {activeView === "edit" ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={activeView === "edit" ? "block" : "hidden lg:block"}>
              <Card className="p-4">
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
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground mt-2">
                        Available variables: {Object.keys(SAMPLE_DATA).map(key => `{${key}}`).join(', ')}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="styles"
                  render={({ field }) => (
                    <div className="mt-6">
                      <EmailTemplateCustomizer
                        initialStyles={field.value}
                        onStyleChange={(newStyles) => {
                          field.onChange(newStyles);
                        }}
                      />
                    </div>
                  )}
                />
              </Card>
            </div>

            <div className={activeView === "preview" ? "block" : "hidden lg:block"}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  {previewLoading && (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  )}
                </div>
                <ScrollArea className="h-[600px] rounded-md border">
                  <div className="p-4">
                    {previewHtml ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Start editing to see the preview
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
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
      </form>
    </Form>
  );
}