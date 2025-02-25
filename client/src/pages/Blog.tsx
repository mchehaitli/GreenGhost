import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 Simple Ways to Get a Greener Lawn This Spring",
    description: "Learn easy-to-follow tips that will help your lawn thrive during the growing season.",
    date: "February 25, 2025",
    category: "Lawn Care Tips",
    image: "/blog/spring-lawn.jpg",
    slug: "greener-lawn-spring"
  },
  {
    id: 2,
    title: "Why Regular Lawn Maintenance Saves You Money",
    description: "Discover how consistent lawn care can protect your investment and save costs in the long run.",
    date: "February 25, 2025",
    category: "Maintenance",
    image: "/blog/lawn-maintenance.jpg",
    slug: "maintenance-savings"
  },
  {
    id: 3,
    title: "The Best Times to Water Your Lawn in Texas",
    description: "Expert advice on watering schedules that keep your lawn healthy while conserving water.",
    date: "February 25, 2025",
    category: "Water Conservation",
    image: "/blog/watering-tips.jpg",
    slug: "texas-watering-guide"
  },
  {
    id: 4,
    title: "Common Lawn Problems and How to Fix Them",
    description: "Solutions to frequent lawn issues that Texas homeowners face throughout the year.",
    date: "February 25, 2025",
    category: "Troubleshooting",
    image: "/blog/lawn-problems.jpg",
    slug: "common-problems"
  }
];

const Blog = () => {
  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <section className="py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Lawn Care Guide</h1>
            <p className="text-lg text-muted-foreground">
              Expert tips and insights to help you maintain a beautiful, healthy lawn
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {blogPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <CardDescription>{post.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary">{post.category}</span>
                        <Button variant="ghost" className="text-primary">
                          Read More →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Blog;
