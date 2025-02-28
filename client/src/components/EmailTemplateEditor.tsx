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

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  html_content: z.string().min(1, "Email content is required"),
});

type FormData = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateEditorProps {
  initialData?: {
    id?: number;
    name: string;
    subject: string;
    html_content: string;
  };
  onSave: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const EmailTemplateEditor = ({
  initialData,
  onSave,
  isLoading = false,
}: EmailTemplateEditorProps) => {
  const { toast } = useToast();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: initialData || {
      name: '',
      subject: '',
      html_content: '',
    }
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
      const response = await fetch('/api/email/preview/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'preview@example.com',
          template: watch('html_content'),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <LoadingOverlay isLoading={isLoading} text="Loading template..." />
      
      <div>
        <Input
          {...register('name')}
          placeholder="Template Name"
          className="mb-1"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('subject')}
          placeholder="Email Subject"
          className="mb-1"
        />
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <Textarea
          {...register('html_content')}
          placeholder="HTML Content"
          rows={10}
          className="font-mono text-sm mb-1"
        />
        {errors.html_content && (
          <p className="text-sm text-destructive">{errors.html_content.message}</p>
        )}
      </div>

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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
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

      {previewHtml && (
        <div className="mt-4 border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </form>
  );
};
