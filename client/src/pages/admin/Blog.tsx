import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Bot, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function BlogPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const blogForm = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog-posts", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const response = await fetch("/api/blog-posts", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
        }),
      });
      if (!response.ok) throw new Error("Failed to create blog post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setShowPostDialog(false);
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updateData,
          tags: updateData.tags ? updateData.tags.split(",").map(t => t.trim()) : [],
        }),
      });
      if (!response.ok) throw new Error("Failed to update blog post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setShowPostDialog(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const generatePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/blog-posts/generate", {
        method: "POST",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to generate blog post");
      return response.json();
    },
    onSuccess: (data) => {
      blogForm.reset({
        title: data.title,
        summary: data.summary,
        content: data.content,
        tags: data.tags.join(", "),
      });
      toast({
        title: "Success",
        description: "Generated blog post draft",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate post",
        variant: "destructive",
      });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      const response = await fetch(`/api/blog-posts/${id}/${publish ? 'publish' : 'unpublish'}`, {
        method: "POST",
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to ${publish ? 'publish' : 'unpublish'} blog post`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update post status",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const handleSubmit = async (data: BlogPostFormData) => {
    if (editingPost) {
      await updatePostMutation.mutateAsync({ ...data, id: editingPost.id });
    } else {
      await createPostMutation.mutateAsync(data);
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts about lawn care tips and advice
          </p>
        </div>
        <Button
          onClick={() => {
            blogForm.reset({
              title: "",
              summary: "",
              content: "",
              tags: "",
            });
            setEditingPost(null);
            setShowPostDialog(true);
          }}
        >
          Create New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{post.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublishMutation.mutate({
                        id: post.id,
                        publish: !post.published
                      })}
                    >
                      {post.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPost(post);
                        blogForm.reset({
                          title: post.title,
                          summary: post.summary,
                          content: post.content,
                          tags: post.tags?.join(", ") || "",
                        });
                        setShowPostDialog(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{post.summary}</p>
                <div className="flex gap-2 text-sm">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {post.published ? (
                    <>Published on {format(new Date(post.published_at), 'MMM d, yyyy')}</>
                  ) : (
                    'Draft'
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
          </DialogHeader>
          <Form {...blogForm}>
            <form onSubmit={blogForm.handleSubmit(handleSubmit)} className="space-y-4">
              {!editingPost && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => generatePostMutation.mutate()}
                  disabled={generatePostMutation.isPending}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Generate Draft with AI
                </Button>
              )}
              <FormField
                control={blogForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={blogForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={blogForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={15} className="font-mono" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={blogForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="lawn-care, tips, maintenance" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                  {editingPost ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
