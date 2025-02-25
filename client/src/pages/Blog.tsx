import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tag, Calendar } from "lucide-react";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
  tags: string[];
  featured_image?: string;
};

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog-posts", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Blog Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Lawn Care Tips & Advice</h1>
        <p className="text-lg text-muted-foreground">
          Expert insights on maintaining a beautiful, healthy lawn throughout the year
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4">
                  {post.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags?.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="link" className="mt-4 p-0">
                  <Link href={`/blog/${post.slug}`}>
                    Read More →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for a Perfect Lawn?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Let our automated lawn care service take care of your yard while you enjoy your free time.
        </p>
        <Button asChild size="lg">
          <Link href="/waitlist">Join Our Waitlist</Link>
        </Button>
      </div>
    </div>
  );
}
