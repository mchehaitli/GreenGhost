import { useParams } from "wouter";
import BlogPostComponent from "@/components/BlogPost";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

// Sample blog post content - In a real app, this would come from a database or CMS
const blogPosts = {
  "greener-lawn-spring": {
    title: "5 Simple Ways to Get a Greener Lawn This Spring",
    date: "February 25, 2025",
    category: "Lawn Care Tips",
    content: `Spring is the perfect time to revitalize your lawn and set it up for a beautiful growing season. Here are five proven strategies that will help you achieve that lush, green lawn you've always wanted.

First, start with a thorough spring cleaning. Remove dead grass, leaves, and debris that accumulated over winter. This allows sunlight and nutrients to reach the grass roots effectively.

Next, test your soil's pH levels. Most grass types thrive in soil with a pH between 6.0 and 7.0. If needed, add lime to raise pH or sulfur to lower it. This simple step can dramatically improve your lawn's health.

Regular watering is crucial, but timing matters more than frequency. Water deeply but infrequently to encourage deep root growth. The best time is early morning, between 4 AM and 10 AM, when there's less evaporation and wind.

Proper mowing technique plays a vital role in lawn health. Never cut more than one-third of the grass blade length at once. Keep mower blades sharp for clean cuts that help prevent disease.

Finally, implement a consistent fertilization schedule. Start with a balanced, slow-release fertilizer in early spring. This provides essential nutrients without promoting excessive growth that demands frequent mowing.`,
    readTime: "4 min read"
  },
  "maintenance-savings": {
    title: "Why Regular Lawn Maintenance Saves You Money",
    date: "February 25, 2025",
    category: "Maintenance",
    content: `Many homeowners view regular lawn maintenance as an unnecessary expense, but the truth is that consistent care can actually save you money in the long run. Let's explore how proper maintenance protects your investment and reduces costs.

Prevention is always cheaper than cure. Regular maintenance helps identify and address potential problems before they become expensive issues. This includes catching weed infestations early and preventing disease spread.

A well-maintained lawn increases your property's value. Real estate experts estimate that good landscaping can increase a home's value by 5-12%. When you consider the average home value, this translates to significant returns on your maintenance investment.

Professional maintenance can actually reduce water bills. Proper mowing height and timing helps grass develop deeper roots, requiring less frequent watering. Experts can also identify and fix irrigation issues that waste water.

Regular maintenance extends the life of your lawn equipment. When professionals handle the heavy lifting, your personal equipment lasts longer and requires fewer repairs.

Over time, neglected lawns may need complete renovation, which can cost thousands of dollars. Regular maintenance helps avoid these major expenses by keeping your lawn consistently healthy.`,
    readTime: "5 min read"
  },
  "texas-watering-guide": {
    title: "The Best Times to Water Your Lawn in Texas",
    date: "February 25, 2025",
    category: "Water Conservation",
    content: `Texas lawns face unique challenges due to the state's intense heat and varying rainfall patterns. Understanding when and how to water your lawn can make the difference between a thriving landscape and a struggling one.

The ideal time to water your Texas lawn is early morning, between 4 AM and 8 AM. During these hours, wind speeds are typically lower, and temperatures are cool, allowing water to soak into the soil before evaporation occurs.

Deep, infrequent watering is more effective than frequent light watering. This approach encourages grass roots to grow deeper, making your lawn more drought-resistant. Aim for 1 to 1.5 inches of water per week, including rainfall.

During Texas summers, you might need to adjust your watering schedule. Watch for signs of stress like grass blades folding in half lengthwise or footprints remaining visible after walking across the lawn.

Consider installing a smart irrigation system that adjusts watering based on weather conditions. These systems can reduce water usage by 20-30% while maintaining a healthy lawn.

Remember that different grass types have different water needs. Common Texas varieties like St. Augustine need more water than Bermuda or Zoysia grass. Understanding your grass type helps optimize your watering schedule.`,
    readTime: "6 min read"
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="container py-20">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12"
    >
      <div className="container">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        <BlogPostComponent {...post} />
      </div>
    </motion.div>
  );
};

export default BlogPostPage;
