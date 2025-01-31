import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ThemePreview } from "@/components/ThemePreview";

export default function ThemeCustomization() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return {
        primary: "hsl(142, 76%, 36%)",
        variant: "professional",
        appearance: "dark"
      };
    } catch {
      return null;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("theme", file);
      return apiRequest("POST", "/api/theme/upload", formData);
    },
    onSuccess: () => {
      toast({
        title: "Theme Updated",
        description: "Your custom theme has been applied successfully. Refresh to see changes.",
      });
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload theme. Make sure it's a valid JSON file.",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Preview the theme
      try {
        const text = await file.text();
        const theme = JSON.parse(text);
        setCurrentTheme(theme);
      } catch (error) {
        console.error('Error parsing theme file:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container max-w-2xl space-y-8">
        {currentTheme && <ThemePreview currentTheme={currentTheme} />}

        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a JSON file with your custom theme configuration.
                  The theme file should include: variant, primary color, appearance, and radius.
                </p>
              </div>
              <Button
                type="submit"
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Theme"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}