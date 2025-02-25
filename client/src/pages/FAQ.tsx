import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

const FAQ = () => {
  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our automated lawn care service
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the robotic mower work?</AccordionTrigger>
              <AccordionContent>
                Our robotic mowers use advanced navigation and sensors to carefully maintain your lawn. A professional team member sets up a secure boundary system during the first visit, after which the mower works autonomously to keep your grass at the perfect height. The mower returns to its charging station automatically when needed, ensuring continuous operation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What happens if it rains?</AccordionTrigger>
              <AccordionContent>
                Our robotic mowers are weather-resistant and can operate safely in light rain. However, they're programmed to return to their charging stations during heavy rainfall to protect your lawn from damage. Once conditions improve, they automatically resume their schedule. This smart weather adaptation ensures your lawn is maintained without causing soil damage.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is it safe for pets and children?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Our mowers are equipped with multiple safety features including:
                <ul className="list-disc ml-6 mt-2">
                  <li>Automatic shut-off when lifted or tilted</li>
                  <li>Advanced obstacle detection and avoidance</li>
                  <li>Protective bumpers and enclosed cutting system</li>
                  <li>Low-profile design to prevent accidents</li>
                </ul>
                The mowers will stop immediately if they encounter any resistance, making them completely safe around children and pets.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What size lawns do you service?</AccordionTrigger>
              <AccordionContent>
                We service residential lawns from 1,000 to 20,000 square feet. For larger properties or commercial spaces, please contact us for a custom solution. Our team will assess your property during the initial consultation to recommend the best service plan for your specific needs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What are the payment options?</AccordionTrigger>
              <AccordionContent>
                We offer flexible payment options to suit your needs:
                <ul className="list-disc ml-6 mt-2">
                  <li>Monthly subscription with automatic billing</li>
                  <li>Quarterly pre-paid plans (with discount)</li>
                  <li>Annual pre-paid plans (maximum savings)</li>
                </ul>
                All major credit cards are accepted, and you can manage your subscription easily through our customer portal.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do I schedule service?</AccordionTrigger>
              <AccordionContent>
                Getting started is easy:
                <ol className="list-decimal ml-6 mt-2">
                  <li>Join our waitlist or request a quote</li>
                  <li>Our team will contact you to schedule a property assessment</li>
                  <li>We'll create a custom service plan based on your lawn's needs</li>
                  <li>Schedule your first service appointment</li>
                  <li>Enjoy your perfectly maintained lawn!</li>
                </ol>
                Currently, we're accepting pre-registrations for our Summer 2025 launch in North Dallas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Have more questions? We're here to help!
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/waitlist">Join Waitlist</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default FAQ;
