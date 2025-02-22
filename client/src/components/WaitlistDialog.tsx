import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zipCode: z.string().min(5, "ZIP code must be 5 digits").max(5, "ZIP code must be 5 digits"),
});

const verificationSchema = z.object({
  code: z.string().min(4, "Verification code must be 4 digits").max(4, "Verification code must be 4 digits"),
});

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  // State management
  const [step, setStep] = useState<'initial' | 'verifying'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { toast } = useToast();

  // Form initialization
  const initialForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      zipCode: "",
    },
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Initial form submission
  const onInitialSubmit = async (values: z.infer<typeof formSchema>) => {
    if (step !== 'initial' || isSubmitting) {
      console.log('Invalid state for initial submission');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting initial form...');

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          zipCode: values.zipCode,
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to join waitlist");
      }

      if (data.status !== 'pending_verification') {
        console.error('Invalid server response:', data);
        throw new Error("Unexpected server response");
      }

      // Move to verification step
      setPendingEmail(values.email);
      setStep('verifying');

      toast({
        title: "Verification Required",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error('Initial submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification code submission
  const onVerificationSubmit = async (values: z.infer<typeof verificationSchema>) => {
    if (step !== 'verifying' || !pendingEmail || isSubmitting) {
      console.error('Invalid state for verification', { step, pendingEmail });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting verification code...');

      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // Success! Reset everything and close
      toast({
        title: "Welcome!",
        description: "You've successfully joined our waitlist.",
      });

      // Reset all state
      initialForm.reset();
      verificationForm.reset();
      setPendingEmail("");
      setStep('initial');
      onOpenChange(false);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog state management
  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing during verification
    if (!newOpen && step === 'verifying') {
      console.log('Preventing dialog close during verification');
      toast({
        title: "Please complete verification",
        description: "Enter the verification code sent to your email to complete the process.",
      });
      return;
    }

    // Reset state when closing
    if (!newOpen) {
      console.log('Resetting dialog state');
      initialForm.reset();
      verificationForm.reset();
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
          <Form {...initialForm}>
            <form onSubmit={initialForm.handleSubmit(onInitialSubmit)} className="space-y-4">
              <FormField
                control={initialForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Input 
                      placeholder="Email" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={initialForm.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <Input 
                      placeholder="ZIP Code" 
                      maxLength={5} 
                      {...field} 
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
              <FormField
                control={verificationForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      {...field}
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