import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase()),
  zipCode: z.string()
    .regex(/^\d{5}$/, "ZIP code must be exactly 5 digits")
});

const verificationSchema = z.object({
  code: z.string()
    .regex(/^\d{4}$/, "Please enter the 4-digit code")
});

interface WaitlistDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          zipCode: values.zipCode,
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.details || 'Failed to join waitlist');
      }

      setRegisteredEmail(values.email);
      setShowVerificationInput(true);
      form.reset();
      
      toast({
        title: "Check your email!",
        description: "We've sent a verification code to your email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyCode = async (values: z.infer<typeof verificationSchema>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail,
          code: values.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to verify code');
      }

      toast({
        title: "Success!",
        description: "You've successfully joined our waitlist.",
      });

      // Reset forms and state
      form.reset();
      verificationForm.reset();
      setShowVerificationInput(false);
      setRegisteredEmail("");

      // Refresh waitlist data if on admin page
      queryClient.invalidateQueries({ queryKey: ['/api/waitlist'] });

      // Close dialog only after success
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    // Prevent closing if in verification mode
    if (!newOpen && showVerificationInput) {
      toast({
        title: "Please complete verification",
        description: "Enter the verification code sent to your email to complete the signup process.",
      });
      return;
    }

    // Allow closing only if not submitting and not in verification mode
    if (!newOpen && !isSubmitting && !showVerificationInput && onOpenChange) {
      form.reset();
      verificationForm.reset();
      setShowVerificationInput(false);
      setRegisteredEmail("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[531px]">
        {showVerificationInput ? (
          // Verification Input Screen
          <div className="py-6 text-center space-y-4">
            <Mail className="mx-auto h-12 w-12 text-primary" />
            <DialogTitle className="text-2xl">Enter Verification Code</DialogTitle>
            <DialogDescription className="text-base max-w-[400px] mx-auto">
              We've sent a 4-digit verification code to {registeredEmail}. Please enter it below to complete your registration.
            </DialogDescription>

            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerifyCode)} className="space-y-4 max-w-[200px] mx-auto">
                <FormField
                  control={verificationForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="0000"
                          {...field}
                          className="text-center text-2xl tracking-[0.5em] font-mono"
                          maxLength={4}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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

            <p className="text-sm text-muted-foreground mt-4">
              Didn't receive the code? Check your spam folder or try again.
            </p>
          </div>
        ) : (
          // Initial Sign Up Screen
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Join the Future of Landscaping</DialogTitle>
              <DialogDescription className="text-base">
                Be among the first to experience automated landscape maintenance.
                Join our waitlist for early access and a chance to win a year of free service!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 rounded-lg bg-primary/5 p-4">
                <Trophy className="h-6 w-6 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Win Big!</p>
                  <p className="text-muted-foreground">
                    Join now for a chance to win a full year of FREE automated maintenance.
                  </p>
                </div>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Waitlist"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;