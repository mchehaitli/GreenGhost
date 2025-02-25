import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { motion } from "framer-motion";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  tags: string[];
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", params.slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts/${params.slug}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch blog post");
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

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Button asChild variant="link">
          <Link href="/blog">← Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button
        asChild
        variant="ghost"
        className="mb-8"
      >
        <Link href="/blog">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex gap-2">
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
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Want a Perfect Lawn Without the Work?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Our automated lawn care service combines robotic precision with expert human touch 
            to keep your lawn looking its best year-round.
          </p>
          <Button asChild size="lg">
            <Link href="/waitlist">Join Our Waitlist</Link>
          </Button>
        </div>
      </motion.article>
    </div>
  );
}
