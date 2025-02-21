import { useState } from "react";
import { motion } from "framer-motion";
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
import { Loader2, Trophy } from "lucide-react";
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

interface WaitlistDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      zipCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

      if (!response.ok) {
        if (data.error === 'Duplicate entry') {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.details || 'Failed to join waitlist');
      }

      toast({
        title: "Successfully joined waitlist!",
        description: "You're now entered for a chance to win free maintenance for a year.",
      });

      if (onOpenChange) {
        onOpenChange(false);
      }
      form.reset();
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[531px]">
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;