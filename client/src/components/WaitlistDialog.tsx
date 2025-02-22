import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

const verificationSchema = z.object({
  code: z.string().length(4, "Verification code must be 4 digits"),
});

export function WaitlistDialog({ open, onOpenChange }) {
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      zipCode: "",
    },
  });

  const verificationForm = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values) {
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
        throw new Error(data.message || "Failed to join waitlist");
      }

      setRegisteredEmail(values.email);
      setShowVerificationInput(true);
      form.reset();

      toast({
        title: "Verification email sent!",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function onVerifySubmit(values) {
    try {
      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registeredEmail,
          code: values.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code");
      }

      toast({
        title: "Success!",
        description: "You've been added to the waitlist.",
      });

      setShowVerificationInput(false);
      setRegisteredEmail("");
      verificationForm.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            {showVerificationInput
              ? "Enter the verification code sent to your email"
              : "Sign up to be notified when we launch"}
          </DialogDescription>
        </DialogHeader>

        {!showVerificationInput ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
              <Button type="submit" className="w-full">
                Join Waitlist
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onVerifySubmit)} className="space-y-4">
              <FormField
                control={verificationForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" maxLength={4} {...field} />
                    </FormControl>
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