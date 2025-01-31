import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const About = () => {
  return (
    <div>
      {/* Header */}
      <section className="bg-background py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About GreenGhost Tech</h1>
            <p className="text-lg text-muted-foreground">
              Leading the revolution in automated landscape maintenance.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Founded with a vision to revolutionize landscape maintenance,
                  GreenGhost Tech combines cutting-edge automation with traditional
                  landscaping expertise.
                </p>
                <p className="text-muted-foreground">
                  Our team of technology experts and landscape professionals work
                  together to deliver sustainable, efficient, and beautiful outdoor
                  spaces.
                </p>
              </div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1527716916084-e8ee6cd469e2"
                  alt="Modern Landscaping"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-background py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              To transform property maintenance through innovative automation,
              making beautiful landscapes more accessible and sustainable for
              everyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Experience the Future of Landscaping
          </h2>
          <p className="mb-8 text-muted-foreground max-w-2xl mx-auto">
            Ready to see how our automated solutions can transform your property?
            Get in touch for a free consultation.
          </p>
          <Button asChild size="lg">
            <Link href="/quote">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;