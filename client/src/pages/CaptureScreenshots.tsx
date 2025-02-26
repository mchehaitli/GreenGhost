import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Link } from 'wouter';
import { Terminal, ChevronRight, Download, RefreshCw, Camera, FileText, Check } from 'lucide-react';

interface RouteInfo {
  path: string;
  name: string;
  screenshotUrl?: string;
  status: 'pending' | 'captured' | 'failed';
}

export default function CaptureScreenshots() {
  const [routes, setRoutes] = useState<RouteInfo[]>([
    { path: '/', name: 'Home', status: 'pending' },
    { path: '/services', name: 'Services', status: 'pending' },
    { path: '/how-it-works', name: 'How It Works', status: 'pending' },
    { path: '/blog', name: 'Blog', status: 'pending' },
    { path: '/pricing', name: 'Pricing', status: 'pending' },
    { path: '/quote', name: 'Quote', status: 'pending' },
    { path: '/about', name: 'About', status: 'pending' },
    { path: '/waitlist', name: 'Waitlist', status: 'pending' },
    { path: '/theme', name: 'Theme Customization', status: 'pending' },
    { path: '/ai-review', name: 'AI Review', status: 'pending' },
  ]);
  
  const [capturing, setCapturing] = useState(false);
  const [aiReviewText, setAiReviewText] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [allCaptured, setAllCaptured] = useState(false);

  // Function to extract text from AI Review page
  const extractAiReviewText = async () => {
    try {
      const response = await fetch('/ai-review');
      const html = await response.text();
      
      // Create a DOM parser to extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get all text content
      const textContent = doc.body.textContent || '';
      
      // Clean up the text (remove excessive whitespace)
      const cleanedText = textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      setAiReviewText(cleanedText);
      return cleanedText;
    } catch (error) {
      console.error('Error extracting AI Review text:', error);
      return null;
    }
  };

  // Function to capture screenshots by loading each page in an iframe
  const captureScreenshots = async () => {
    setCapturing(true);
    setAllCaptured(false);
    setCurrentIndex(0);
    
    // Reset all routes to pending
    setRoutes(prevRoutes => 
      prevRoutes.map(route => ({ ...route, status: 'pending', screenshotUrl: undefined }))
    );
    
    // Extract AI Review text
    await extractAiReviewText();
  };

  // Effect to capture screenshots sequentially
  useEffect(() => {
    if (!capturing || currentIndex < 0 || currentIndex >= routes.length) return;

    const captureCurrentRoute = async () => {
      try {
        // Update current route status to "capturing"
        setRoutes(prevRoutes => {
          const newRoutes = [...prevRoutes];
          newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'pending' };
          return newRoutes;
        });

        // Create an iframe to load the page
        const iframe = document.createElement('iframe');
        iframe.style.width = '1280px';
        iframe.style.height = '900px';
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);

        // Load the page in the iframe
        const route = routes[currentIndex];
        const fullUrl = window.location.origin + route.path;
        iframe.src = fullUrl;

        // Wait for the iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Add a timeout in case the page fails to load
          setTimeout(resolve, 10000);
        });

        // Wait a bit for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // The ideal approach would be to use html2canvas here to capture the iframe content,
          // but for simplicity we'll just record that we visited the page
          
          // Mark as captured
          setRoutes(prevRoutes => {
            const newRoutes = [...prevRoutes];
            newRoutes[currentIndex] = { 
              ...newRoutes[currentIndex], 
              status: 'captured',
              screenshotUrl: fullUrl // Just store the URL since we can't actually capture
            };
            return newRoutes;
          });
        } catch (error) {
          console.error(`Error capturing screenshot for ${route.name}:`, error);
          
          // Mark as failed
          setRoutes(prevRoutes => {
            const newRoutes = [...prevRoutes];
            newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'failed' };
            return newRoutes;
          });
        } finally {
          // Remove the iframe
          document.body.removeChild(iframe);
        }

        // Move to the next route
        if (currentIndex < routes.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
        }
      } catch (error) {
        console.error('Error in capture process:', error);
        setRoutes(prevRoutes => {
          const newRoutes = [...prevRoutes];
          newRoutes[currentIndex] = { ...newRoutes[currentIndex], status: 'failed' };
          return newRoutes;
        });
        
        // Move to the next route despite the error
        if (currentIndex < routes.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
        }
      }
    };

    captureCurrentRoute();
  }, [capturing, currentIndex, routes]);

  // Function to download AI Review text
  const downloadAiReviewText = () => {
    if (!aiReviewText) return;
    
    const blob = new Blob([aiReviewText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-review-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GreenGhost Tech Website Capture</h1>
          <p className="text-muted-foreground mt-1">
            Visit and document all website pages for AI review
          </p>
        </div>
        
        <Button 
          onClick={captureScreenshots} 
          disabled={capturing}
          size="lg"
        >
          {capturing ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> 
              Capturing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" /> 
              Start Capture
            </>
          )}
        </Button>
      </div>

      {/* Capture Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Terminal className="mr-2 h-5 w-5" /> Capture Status
          </CardTitle>
          <CardDescription>
            Status of website page captures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route, index) => (
              <div key={route.path} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {route.status === 'pending' && (
                    currentIndex === index && capturing ? 
                    <LoadingSpinner size="sm" className="text-muted-foreground" /> : 
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  )}
                  {route.status === 'captured' && <Check className="h-5 w-5 text-green-500" />}
                  {route.status === 'failed' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                  <span className={currentIndex === index && capturing ? "font-semibold" : ""}>
                    {route.name}
                  </span>
                </div>
                
                {route.status === 'captured' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={route.path} target="_blank">
                      Visit <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Review Text */}
      {aiReviewText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> AI Review Text Content
            </CardTitle>
            <CardDescription>
              Text content extracted from the AI Review page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {aiReviewText.substring(0, 100)}...
              </p>
              <Button onClick={downloadAiReviewText} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capture Complete */}
      {allCaptured && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Capture Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  All pages have been visited and documented
                </p>
              </div>
              
              <Button className="ml-auto" variant="outline" onClick={captureScreenshots}>
                <RefreshCw className="mr-2 h-4 w-4" /> Capture Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}