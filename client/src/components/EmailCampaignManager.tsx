import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const testEmailSchema = z.object({
  testEmail: z.string().email('Valid email required'),
});

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

interface EmailCampaignManagerProps {
  selectedTemplate: EmailTemplate | null;
  onBack: () => void;
}

export function EmailCampaignManager({ selectedTemplate, onBack }: EmailCampaignManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [campaignResults, setCampaignResults] = useState<{
    successCount: number;
    errorCount: number;
    totalRecipients: number;
    errors: string[];
  } | null>(null);

  const testEmailForm = useForm<z.infer<typeof testEmailSchema>>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      testEmail: '',
    }
  });

  // Fetch recipients for selected template
  const { data: recipientsData, isLoading: loadingRecipients } = useQuery({
    queryKey: ['/api/email-templates', selectedTemplate?.id, 'recipients'],
    enabled: !!selectedTemplate,
    staleTime: 5 * 60 * 1000
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async (data: { testEmail: string }) => {
      const response = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate?.id,
          testEmail: data.testEmail
        })
      });
      if (!response.ok) throw new Error('Failed to send test email');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Test email sent successfully' });
      testEmailForm.reset();
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to send test email', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Send campaign mutation
  const sendCampaign = useMutation({
    mutationFn: async () => {
      setIsSending(true);
      setSendingProgress(0);
      
      const response = await fetch(`/api/email-templates/${selectedTemplate?.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to send campaign');
      return response.json();
    },
    onSuccess: (data) => {
      setCampaignResults(data);
      setIsSending(false);
      setSendingProgress(100);
      toast({ 
        title: 'Campaign sent successfully',
        description: `Sent to ${data.successCount} recipients`
      });
    },
    onError: (error) => {
      setIsSending(false);
      setSendingProgress(0);
      toast({ 
        title: 'Failed to send campaign', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleTestEmail = (data: z.infer<typeof testEmailSchema>) => {
    sendTestEmail.mutate(data);
  };

  const handleSendCampaign = () => {
    if (recipientsData?.count === 0) {
      toast({
        title: 'No recipients found',
        description: 'Cannot send campaign without recipients',
        variant: 'destructive'
      });
      return;
    }

    sendCampaign.mutate();
  };

  if (!selectedTemplate) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Template Selected</h3>
        <p className="text-muted-foreground">Select a template to manage campaigns</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack}>
            ← Back to Templates
          </Button>
        </div>
        <Badge variant="outline">{selectedTemplate.template_type}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedTemplate.name}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {selectedTemplate.from_email}
              </span>
              <span>Subject: {selectedTemplate.subject}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recipients Section */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recipients
              </h4>
              
              {loadingRecipients ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading recipients...
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {recipientsData?.count || 0} recipients
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Target: {selectedTemplate.recipient_type === 'all' ? 'All users' : 
                              selectedTemplate.recipient_type === 'waitlist' ? 'Waitlist members' : 
                              'Custom selection'}
                    </span>
                  </div>
                  
                  {recipientsData?.recipients && recipientsData.recipients.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Preview: {recipientsData.recipients.slice(0, 3).map((r: any) => r.email).join(', ')}
                      {recipientsData.recipients.length > 3 && ` +${recipientsData.recipients.length - 3} more`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Test Email Section */}
            <div>
              <h4 className="font-medium mb-2">Test Email</h4>
              <Form {...testEmailForm}>
                <form onSubmit={testEmailForm.handleSubmit(handleTestEmail)} className="flex gap-2">
                  <FormField
                    control={testEmailForm.control}
                    name="testEmail"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Enter test email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    variant="outline"
                    disabled={sendTestEmail.isPending}
                  >
                    {sendTestEmail.isPending ? 'Sending...' : 'Send Test'}
                  </Button>
                </form>
              </Form>
            </div>

            <Separator />

            {/* Campaign Section */}
            <div>
              <h4 className="font-medium mb-2">Send Campaign</h4>
              
              {isSending ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Sending campaign...</span>
                  </div>
                  <Progress value={sendingProgress} className="w-full" />
                </div>
              ) : campaignResults ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Success: {campaignResults.successCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Failed: {campaignResults.errorCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Total: {campaignResults.totalRecipients}</span>
                    </div>
                  </div>
                  
                  {campaignResults.errors.length > 0 && (
                    <div className="text-sm">
                      <details className="cursor-pointer">
                        <summary className="text-red-600 hover:text-red-700">
                          View errors ({campaignResults.errors.length})
                        </summary>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {campaignResults.errors.map((error, index) => (
                            <div key={index} className="font-mono">{error}</div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => setCampaignResults(null)}
                    variant="outline"
                    size="sm"
                  >
                    Send Another Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    This will send the email to {recipientsData?.count || 0} recipients.
                  </div>
                  
                  <Button 
                    onClick={handleSendCampaign}
                    disabled={sendCampaign.isPending || !recipientsData?.count}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Campaign to {recipientsData?.count || 0} Recipients
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg h-96 overflow-auto">
            <iframe 
              srcDoc={selectedTemplate.html_content}
              className="w-full h-full"
              title="Email Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}