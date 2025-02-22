import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

// Match server schema exactly
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zip_code: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

const verificationSchema = z.object({
  code: z.string().length(4, "Code must be 4 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type FormData = z.infer<typeof formSchema>;
type VerificationData = z.infer<typeof verificationSchema>;

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const [step, setStep] = useState<'initial' | 'verifying'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      zip_code: "",
    },
  });

  const verificationForm = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Log form state before submission
      console.log('Form submission started:', {
        formData: data,
        formState: form.formState,
        rawFormData: form.getValues(),
      });

      // Validate required fields
      if (!data.email || !data.zip_code) {
        const missing = [];
        if (!data.email) missing.push('email');
        if (!data.zip_code) missing.push('zip_code');
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      const requestData = {
        email: data.email.trim().toLowerCase(),
        zip_code: data.zip_code.trim(),
      };

      console.log('Request payload:', JSON.stringify(requestData, null, 2));

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      console.log('Server response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to join waitlist");
      }

      if (responseData.status === 'pending_verification') {
        setPendingEmail(requestData.email);
        setStep('verifying');
        toast({
          title: "Check your email",
          description: "We've sent a 4-digit verification code to your email.",
        });
      } else {
        console.error('Unexpected server response:', responseData);
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async (values: VerificationData) => {
    if (!pendingEmail || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const requestData = {
        email: pendingEmail,
        code: values.code,
      };

      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: "You've successfully joined our waitlist. Welcome to GreenGhost Tech!",
        });
        form.reset();
        verificationForm.reset();
        setPendingEmail("");
        setStep('initial');
        onOpenChange(false);
      } else {
        throw new Error("Verification unsuccessful");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        form.reset();
        verificationForm.reset();
        setPendingEmail("");
        setStep('initial');
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent>
        <DialogTitle>
          {step === 'initial' ? "Join Our Waitlist" : "Enter Verification Code"}
        </DialogTitle>

        {step === 'initial' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <Input
                      placeholder="Enter your ZIP code"
                      maxLength={5}
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        field.onChange(value);
                        console.log('ZIP code field change:', { value, fieldValue: field.value });
                      }}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 4-digit verification code sent to <span className="font-medium text-foreground">{pendingEmail}</span>
              </p>
              <FormField
                control={verificationForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        field.onChange(value);
                      }}
                      disabled={isSubmitting}
                      className="text-center text-lg tracking-widest"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WaitlistDialog;