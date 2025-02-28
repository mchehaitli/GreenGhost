import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminPortalNew() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Logged in as: {user.username}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await logout();
                  setLocation('/login');
                } catch (error) {
                  toast({
                    title: "Logout Failed",
                    description: "Could not log out. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
