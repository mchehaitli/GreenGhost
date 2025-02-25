import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
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
import { Loader2, Trophy, Calendar, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VerificationCountdown from "@/components/VerificationCountdown";

// Form schemas
const initialFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  zip_code: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

type InitialFormData = z.infer<typeof initialFormSchema>;

const Waitlist = () => {
  const [step, setStep] = useState<'initial' | 'verifying'>('initial');
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
        toast({
          title: "Success!",
          description: "You've successfully joined our waitlist. Welcome to GreenGhost Tech!",
        });
        resetForms();
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-primary/5">
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.h1
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Join the Future of Landscaping
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Be among the first to experience automated landscape maintenance
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{step === 'initial' ? "Sign Up for Early Access" : "Enter Verification Code"}</CardTitle>
                <CardDescription>
                  {step === 'initial'
                    ? "Join our waitlist and be notified when we launch in your area"
                    : "Enter the 6-digit code sent to your email"}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                                  field.onChange(value);
                                }}
                                value={field.value}
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
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Win Big!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join our waitlist for a chance to win a full year of FREE automated
                  landscape maintenance! Winner will be announced at launch.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Summer 2025 Launch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We're in the final stages of testing and will be launching before
                  summer. Early waitlist members get priority access!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Beat the Rush
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  With traditional landscaping facing labor shortages, our robotic workforce
                  is ready to serve. Reserve your spot before we're fully booked!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;