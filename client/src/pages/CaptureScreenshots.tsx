import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Terminal, ChevronRight, Download, RefreshCw, Camera, FileText, Check, Archive, ExternalLink, Layers } from 'lucide-react';

interface RouteInfo {
  path: string;
  name: string;
  screenshotUrl?: string;
  status: 'pending' | 'captured' | 'failed';
  content?: string;
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

  ]);
  
  const [capturing, setCapturing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [allCaptured, setAllCaptured] = useState(false);
  const [activeTab, setActiveTab] = useState('capture-status');
  const captureInProgress = useRef(false);

  // Function to extract text from any page
  const extractPageContent = async (path: string): Promise<string | null> => {
    try {
      const response = await fetch(path);
      const html = await response.text();
      
      // Create a DOM parser to extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get main content
      const mainContent = doc.querySelector('main');
      const textContent = mainContent ? mainContent.textContent || '' : doc.body.textContent || '';
      
      // Clean up the text (remove excessive whitespace)
      const cleanedText = textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanedText;
    } catch (error) {
      console.error(`Error extracting content from ${path}:`, error);
      return null;
    }
  };

  // Function to capture screenshots by loading each page in an iframe
  const captureScreenshots = async () => {
    if (captureInProgress.current) return;
    
    captureInProgress.current = true;
    setCapturing(true);
    setAllCaptured(false);
    setCurrentIndex(0);
    
    // Reset all routes to pending
    setRoutes(prevRoutes => 
      prevRoutes.map(route => ({ ...route, status: 'pending', screenshotUrl: undefined, content: undefined }))
    );
    
    // Content capture only - AI Review functionality has been removed
  };

  // Effect to capture screenshots sequentially
  useEffect(() => {
    if (!capturing || currentIndex < 0 || currentIndex >= routes.length) {
      captureInProgress.current = false;
      return;
    }

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
          // Extract the text content from the current page
          const content = await extractPageContent(route.path);
          
          // Mark as captured
          setRoutes(prevRoutes => {
            const newRoutes = [...prevRoutes];
            newRoutes[currentIndex] = { 
              ...newRoutes[currentIndex], 
              status: 'captured',
              screenshotUrl: fullUrl,
              content: content || undefined
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
          setCurrentIndex(prevIndex => prevIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
          captureInProgress.current = false;
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
          setCurrentIndex(prevIndex => prevIndex + 1);
        } else {
          setCapturing(false);
          setAllCaptured(true);
          setCurrentIndex(-1);
          captureInProgress.current = false;
        }
      }
    };

    const timer = setTimeout(() => {
      captureCurrentRoute();
    }, 500);

    return () => clearTimeout(timer);
  }, [capturing, currentIndex]);

  // Content download functions

  // Function to download all content as a single file
  const downloadAllContent = () => {
    // Create a combined text file with content from all pages
    let allContent = "# GreenGhost Tech Website Content\n\n";
    
    routes.forEach(route => {
      if (route.content) {
        allContent += `## ${route.name}\n`;
        allContent += `URL: ${route.path}\n\n`;
        allContent += `${route.content}\n\n`;
        allContent += "---\n\n";
      }
    });
    
    // Generate the content file with all captured pages
    
    // Create a download link
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenghosttech-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to generate HTML summary
  const downloadHtmlSummary = () => {
    const capturedPages = routes.filter(route => route.status === 'captured');
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenGhost Tech Website Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #166534; border-bottom: 2px solid #166534; padding-bottom: 10px; }
    h2 { color: #166534; margin-top: 30px; }
    .page-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
    .page-header { background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .page-content { padding: 20px; max-height: 300px; overflow: auto; }
    .page-link { display: inline-block; padding: 8px 16px; background-color: #166534; color: white; text-decoration: none; border-radius: 4px; }
    .page-link:hover { background-color: #125a30; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; margin-left: 10px; }
    .status-captured { background-color: #dcfce7; color: #166534; }
    .status-failed { background-color: #fee2e2; color: #b91c1c; }
    .toc { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .toc ul { padding-left: 20px; }
    .summary { margin-bottom: 30px; background-color: #f0fdf4; padding: 20px; border-radius: 8px; }
    .summary-stats { display: flex; gap: 20px; margin-top: 15px; }
    .summary-stat { padding: 10px 15px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; }
    .meta { font-size: 14px; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>GreenGhost Tech Website Documentation</h1>
  
  <div class="summary">
    <h2>Capture Summary</h2>
    <p>Documentation generated on ${new Date().toLocaleString()}</p>
    
    <div class="summary-stats">
      <div class="summary-stat">
        <strong>Total Pages:</strong> ${routes.length}
      </div>
      <div class="summary-stat">
        <strong>Captured:</strong> ${capturedPages.length}
      </div>
      <div class="summary-stat">
        <strong>Failed:</strong> ${routes.filter(route => route.status === 'failed').length}
      </div>
    </div>
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${routes.map(route => `
        <li>
          <a href="#${route.path.replace(/\//g, '-') || 'home'}">${route.name}</a>
          ${route.status === 'captured' ? 
            '<span class="status status-captured">Captured</span>' : 
            route.status === 'failed' ? 
            '<span class="status status-failed">Failed</span>' : ''}
        </li>
      `).join('')}
    </ul>
  </div>`;
  
    // Add page content
    routes.forEach(route => {
      const anchorId = route.path.replace(/\//g, '-') || 'home';
      
      html += `
  <div class="page-card" id="${anchorId}">
    <div class="page-header">
      <h2>${route.name}</h2>
      <a href="${route.path}" target="_blank" class="page-link">View Page</a>
    </div>
    <div class="page-content">
      <p class="meta">Path: ${route.path}</p>
      <p class="meta">Status: ${route.status}</p>
      ${route.content ? `<div>${route.content.substring(0, 500)}${route.content.length > 500 ? '...' : ''}</div>` : ''}
    </div>
  </div>`;
    });
  
    html += `
</body>
</html>`;
  
    // Create download link
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenghosttech-documentation.html';
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
            Capture and document website pages for content review
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

      <Tabs defaultValue="capture-status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="capture-status">Capture Status</TabsTrigger>
          <TabsTrigger value="download-all" disabled={!allCaptured}>Download All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture-status" className="space-y-4 mt-4">
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

          {/* AI Review section removed */}
        </TabsContent>
        
        <TabsContent value="download-all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="mr-2 h-5 w-5" /> Download All Content
              </CardTitle>
              <CardDescription>
                Download all captured website content in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">All Content as Text</h3>
                      <p className="text-sm text-muted-foreground">
                        Download all page content as a single text file
                      </p>
                      <Button onClick={downloadAllContent} className="mt-2" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download Text
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">HTML Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a complete HTML summary of all pages
                      </p>
                      <Button onClick={downloadHtmlSummary} className="mt-2" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Captured Pages</h3>
                <div className="border rounded-md">
                  <div className="py-3 px-4 text-sm font-medium bg-muted">
                    {routes.filter(r => r.status === 'captured').length} pages captured
                  </div>
                  <div className="divide-y">
                    {routes.filter(r => r.status === 'captured').map(route => (
                      <div key={route.path} className="flex items-center justify-between py-2 px-4">
                        <span className="text-sm">{route.name}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={route.path} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capture Complete */}
      {allCaptured && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
          <CardContent className="pt-6 pb-6">
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
              
              <div className="ml-auto space-x-2">
                <Button variant="outline" onClick={() => setActiveTab('download-all')}>
                  <Archive className="mr-2 h-4 w-4" /> View Downloads
                </Button>
                <Button variant="outline" onClick={captureScreenshots}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Capture Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}