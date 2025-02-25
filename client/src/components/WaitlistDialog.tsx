import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import VerificationCountdown from "./VerificationCountdown";

// Form schemas
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

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      console.log('Form submission:', {
        data: values,
        rawFormState: form.getValues(),
        validationState: form.formState,
      });

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          zip_code: values.zip_code.trim(),
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', { status: response.status, data: responseData });

      if (!response.ok) {
        if (responseData.error === 'Already registered') {
          throw new Error('This email is already on our waitlist');
        }
        throw new Error(responseData.error || responseData.details || "Failed to join waitlist");
      }

      if (responseData.status === 'pending_verification') {
        // Complete form reset
        form.reset();
        // Complete verification form reset
        verificationForm.reset();
        verificationForm.clearErrors();
        // Set default values explicitly
        verificationForm.setValue('code', '');
        setPendingEmail(values.email.trim());
        setStep('verifying');

        const message = process.env.NODE_ENV !== 'production' && responseData.previewUrl
          ? `We've sent a verification code to your email. Since this is a test environment, you can view the email at: ${responseData.previewUrl}`
          : "We've sent a 4-digit verification code to your email. The code will expire in 90 seconds.";

        toast({
          title: "Check your email",
          description: message,
        });
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist",
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
      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          code: values.code,
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: "You've successfully joined our waitlist. Welcome to GreenGhost Tech!",
        });
        // Reset all forms and state
        form.reset();
        verificationForm.reset();
        setPendingEmail("");
        setStep('initial');
        onOpenChange(false);
      } else {
        throw new Error("Verification unsuccessful");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all forms and state when dialog is closed
      form.reset();
      verificationForm.reset();
      verificationForm.clearErrors();
      setPendingEmail("");
      setStep('initial');
      setIsSubmitting(false);
    }

    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your ZIP code"
                        maxLength={5}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          field.onChange(value);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                disabled={isSubmitting || !form.formState.isValid}
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
                    <FormControl>
                      <Input
                        placeholder="Enter 4-digit code"
                        maxLength={4}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          field.onChange(value);
                        }}
                        disabled={isSubmitting}
                        className="text-center text-lg tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <VerificationCountdown 
                onExpire={() => {
                  toast({
                    title: "Verification Expired",
                    description: "The verification period has expired. Please sign up again.",
                    variant: "destructive",
                  });
                  form.reset();
                  verificationForm.reset();
                  setPendingEmail("");
                  setStep('initial');
                }} 
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