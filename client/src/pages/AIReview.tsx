import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { CheckCircle2, Link as LinkIcon, Instagram, Twitter, Facebook, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

// This page is designed specifically for AI tools to "see" the website content
// It transforms the dynamic, animated content into static, text-based content
// that's easier for AI to process when doing reviews

export default function AIReview() {
  return (
    <div className="container py-10 space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-2">GreenGhost Tech - Website Content for AI Review</h1>
        <p className="text-muted-foreground mb-2">This page contains text-based representations of our website content to help AI tools review our site.</p>
        <div className="flex justify-center">
          <Button asChild className="mt-2">
            <Link href="/waitlist">Join Our Waitlist</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">URL: https://greenghost-tech.example.com/ai-review</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Website Navigation Structure</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Home</strong> - Landing page with hero section, benefits, features, and pricing</li>
          <li><strong>Services</strong> - Detail of lawn care and landscaping services</li>
          <li><strong>How It Works</strong> - Explanation of our service process</li>
          <li><strong>Pricing</strong> - Detailed pricing plans and options</li>
          <li><strong>Blog</strong> - Articles about landscaping and lawn care</li>
          <li><strong>About Us</strong> - Company information and mission</li>
          <li><strong>Waitlist</strong> - Form to join our service waitlist</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Hero Section Content</h2>
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold">Welcome to the Future of Automated Landscaping</h1>
            <p className="mt-4 text-muted-foreground">Ready for the Best Lawn on the Block?</p>
            <p className="mt-2 text-sm text-muted-foreground italic">Starting Summer 2025: Testing our innovative systems in North Dallas, with planned expansion throughout Texas and beyond.</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline">View Services</Button>
              <Button>Join Waitlist</Button>
              <Button variant="outline">About Us</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Benefits Section</h2>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Experience the Difference</h2>
            <p className="mb-4 text-muted-foreground">Our comprehensive lawn care service combines reliability with excellence, delivering a superior experience that transforms how you think about lawn maintenance.</p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Reclaim Your Time</h3>
                  <p className="text-muted-foreground">Transform your weekends into quality time with family and friends while we maintain your lawn to perfection</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Unmatched Convenience</h3>
                  <p className="text-muted-foreground">Experience truly hassle-free lawn care with our streamlined service and dedicated support team</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Consistent Excellence</h3>
                  <p className="text-muted-foreground">Enjoy a perfectly maintained lawn year-round through our precise and systematic care approach</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Cost-Effective Solution</h3>
                  <p className="text-muted-foreground">Benefit from competitive pricing made possible by our innovative service model and efficient operations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Environmental Stewardship</h3>
                  <p className="text-muted-foreground">Support sustainable lawn care practices that reduce environmental impact while maintaining beautiful results</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Features Section</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Automated Precision</h3>
              <p className="text-muted-foreground">Advanced robotics and AI systems for precise lawn care and maintenance.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Smart Monitoring</h3>
              <p className="text-muted-foreground">Real-time monitoring of your landscape's health and maintenance needs.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Year-Round Green</h3>
              <p className="text-muted-foreground">Exclusive fertilizer blend keeping your lawn lush and green through all seasons.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Pool Servicing (Launching Soon)</h3>
              <p className="text-muted-foreground">Automated pool maintenance with smart chemical balancing and cleaning systems.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-primary">${plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="text-xl font-bold mb-4">Dedicated Pricing Plans</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Essential Care</CardTitle>
              <div className="mt-2">
                <span className="text-2xl font-bold text-primary">$149</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Perfect for standard residential lawns up to 5,000 sq ft</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Bi-weekly lawn maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Standard mowing and edging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic fertilization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Seasonal cleanup</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardTitle>Premium Care</CardTitle>
              <div className="mt-2">
                <span className="text-2xl font-bold text-primary">$249</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Ideal for larger properties up to 10,000 sq ft</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Weekly lawn maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Premium mowing and edging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced fertilization program</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority scheduling</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estate Care</CardTitle>
              <div className="mt-2">
                <span className="text-2xl font-bold text-primary">$399</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Comprehensive care for luxury estates over 10,000 sq ft</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Weekly lawn maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Premium mowing and edging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Full-service lawn treatments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Landscape consultation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-bold mb-4">Pricing Calculator Features</h3>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">Our interactive pricing calculator allows users to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Specify lawn size in square feet (with a base price of $0.10 per sq ft)</li>
              <li>Select service frequency (Weekly, Bi-Weekly, Monthly) with appropriate price adjustments</li>
              <li>Choose from 10 additional service options including:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Edging & Trimming ($0.05 per sq ft)</li>
                  <li>Fertilization ($0.08 per sq ft)</li>
                  <li>Weed Control ($0.07 per sq ft)</li>
                  <li>Leaf Removal ($0.06 per sq ft)</li>
                  <li>Soil Analysis & Treatment ($0.04 per sq ft)</li>
                  <li>Lawn Aeration ($0.06 per sq ft)</li>
                  <li>Garden Bed Maintenance ($0.08 per sq ft)</li>
                  <li>Mulching Service ($0.05 per sq ft)</li>
                  <li>Hardscape Cleaning ($0.06 per sq ft)</li>
                  <li>Seasonal Cleanup ($0.08 per sq ft)</li>
                </ul>
              </li>
              <li>Get real-time price calculations based on selections</li>
            </ul>
            <p>The calculator offers a transparent way for customers to understand pricing before joining our waitlist.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Services Page Content</h2>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Core Lawn Care Services</h2>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Automated Lawn Mowing - Precision robotic cutting at optimal height</li>
              <li>Edge Trimming - Perfect lawn boundaries and walkway edging</li>
              <li>Smart Fertilization - Data-driven nutrient application</li>
              <li>Weed Control - Targeted treatment with minimal chemicals</li>
              <li>Leaf and Debris Removal - Automated clearing for a pristine appearance</li>
            </ul>

            <h2 className="text-xl font-bold mb-3">Additional Landscaping Services</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Robotic Hedge Trimming - Consistent, precise shaping</li>
              <li>Garden Maintenance - Weeding, pruning, and care</li>
              <li>Smart Irrigation - Weather-responsive watering systems</li>
              <li>Seasonal Planting - Automated planting for changing seasons</li>
              <li>Landscape Design - AI-assisted design planning</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">About Us Content</h2>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Our Mission</h2>
            <p className="mb-4 text-muted-foreground">
              At GreenGhost Tech, we're revolutionizing lawn care through automation and smart technology. 
              Our mission is to give homeowners their time back while delivering premium lawn care services 
              that are consistent, reliable, and environmentally responsible.
            </p>

            <h2 className="text-xl font-bold mb-3">Our Story</h2>
            <p className="mb-4 text-muted-foreground">
              Founded in 2024 by a team of landscape professionals and technology experts, 
              GreenGhost Tech was born from the frustration of inconsistent service and high costs 
              in traditional lawn care. We've combined cutting-edge robotics with expert landscape knowledge 
              to create a revolutionary approach to property maintenance.
            </p>

            <h2 className="text-xl font-bold mb-3">Our Technology</h2>
            <p className="text-muted-foreground">
              We leverage advanced robotics, AI-driven monitoring, and data analytics to deliver 
              superior lawn care. Our systems adapt to your lawn's specific needs, ensuring optimal 
              health and appearance year-round with minimal environmental impact.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Waitlist Process</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              Our services are rolling out in phases, starting in North Dallas in Summer 2025. 
              Join our waitlist to be notified when we expand to your area.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Submit your information</strong> - Including email and zip code</li>
              <li><strong>Receive confirmation</strong> - Get notified that you're on the waitlist</li>
              <li><strong>Area notification</strong> - We'll contact you when we're expanding to your location</li>
              <li><strong>Priority service</strong> - Waitlist members get priority scheduling and special introductory offers</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">How It Works Process</h2>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-3">Our Service Process</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-4">
              <li>
                <strong>Initial Assessment</strong>
                <p className="text-muted-foreground">Our technology team conducts a thorough analysis of your property using satellite imagery and AI to create a custom service plan.</p>
              </li>
              <li>
                <strong>System Installation</strong>
                <p className="text-muted-foreground">We deploy our proprietary sensors and robotic equipment customized to your lawn's specific needs and challenges.</p>
              </li>
              <li>
                <strong>Smart Monitoring</strong>
                <p className="text-muted-foreground">Advanced IoT sensors continuously collect data about soil conditions, grass health, and environmental factors.</p>
              </li>
              <li>
                <strong>Automated Maintenance</strong>
                <p className="text-muted-foreground">Our AI-driven system determines optimal maintenance schedules and dispatches robotic equipment at ideal times.</p>
              </li>
              <li>
                <strong>Continuous Improvement</strong>
                <p className="text-muted-foreground">Machine learning algorithms analyze performance data to constantly improve service quality and efficiency.</p>
              </li>
            </ol>
            
            <h3 className="text-xl font-bold mb-3">Technology Integration</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mobile App Access</strong> - Monitor your lawn's health and service schedule</li>
              <li><strong>Smart Home Integration</strong> - Works with Google Home and Amazon Alexa</li>
              <li><strong>Automated Updates</strong> - System improves through regular software updates</li>
              <li><strong>Weather Adaptation</strong> - Services adjust automatically based on local weather patterns</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Blog Content</h2>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-3">Featured Blog Posts</h3>
            <ul className="space-y-4">
              <li>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold">The Future of Lawn Care: How Automation is Changing the Game</h4>
                  <p className="text-sm text-muted-foreground">Published: February 15, 2025 | 8 min read</p>
                  <p className="mt-2">Explore how smart technology and robotics are revolutionizing residential landscaping, making professional-level lawn care accessible to more homeowners while reducing environmental impact.</p>
                </div>
              </li>
              <li>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold">5 Ways Smart Irrigation Saves Water and Money</h4>
                  <p className="text-sm text-muted-foreground">Published: January 30, 2025 | 6 min read</p>
                  <p className="mt-2">Learn how modern irrigation technology is transforming water usage in Texas lawns, with some systems reducing consumption by up to 40% while maintaining healthier grass.</p>
                </div>
              </li>
              <li>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold">Seasonal Lawn Care Guide for North Texas</h4>
                  <p className="text-sm text-muted-foreground">Published: December 18, 2024 | 10 min read</p>
                  <p className="mt-2">A comprehensive guide to maintaining a healthy lawn throughout the year in North Texas climate, including month-by-month maintenance tips and regional considerations.</p>
                </div>
              </li>
            </ul>
            
            <h3 className="text-xl font-bold mb-3 mt-6">Blog Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">Lawn Care Tips</Button>
              <Button variant="outline" className="justify-start">Technology</Button>
              <Button variant="outline" className="justify-start">Sustainability</Button>
              <Button variant="outline" className="justify-start">DIY Projects</Button>
              <Button variant="outline" className="justify-start">Equipment Reviews</Button>
              <Button variant="outline" className="justify-start">Seasonal Guides</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Footer Information</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-bold mb-2">GreenGhost Tech</h3>
                <p className="text-sm text-muted-foreground mb-2">Revolutionizing lawn care with advanced technology</p>
                <div className="flex space-x-2">
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                  <Linkedin className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Quick Links</h3>
                <ul className="space-y-1 text-sm">
                  <li>Home</li>
                  <li>Services</li>
                  <li>How It Works</li>
                  <li>Pricing</li>
                  <li>Blog</li>
                  <li>About Us</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Contact Us</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> support@greenghost-tech.example.com
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> (972) 555-0123
                  </li>
                  <li className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Dallas-Fort Worth, Texas
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Legal</h3>
                <ul className="space-y-1 text-sm">
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                  <li>Cookie Policy</li>
                  <li>Service Agreement</li>
                  <li>Refund Policy</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4 text-center text-xs text-muted-foreground">
              <p>© 2025 GreenGhost Technologies, LLC. All rights reserved.</p>
              <p className="mt-1">Serving the Dallas-Fort Worth Metroplex and expanding throughout Texas</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="pb-10">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Technical Implementation Details</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Frontend:</strong> React with TypeScript, Tailwind CSS, Shadcn/ui components</li>
              <li><strong>Navigation:</strong> Implemented using Wouter for routing</li>
              <li><strong>Animations:</strong> Framer Motion for smooth transitions and interactions</li>
              <li><strong>Backend:</strong> Express.js with PostgreSQL database</li>
              <li><strong>ORM:</strong> Drizzle for database management</li>
              <li><strong>Authentication:</strong> Custom implementation with Passport.js</li>
              <li><strong>Responsive Design:</strong> Mobile-first approach with tailored layouts</li>
              <li><strong>Admin Dashboard:</strong> Protected routes with data visualization</li>
              <li><strong>Database Schema:</strong> Users, Waitlist, Verification Tokens, Email Templates, Email Segments</li>
              <li><strong>Email Integration:</strong> Transactional emails for waitlist confirmations and marketing</li>
              <li><strong>API Architecture:</strong> RESTful API endpoints with JSON responses</li>
              <li><strong>Deployment:</strong> Continuous deployment on cloud infrastructure</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}