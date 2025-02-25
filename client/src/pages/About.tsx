import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, Sprout, Clock, Shield } from "lucide-react";

const About = () => {
  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Header */}
      <section className="bg-background py-8">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              More Time for What You Love
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We believe your weekends should be spent making memories, not mowing lawns. 
              Our innovative service transforms lawn care from a time-consuming chore into 
              a worry-free experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-4 bg-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-primary">Our Promise to You</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Founded in Frisco by local homeowners who understood the challenges 
                    of maintaining a beautiful lawn in the Texas climate, we set out to 
                    create a better solution.
                  </p>
                  <p className="text-muted-foreground">
                    We combine reliable service with cutting-edge care techniques to 
                    deliver consistently beautiful results. Your lawn deserves the best, 
                    and that's exactly what we provide.
                  </p>
                  <p className="text-muted-foreground">
                    Today, we're proud to help homeowners across North Texas reclaim 
                    their time while enjoying pristine, healthy lawns that enhance their 
                    homes and communities.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="relative aspect-square bg-gradient-to-br from-primary/20 to-background rounded-full flex items-center justify-center border border-primary/20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Heart className="w-32 h-32 text-primary" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            What Sets Us Apart
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Clock className="w-12 h-12 text-primary mb-4" />,
                title: "Time Freedom",
                description: "Reclaim your weekends and spend more time with family and friends while we maintain your perfect lawn."
              },
              {
                icon: <Sprout className="w-12 h-12 text-primary mb-4" />,
                title: "Healthier Lawns",
                description: "Expert care and consistent maintenance lead to lusher, greener grass that stays beautiful year-round."
              },
              {
                icon: <Shield className="w-12 h-12 text-primary mb-4" />,
                title: "Peace of Mind",
                description: "Reliable, scheduled service means you never have to worry about your lawn care again."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-lg shadow-lg border border-primary/20"
                whileHover={{ scale: 1.05 }}
              >
                {value.icon}
                <h3 className="text-xl font-semibold mb-4 text-primary">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Ready for a Better Lawn Care Experience?</h2>
              <p className="text-xl opacity-90">
                Join our waitlist today and be among the first to experience 
                hassle-free lawn care in Frisco. Early members receive 
                priority access and special pricing.
              </p>
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/waitlist">Join the Waitlist Now</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;