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
  code: z.string().min(6, "Verification code must be 6 digits").max(6, "Verification code must be 6 digits"),
});

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const [isVerifying, setIsVerifying] = useState(false);
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
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to join waitlist");
      }

      // Only proceed to verification if status is pending_verification
      if (data.status === 'pending_verification') {
        setRegisteredEmail(values.email);
        setIsVerifying(true);
        form.reset();
        toast({
          title: "Check your email",
          description: "We've sent you a verification code.",
        });
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const onVerify = async (values: z.infer<typeof verificationSchema>) => {
    try {
      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          code: values.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed");
      }

      toast({
        title: "Success!",
        description: "You've been added to the waitlist.",
      });

      // Reset both forms and states
      verificationForm.reset();
      form.reset();
      setIsVerifying(false);
      setRegisteredEmail("");

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsVerifying(false);
      setRegisteredEmail("");
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
                    <Input placeholder="Email" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder="ZIP Code" maxLength={5} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Join Waitlist
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
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WaitlistDialog;