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

const emailSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase()),
});

const verificationSchema = z.object({
  code: z.string()
    .length(4, "Code must be 4 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

const Waitlist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'initial' | 'verifying'>('initial');
  const [pendingEmail, setPendingEmail] = useState("");
  const { toast } = useToast();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onEmailSubmit = async (values: EmailFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Already registered') {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.details || 'Failed to join waitlist');
      }

      if (data.status === 'pending_verification') {
        setPendingEmail(values.email);
        setStep('verifying');
        toast({
          title: "Check your email",
          description: "We've sent a 4-digit verification code to your email.",
        });
      } else {
        throw new Error("Unexpected server response");
      }
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

  const onVerificationSubmit = async (values: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          code: values.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Verification failed');
      }

      toast({
        title: "Success!",
        description: "You've successfully joined our waitlist. Welcome to GreenGhost Tech!",
      });

      emailForm.reset();
      verificationForm.reset();
      setPendingEmail("");
      setStep('initial');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Verification failed. Please try again.",
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
                <CardTitle>{step === 'initial' ? 'Sign Up for Early Access' : 'Verify Your Email'}</CardTitle>
                <CardDescription>
                  {step === 'initial' 
                    ? 'Join our waitlist and be notified when we launch'
                    : `Enter the verification code sent to ${pendingEmail}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 'initial' ? (
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
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
                ) : (
                  <Form {...verificationForm}>
                    <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
                      <FormField
                        control={verificationForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 4-digit code"
                                maxLength={4}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  field.onChange(value);
                                }}
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