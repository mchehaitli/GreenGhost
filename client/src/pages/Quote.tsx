import QuoteForm from "@/components/QuoteForm";
import { motion } from "framer-motion";
import { LeafParticles } from "@/components/LeafParticle";

const Quote = () => {
  return (
    <div className="flex min-h-screen items-center justify-center py-20 bg-background relative">
      <LeafParticles />
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Get a Free Quote</h1>
          <p className="text-lg text-muted-foreground">
            Fill out the form below and we'll get back to you with a customized
            quote for your property.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <QuoteForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Quote;