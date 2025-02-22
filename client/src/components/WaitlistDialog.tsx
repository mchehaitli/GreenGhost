import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email(),
  zipCode: z.string().min(5).max(10),
});

const verificationSchema = z.object({
  code: z.string().min(6).max(6),
});

export function WaitlistDialog({ open, onOpenChange }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const verificationForm = useForm({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = async (values) => {
    try {
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setRegisteredEmail(values.email);
      setIsVerifying(true);
      form.reset();

      toast({
        title: "Check your email",
        description: "We've sent you a verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onVerify = async (values) => {
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
        throw new Error(data.error || "Failed to verify code");
      }

      toast({
        title: "Success!",
        description: "You've been added to the waitlist!",
      });

      setIsVerifying(false);
      onOpenChange(false);
      verificationForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {!isVerifying ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                placeholder="Email"
                {...form.register("email")}
              />
              <Input
                placeholder="ZIP Code"
                {...form.register("zipCode")}
              />
              <Button type="submit" className="w-full">
                Join Waitlist
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onVerify)} className="space-y-4">
              <Input
                placeholder="Enter 6-digit code"
                {...verificationForm.register("code")}
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