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
  code: z.string(),
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const verificationForm = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
  });

  const resetForms = () => {
    form.reset();
    verificationForm.reset();
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

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForms();
        }
        onOpenChange(newOpen);
      }}
    >
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
                control={form.control}
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
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          field.onChange(value);
                        }}
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
                        type="text"
                        placeholder="Enter verification code"
                        autoComplete="one-time-code"
                        disabled={isSubmitting}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="text-center text-2xl tracking-[0.5em] font-mono"
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