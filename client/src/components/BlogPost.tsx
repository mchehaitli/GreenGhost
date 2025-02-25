import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPostProps {
  title: string;
  content: string;
  date: string;
  category: string;
  readTime?: string;
}

const BlogPost = ({ title, content, date, category, readTime = "5 min read" }: BlogPostProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {date}
            </div>
            <span>•</span>
            <span>{readTime}</span>
          </div>
          <CardTitle className="text-3xl mb-4">{title}</CardTitle>
          <CardDescription>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {category}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogPost;
