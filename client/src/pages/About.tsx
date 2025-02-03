import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Sprout, Cpu, LineChart } from "lucide-react";
import { LeafParticles } from "@/components/LeafParticle";

const About = () => {
  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LeafParticles />
      {/* Hero Header */}
      <section className="bg-background py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6 text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Revolutionizing Landscape Care Through Technology
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We're not just another landscaping company. We're technology pioneers 
              reimagining the future of property maintenance through robotics, AI, 
              and sustainable practices.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-primary/5">
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
                <h2 className="text-3xl font-bold text-foreground">Our Genesis Story</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Born at the intersection of Silicon Valley innovation and environmental 
                    stewardship, GreenGhost Tech emerged from a simple observation: the 
                    landscaping industry was ripe for disruption.
                  </p>
                  <p className="text-muted-foreground">
                    Our founders, a team of robotics engineers and landscape architects, 
                    saw an opportunity to address the increasing labor shortages and 
                    environmental concerns in traditional landscaping while delivering 
                    superior results through automation.
                  </p>
                  <p className="text-muted-foreground">
                    Today, we're proud to be at the forefront of the green technology 
                    revolution, making professional landscape maintenance more accessible, 
                    sustainable, and efficient than ever before.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Bot className="w-32 h-32 text-primary" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Cpu className="w-12 h-12 text-primary mb-4" />,
                title: "Technological Innovation",
                description: "Pushing the boundaries of what's possible in landscape maintenance through cutting-edge robotics and AI."
              },
              {
                icon: <Sprout className="w-12 h-12 text-primary mb-4" />,
                title: "Environmental Stewardship",
                description: "Committed to sustainable practices that protect and nurture our environment for future generations."
              },
              {
                icon: <LineChart className="w-12 h-12 text-primary mb-4" />,
                title: "Data-Driven Excellence",
                description: "Leveraging advanced analytics to deliver precise, optimized landscape care tailored to each property's unique needs."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                {value.icon}
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision & Beta Access */}
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
              <h2 className="text-3xl font-bold">The Future of Landscaping is Here</h2>
              <p className="text-xl opacity-90">
                We're in the final stages of deployment, set to launch before summer 2025. 
                Join our waitlist now for a chance to win a full year of free maintenance 
                and be among the first to experience the future of property care.
              </p>
              <p className="text-lg opacity-80">
                <span className="italic">Pro tip:</span> With the landscaping industry facing unprecedented 
                labor shortages (turns out humans prefer air-conditioned offices to summer heat - who knew?), 
                our robotic workforce is ready to step in. But even robots have busy schedules, so secure 
                your spot before our calendar fills up!
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