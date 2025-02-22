import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { toast } = useToast();

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
    try {
      console.log('Submitting waitlist form:', values);
      setIsSubmitting(true);

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          zipCode: values.zipCode
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to join waitlist");
      }

      // Check for pending_verification status
      if (data.status !== 'pending_verification') {
        console.error('Unexpected server response status:', data.status);
        throw new Error("Unexpected response from server");
      }

      // Move to verification state
      console.log('Moving to verification state');
      setRegisteredEmail(values.email);
      setIsVerifying(true);

      toast({
        title: "Check your email",
        description: "We've sent you a verification code.",
      });
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

  const onVerify = async (values: z.infer<typeof verificationSchema>) => {
    if (!registeredEmail) {
      console.error('No registered email found');
      return;
    }

    try {
      console.log('Submitting verification code for:', registeredEmail);
      setIsSubmitting(true);

      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          code: values.code,
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      // Close dialog and show success only after successful verification
      toast({
        title: "Success!",
        description: "You've been added to the waitlist.",
      });

      // Reset state and close dialog
      verificationForm.reset();
      form.reset();
      setIsVerifying(false);
      setRegisteredEmail("");
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

  // Prevent dialog from closing during verification
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and we're verifying, prevent closure
    if (!newOpen && isVerifying) {
      console.log('Preventing dialog close during verification');
      return;
    }

    // If closing and not verifying, reset all state
    if (!newOpen) {
      console.log('Resetting dialog state');
      setIsVerifying(false);
      setRegisteredEmail("");
      setIsSubmitting(false);
      form.reset();
      verificationForm.reset();
    }

    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>
          {isVerifying ? "Enter Verification Code" : "Join Our Waitlist"}
        </DialogTitle>
        {!isVerifying ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
            <form onSubmit={verificationForm.handleSubmit(onVerify)} className="space-y-4">
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
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WaitlistDialog;