import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPasswordReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (!secretKey) {
      toast({
        title: "Secret key required",
        description: "Please enter the admin reset key",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setStatus("idle");
    
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: password,
          secretKey
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Admin password reset successfully! You can now log in with your new password.");
        // Clear form fields
        setPassword("");
        setConfirmPassword("");
        setSecretKey("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error occurred. Please check your connection and try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Password Reset</CardTitle>
          <CardDescription>
            Reset the admin account password to regain access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="secretKey" className="text-sm font-medium">
                Reset Key
              </label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter the admin reset key"
                disabled={isLoading}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                The default key is: greenghost-secure-reset-key
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            
            {status === "success" && (
              <div className="bg-green-50 border border-green-100 rounded-md p-3 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}
            
            {status === "error" && (
              <div className="bg-red-50 border border-red-100 rounded-md p-3 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{message}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Admin Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}