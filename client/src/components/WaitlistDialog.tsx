import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import VerificationCountdown from "./VerificationCountdown";

// Form schemas
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zip_code: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

const verificationSchema = z.object({
  code: z.string().length(4, "Please enter the 4-digit code").regex(/^\d+$/, "Please enter only numbers"),
});

type FormData = z.infer<typeof formSchema>;
type VerificationData = z.infer<typeof verificationSchema>;

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const [step, setStep] = useState<'initial' | 'verifying'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { toast } = useToast();

  // Separate form instances with explicit default values
  const emailForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      zip_code: "",
    },
  });

  const codeForm = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const resetForms = () => {
    emailForm.reset({
      email: "",
      zip_code: "",
    });
    codeForm.reset({
      code: "",
    });
    setPendingEmail("");
    setStep('initial');
    setIsSubmitting(false);
  };

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to join waitlist");
      }

      if (data.status === 'pending_verification') {
        setPendingEmail(values.email);
        setStep('verifying');
        toast({
          title: "Check your email",
          description: "We've sent a 4-digit verification code to your email. The code will expire in 90 seconds.",
        });
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
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

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: "You've successfully joined our waitlist. Welcome to GreenGhost Tech!",
        });
        resetForms();
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

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForms();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogTitle>
          {step === 'initial' ? "Join Our Waitlist" : "Enter Verification Code"}
        </DialogTitle>

        {step === 'initial' ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter ZIP code"
                        maxLength={5}
                        inputMode="numeric"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 4-digit verification code sent to <span className="font-medium text-foreground">{pendingEmail}</span>
              </p>

              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0000"
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        disabled={isSubmitting}
                        {...field}
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
                  resetForms();
                }}
              />

              <Button
                type="submit"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;