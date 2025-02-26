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
import WelcomeAnimation from "./WelcomeAnimation";

// Initial form schema
const initialFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zip_code: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

type InitialFormData = z.infer<typeof initialFormSchema>;

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDemo?: boolean;
}

const WaitlistDialog = ({ open, onOpenChange, isDemo = false }: WaitlistDialogProps) => {
  const [step, setStep] = useState<'initial' | 'verifying' | 'welcome'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const initialForm = useForm<InitialFormData>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      email: "",
      zip_code: "",
    },
  });

  const resetForms = () => {
    initialForm.reset({
      email: "",
      zip_code: "",
    });
    setVerificationCode("");
    setPendingEmail("");
    setStep('initial');
    setIsSubmitting(false);
  };

  const onInitialSubmit = async (values: InitialFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          zip_code: values.zip_code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to join waitlist');
      }

      if (data.status === 'pending_verification') {
        setPendingEmail(values.email);
        setStep('verifying');
        toast({
          title: "Check your email",
          description: "We've sent a 6-digit verification code to your email. The code will expire in 90 seconds.",
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEmail || isSubmitting || !verificationCode || verificationCode.length !== 6) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      if (data.success) {
        setStep('welcome');
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

  // If this is a demo dialog, show the testing phase message
  if (isDemo) {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Schedule a Demo</DialogTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Coming Soon!</h3>
              <p className="text-muted-foreground">
                We're currently in the testing phase. Our automated lawn care demos will be available soon!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Join our waitlist to be notified when demo scheduling becomes available in your area.
              </p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 mt-4">
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => {
                  handleDialogClose(false);
                  onOpenChange(false);
                }}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-primary/10 text-primary hover:bg-primary/20" 
                onClick={() => {
                  handleDialogClose(false);
                  // Open waitlist dialog instead
                  setTimeout(() => onOpenChange(true), 100);
                }}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'welcome') {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <WelcomeAnimation 
          email={pendingEmail} 
          onComplete={() => {
            resetForms();
            onOpenChange(false);
          }} 
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
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
                control={initialForm.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="12345"
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
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the 6-digit verification code sent to <span className="font-medium text-foreground">{pendingEmail}</span>
            </p>

            <div>
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isSubmitting}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

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
              disabled={isSubmitting || verificationCode.length !== 6}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;