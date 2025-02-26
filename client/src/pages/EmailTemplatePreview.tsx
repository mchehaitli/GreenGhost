import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Eye } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Create a simple Label component that doesn't use FormContext
const Label = ({ children }: { children: ReactNode }) => (
  <div className="text-sm font-medium leading-none mb-2">{children}</div>
);

type EmailTemplate = 'verification' | 'welcome';

export default function EmailTemplatePreview() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>('verification');
  const [testEmail, setTestEmail] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        `/api/email/preview/${selectedTemplate}`,
        { email: testEmail }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewHtml(data.html);
      toast({
        title: "Preview Generated",
        description: "Email template preview has been updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate email preview.",
      });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/email/test/${selectedTemplate}`,
        { email: testEmail }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: `A test ${selectedTemplate} email has been sent to ${testEmail}`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test email.",
      });
    },
  });

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container max-w-6xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Tabs
                    value={selectedTemplate}
                    onValueChange={(value) => setSelectedTemplate(value as EmailTemplate)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="verification">Verification Email</TabsTrigger>
                      <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label>Test Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Enter test email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => previewMutation.mutate()}
                    disabled={!testEmail || previewMutation.isPending}
                    className="flex-1"
                  >
                    {previewMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Generate Preview
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => sendTestMutation.mutate()}
                    disabled={!testEmail || sendTestMutation.isPending}
                    className="flex-1"
                  >
                    {sendTestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {previewHtml && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-4 border rounded-lg"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
