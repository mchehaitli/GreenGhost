import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Link, Image, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageInsert: (imageUrl: string, altText?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const STOCK_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    alt: 'Beautiful green lawn',
    description: 'Perfect green lawn'
  },
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    alt: 'Lawn mowing service',
    description: 'Professional lawn care'
  },
  {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
    alt: 'Garden maintenance',
    description: 'Garden maintenance tools'
  },
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    alt: 'Landscaping service',
    description: 'Professional landscaping'
  },
  {
    url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=300&fit=crop',
    alt: 'Sprinkler system',
    description: 'Irrigation system'
  },
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    alt: 'Tree trimming',
    description: 'Tree care services'
  }
];

export function ImageUploader({ onImageInsert, isOpen, onClose }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'stock'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUrlInsert = () => {
    if (imageUrl) {
      onImageInsert(imageUrl, altText);
      setImageUrl('');
      setAltText('');
      onClose();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadedImageInsert = () => {
    if (uploadedImage) {
      onImageInsert(uploadedImage, altText);
      setUploadedImage(null);
      setAltText('');
      onClose();
    }
  };

  const handleStockImageInsert = (url: string, alt: string) => {
    onImageInsert(url, alt);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'url' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('url')}
            >
              <Link className="w-4 h-4 mr-2 inline" />
              URL
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'upload' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Upload
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'stock' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('stock')}
            >
              <Image className="w-4 h-4 mr-2 inline" />
              Stock Images
            </button>
          </div>

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="altText">Alt Text (Optional)</Label>
                <Input
                  id="altText"
                  placeholder="Description of the image"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              {imageUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={imageUrl} 
                    alt={altText || 'Preview'} 
                    className="max-w-full max-h-40 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button onClick={handleUrlInsert} disabled={!imageUrl}>
                Insert Image
              </Button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div>
                <Label>Upload Image</Label>
                <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop an image here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {uploadedImage && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="uploadAltText">Alt Text (Optional)</Label>
                    <Input
                      id="uploadAltText"
                      placeholder="Description of the image"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                    />
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={uploadedImage} 
                      alt={altText || 'Uploaded image'} 
                      className="max-w-full max-h-40 rounded"
                    />
                  </div>
                  <Button onClick={handleUploadedImageInsert}>
                    Insert Image
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Stock Images Tab */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {STOCK_IMAGES.map((image, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium text-gray-700">{image.description}</p>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleStockImageInsert(image.url, image.alt)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Use This Image
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Stock images are provided by Unsplash and are free to use
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}