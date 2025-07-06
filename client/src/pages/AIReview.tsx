import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, FileText, Image, Info, Layers, LayoutDashboard, MapPin, Menu, Settings, Package, Users, FileJson } from "lucide-react";

export default function AIReview() {
  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">GreenGhost Tech AI Review</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Comprehensive documentation of the GreenGhost Tech platform for AI analysis
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/capture">
            Capture Tool <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-5 max-w-[600px]">
          <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="features"><Package className="mr-2 h-4 w-4" /> Features</TabsTrigger>
          <TabsTrigger value="pages"><FileText className="mr-2 h-4 w-4" /> Pages</TabsTrigger>
          <TabsTrigger value="services"><Layers className="mr-2 h-4 w-4" /> Services</TabsTrigger>
          <TabsTrigger value="tech"><Settings className="mr-2 h-4 w-4" /> Technology</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>General information about the Green Ghost platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium">About Green Ghost</h3>
                  <p>
                    Green Ghost is a cutting-edge landscaping technology platform serving Texas, transforming lawn care management through innovative digital solutions and user-centric design. The platform combines modern technology with traditional landscaping expertise to provide seamless, efficient, and environmentally-conscious services to homeowners and businesses.
                  </p>
                </section>
                
                <Separator />
                
                <section>
                  <h3 className="text-lg font-medium">Mission Statement</h3>
                  <p>
                    Our mission is to revolutionize the landscaping industry through technology, making professional lawn care services more accessible, transparent, and sustainable. We aim to connect homeowners with reliable, eco-friendly landscaping solutions while reducing the environmental impact of traditional lawn maintenance.
                  </p>
                </section>
                
                <Separator />
                
                <section>
                  <h3 className="text-lg font-medium">Target Audience</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Homeowners in Texas seeking professional landscaping services</li>
                    <li>Environmentally-conscious consumers interested in sustainable yard maintenance</li>
                    <li>Busy professionals who need convenient lawn care management</li>
                    <li>Property managers overseeing multiple locations</li>
                    <li>Commercial property owners requiring consistent landscaping services</li>
                  </ul>
                </section>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Value Propositions</CardTitle>
                <CardDescription>Core benefits offered by the GreenGhost Tech platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" /> User-Centric Design
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Intuitive interfaces designed for seamless user experience across all devices, making lawn care management accessible to everyone regardless of technical proficiency.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-primary" /> Localized Service
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Texas-specific landscaping solutions tailored to local climate conditions, soil types, and regional plant species for optimal results in the Texan environment.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <Image className="mr-2 h-5 w-5 text-primary" /> AR Measurement
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced augmented reality tools allow users to accurately measure their yards and garden spaces directly through their mobile devices, ensuring precise service quotes.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <LayoutDashboard className="mr-2 h-5 w-5 text-primary" /> Customer Portal
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive dashboard for managing all landscaping services, viewing service history, scheduling appointments, and communicating with service providers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Platform Features</CardTitle>
                <CardDescription>Key functionalities of the GreenGhost Tech platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Service Management</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Subscription Plans</strong>: Tiered service offerings with various frequency options (weekly, bi-weekly, monthly)
                    </li>
                    <li>
                      <strong>On-Demand Booking</strong>: Single-service scheduling without subscription commitment
                    </li>
                    <li>
                      <strong>Automated Scheduling</strong>: AI-powered scheduling system optimizing route efficiency and service timing
                    </li>
                    <li>
                      <strong>Service Customization</strong>: Add-on services and special requests management
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Assessment</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>AR Measurement Tool</strong>: Augmented reality lawn measurement for accurate size estimation
                    </li>
                    <li>
                      <strong>Property Profiling</strong>: Lawn condition assessment, terrain analysis, and special features documentation
                    </li>
                    <li>
                      <strong>Climate-Based Recommendations</strong>: Localized service suggestions based on Texas climate zones
                    </li>
                    <li>
                      <strong>Before/After Visualization</strong>: Visual mockups of expected service outcomes
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer Portal</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Service History</strong>: Comprehensive record of all services performed
                    </li>
                    <li>
                      <strong>Digital Invoicing</strong>: Paperless billing and payment processing
                    </li>
                    <li>
                      <strong>Service Ratings & Feedback</strong>: Quality assurance through customer reviews
                    </li>
                    <li>
                      <strong>Communication Center</strong>: Direct messaging with service providers and support
                    </li>
                    <li>
                      <strong>Service Alerts</strong>: Notifications for upcoming services, weather-related rescheduling, and special offers
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Innovative Technology Elements</CardTitle>
                <CardDescription>Advanced technological components integrated into the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Augmented Reality Integration</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Lawn measurement with AR boundary marking</li>
                      <li>Object recognition for obstacles and special features</li>
                      <li>Landscape visualization with AR plant placement</li>
                      <li>Before/after service comparison using AR overlays</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">AI-Powered Scheduling</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Predictive service timing based on lawn growth rates</li>
                      <li>Weather-adaptive scheduling to avoid rain or extreme conditions</li>
                      <li>Route optimization for service provider efficiency</li>
                      <li>Resource allocation based on service complexity</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Digital Payment Processing</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Secure subscription management and billing</li>
                      <li>Multiple payment method support</li>
                      <li>Automated invoicing and receipt generation</li>
                      <li>Transparent pricing with detailed service breakdowns</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Environmental Analytics</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Water usage monitoring and optimization</li>
                      <li>Carbon footprint tracking for services performed</li>
                      <li>Eco-friendly product and practice recommendations</li>
                      <li>Seasonal adjustments based on environmental conditions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Structure</CardTitle>
                <CardDescription>Information architecture and page organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Menu className="mr-2 h-5 w-5 text-primary" /> Primary Navigation
                  </h3>
                  <ul className="grid grid-cols-2 gap-2 pl-7">
                    <li className="list-disc">Home</li>
                    <li className="list-disc">Services</li>
                    <li className="list-disc">How It Works</li>
                    <li className="list-disc">Blog</li>
                    <li className="list-disc">Pricing</li>
                    <li className="list-disc">About</li>
                    <li className="list-disc">Quote</li>
                    <li className="list-disc">Login</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Key Pages Overview</h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Home Page</h4>
                    <p className="text-sm text-muted-foreground">
                      The landing page features a hero section with animated elements showcasing the Green Ghost mascot and primary service offerings. It includes a brief platform introduction, featured services, customer testimonials, and a call-to-action for joining the waitlist or requesting a quote.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Services Page</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed breakdown of all landscaping services offered through the platform, including lawn maintenance, garden design, irrigation systems, seasonal care, tree services, and hardscaping. Each service includes a description, pricing structure, and service frequency options.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guide explaining the service process from initial property assessment through the AR measurement tool, service customization, scheduling, execution, and follow-up. Includes visual aids and animated demonstrations of the technology components.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Pricing Page</h4>
                    <p className="text-sm text-muted-foreground">
                      Transparent subscription plan options with tiered pricing based on property size, service frequency, and included features. The pricing calculator allows users to estimate costs based on their specific requirements before requesting a personalized quote.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Quote Request</h4>
                    <p className="text-sm text-muted-foreground">
                      Multi-step form collecting property details, service preferences, and contact information. Includes the option to upload property photos or use the AR measurement tool to provide accurate dimensions for more precise quotes.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Customer Portal</h4>
                    <p className="text-sm text-muted-foreground">
                      Secure login area for existing customers to manage their subscriptions, view service history, schedule additional services, communicate with providers, and manage payment methods. Includes a dashboard with upcoming service notifications and property status updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Flows</CardTitle>
                <CardDescription>Primary user journeys through the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">New Customer Onboarding</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>User visits home page and explores service offerings</li>
                    <li>User navigates to pricing page to review subscription options</li>
                    <li>User accesses the quote request form to submit property details</li>
                    <li>System prompts user to create an account or join the waitlist</li>
                    <li>User receives confirmation email with next steps</li>
                    <li>User is guided to the AR measurement tool for property assessment</li>
                    <li>System generates personalized service recommendation and final quote</li>
                    <li>User selects subscription plan and payment method</li>
                    <li>System confirms service schedule and sends welcome materials</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Service Management</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Customer logs into the customer portal</li>
                    <li>System displays dashboard with upcoming services and account status</li>
                    <li>Customer can view detailed service history with completion photos</li>
                    <li>Customer can request service modifications or additional one-time services</li>
                    <li>System processes changes and updates the service schedule</li>
                    <li>Customer receives confirmation of changes and updated invoicing</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Feedback and Quality Assurance</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>System sends service completion notification after each service</li>
                    <li>Customer is prompted to review service quality and provide feedback</li>
                    <li>Customer can upload photos of any concerns or special requests</li>
                    <li>Service provider receives feedback and addresses any issues</li>
                    <li>Customer support follows up on any negative feedback for resolution</li>
                    <li>System incorporates feedback into service provider ratings and future scheduling</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Landscaping Services</CardTitle>
                <CardDescription>Core services offered through the GreenGhost Tech platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Regular Lawn Maintenance</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Mowing with precise height customization</li>
                      <li>Edging along walkways and driveways</li>
                      <li>Trimming around obstacles and garden features</li>
                      <li>Blowing and cleanup of clippings and debris</li>
                      <li>Seasonal adjustments to cutting patterns and frequency</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Available weekly, bi-weekly, or monthly based on growth rates and customer preferences.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Garden Care Services</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Flower bed maintenance and seasonal planting</li>
                      <li>Mulching and weed control</li>
                      <li>Pruning and shaping of shrubs and small trees</li>
                      <li>Fertilization and soil management</li>
                      <li>Pest control using eco-friendly methods</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Customized schedules based on garden complexity and seasonal requirements.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Irrigation Management</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Smart irrigation system installation and programming</li>
                      <li>Seasonal adjustments to watering schedules</li>
                      <li>Water conservation recommendations</li>
                      <li>System maintenance and repair services</li>
                      <li>Rainwater harvesting system integration</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Includes smart controller setup for automatic weather-based adjustments.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Seasonal Services</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Spring cleanup and garden bed preparation</li>
                      <li>Fall leaf removal and winter preparation</li>
                      <li>Aeration and overseeding</li>
                      <li>Winterization of irrigation systems</li>
                      <li>Holiday lighting and seasonal decorations</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Automatically scheduled based on Texas climate zones and seasonal transitions.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Landscape Design</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Digital landscape planning with AR visualization</li>
                      <li>Native plant selection for Texas climate</li>
                      <li>Water-efficient xeriscaping designs</li>
                      <li>Outdoor living space integration</li>
                      <li>Phased implementation planning</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Collaborative design process with professional landscape architects.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Hardscaping Solutions</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Walkway and patio installation</li>
                      <li>Retaining wall construction</li>
                      <li>Outdoor kitchen and fire feature installation</li>
                      <li>Pergolas and shade structures</li>
                      <li>Decorative rock and stone placement</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Custom designs with 3D rendering previews before installation begins.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Service packages available through the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Essential Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Basic lawn maintenance package for standard residential properties
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">$89<span className="text-base font-normal text-muted-foreground">/month</span></p>
                      <p className="text-xs text-muted-foreground">For properties up to 5,000 sq ft</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Bi-weekly lawn mowing and edging
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Monthly trimming and cleanup
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seasonal fertilization (Spring/Fall)
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Customer portal access
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-5 space-y-4 bg-primary/5 border-primary/50 relative">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      Most Popular
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Premium Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive care for properties with additional features
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">$149<span className="text-base font-normal text-muted-foreground">/month</span></p>
                      <p className="text-xs text-muted-foreground">For properties up to 10,000 sq ft</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Weekly lawn mowing and edging
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Bi-weekly garden bed maintenance
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Quarterly fertilization and weed control
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Shrub and small tree pruning
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seasonal cleanups (Spring/Fall)
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Basic irrigation system checks
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Estate Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Total care solution for larger properties
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">$299<span className="text-base font-normal text-muted-foreground">/month</span></p>
                      <p className="text-xs text-muted-foreground">For properties up to 1 acre</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Weekly comprehensive lawn care
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Weekly garden bed maintenance
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Monthly fertilization and pest control
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Full irrigation system management
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seasonal color changes in flower beds
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Tree care and deep root fertilization
                      </li>
                      <li className="flex items-start">
                        <svg className="h-4 w-4 mr-2 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Priority scheduling and dedicated team
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tech" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
                <CardDescription>Technologies and systems used in the GreenGhost Tech platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Frontend Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Core Technologies</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>React with TypeScript for type safety</li>
                        <li>Tailwind CSS for styling</li>
                        <li>Shadcn/ui component library</li>
                        <li>Wouter for lightweight routing</li>
                        <li>React Query for data fetching and caching</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">UI/UX Considerations</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Responsive design optimized for mobile-first usage</li>
                        <li>Accessible components meeting WCAG standards</li>
                        <li>Dark/light mode theming support</li>
                        <li>Motion effects and animations for engagement</li>
                        <li>Interactive visualization components</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backend Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Server Technology</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Express.js backend with TypeScript</li>
                        <li>PostgreSQL database for data persistence</li>
                        <li>Drizzle ORM for database management</li>
                        <li>Authentication system with Passport.js</li>
                        <li>RESTful API architecture</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Data Management</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Relational database design with efficient indexing</li>
                        <li>Data validation using Zod schema validation</li>
                        <li>Optimized queries for performance</li>
                        <li>Automated database backups and redundancy</li>
                        <li>Data migration and versioning strategy</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Payment Processing</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Secure payment gateway integration</li>
                        <li>Subscription management system</li>
                        <li>Automated invoicing and receipts</li>
                        <li>Refund processing capabilities</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Mapping & Geolocation</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>MapBox integration for property mapping</li>
                        <li>Geolocation services for service areas</li>
                        <li>Route optimization algorithms</li>
                        <li>Address verification and normalization</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Communication</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Email notification system</li>
                        <li>SMS alerts and reminders</li>
                        <li>In-app messaging platform</li>
                        <li>Email template management system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schema Definition</CardTitle>
                <CardDescription>Data model for the GreenGhost Tech platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                  <pre className="text-xs">
                    <code>
{`// Database Schema Definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone_number: text("phone_number"),
  address: text("address"),
  notes: text("notes"),
  zip_code: text("zip_code").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip_code: text("zip_code").notNull(),
  size_sqft: integer("size_sqft").notNull(),
  lawn_type: text("lawn_type"),
  features: jsonb("features"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  base_price: numeric("base_price").notNull(),
  price_per_sqft: numeric("price_per_sqft"),
  duration_minutes: integer("duration_minutes"),
  service_type: text("service_type").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  property_id: integer("property_id").references(() => properties.id).notNull(),
  plan_type: text("plan_type").notNull(),
  frequency: text("frequency").notNull(),
  start_date: date("start_date").notNull(),
  next_service_date: date("next_service_date").notNull(),
  status: text("status").notNull().default("active"),
  monthly_price: numeric("monthly_price").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const service_history = pgTable("service_history", {
  id: serial("id").primaryKey(),
  subscription_id: integer("subscription_id").references(() => subscriptions.id).notNull(),
  service_date: date("service_date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  photo_urls: jsonb("photo_urls"),
  technician_id: integer("technician_id"),
  feedback_rating: integer("feedback_rating"),
  feedback_comments: text("feedback_comments"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  subscription_id: integer("subscription_id").references(() => subscriptions.id),
  amount: numeric("amount").notNull(),
  payment_date: timestamp("payment_date").defaultNow().notNull(),
  payment_method: text("payment_method").notNull(),
  transaction_id: text("transaction_id").notNull(),
  status: text("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  subscription_id: integer("subscription_id").references(() => subscriptions.id),
  amount: numeric("amount").notNull(),
  issue_date: date("issue_date").notNull(),
  due_date: date("due_date").notNull(),
  status: text("status").notNull(),
  payment_id: integer("payment_id").references(() => payments.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});`}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-primary/10 rounded-full p-2 mr-4">
            <FileJson className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Machine-Readable Content</h3>
            <p className="text-muted-foreground mt-1">
              This page is designed to be readable by both humans and AI systems. The structured content provides comprehensive information about the GreenGhost Tech platform for analysis and understanding by AI tools.
            </p>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/capture">
                  Visit Capture Tool <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}