import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Sprout, Cpu, LineChart, MapPin } from "lucide-react";

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
            <motion.div 
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Your Local Lawn Care Experts in Frisco, Texas</span>
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Transforming Lawn Care for Texas Homeowners
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We're a team of passionate lawn care professionals bringing together expert 
              service and innovative solutions to give you the perfect lawn without the hassle.
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
                <h2 className="text-3xl font-bold text-primary">Our Story</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    As homeowners in Frisco, we understood the challenges of maintaining 
                    a beautiful lawn in Texas's unique climate. We saw an opportunity to 
                    combine expert lawn care knowledge with innovative solutions to make 
                    lawn maintenance effortless for our neighbors.
                  </p>
                  <p className="text-muted-foreground">
                    Our team brings together experienced landscaping professionals and lawn 
                    care specialists who understand the specific needs of Texas lawns. We've 
                    developed a service that delivers consistent, professional results while 
                    saving you time and effort.
                  </p>
                  <p className="text-muted-foreground">
                    Today, from our base in Frisco, we're proud to be leading the way in 
                    modern lawn care services that combine the best of human expertise with 
                    innovative solutions to give you a perfectly maintained lawn year-round.
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
                <Sprout className="w-32 h-32 text-primary" />
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
            What Makes Us Different
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Bot className="w-12 h-12 text-primary mb-4" />,
                title: "Reliable Service",
                description: "Consistent, on-time service that keeps your lawn looking perfect week after week, no matter the season."
              },
              {
                icon: <Sprout className="w-12 h-12 text-primary mb-4" />,
                title: "Local Expertise",
                description: "Deep understanding of Texas lawns and climate, ensuring your yard gets exactly what it needs to thrive."
              },
              {
                icon: <LineChart className="w-12 h-12 text-primary mb-4" />,
                title: "Customer Focus",
                description: "Dedicated support team and lawn care experts available to answer your questions and address your needs."
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

      {/* CTA Section */}
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
                Join our growing community of satisfied homeowners in Frisco who are 
                enjoying beautiful, well-maintained lawns without the hassle.
              </p>
              <p className="text-lg opacity-80">
                Limited spots available for our Summer 2025 launch. 
                Secure your spot now and get access to our pre-launch special pricing!
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