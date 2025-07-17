import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image,
  Type,
  Palette,
  Link,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Eye,
  Save,
  Upload,
  Download,
  Copy,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  Layers,
  Move,
  MousePointer
} from 'lucide-react';

interface AdvancedEmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
];

const FONT_SIZES = [
  { value: 10, label: '10px' },
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 24, label: '24px' },
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
  { value: 36, label: '36px' },
  { value: 48, label: '48px' },
  { value: 64, label: '64px' }
];

const COLOR_PALETTE = [
  // Grayscale
  '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff',
  // Red tones
  '#8B0000', '#DC143C', '#FF0000', '#FF6347', '#FF7F7F', '#FFA0A0',
  // Orange tones
  '#FF4500', '#FF6600', '#FF8C00', '#FFA500', '#FFB347', '#FFCC99',
  // Yellow tones
  '#FFD700', '#FFFF00', '#FFFF66', '#FFFFCC', '#F0E68C', '#BDB76B',
  // Green tones
  '#006400', '#008000', '#00FF00', '#32CD32', '#90EE90', '#98FB98',
  // Blue tones
  '#000080', '#0000FF', '#4169E1', '#6495ED', '#87CEEB', '#B0E0E6',
  // Purple tones
  '#4B0082', '#8A2BE2', '#9400D3', '#BA55D3', '#DA70D6', '#DDA0DD',
  // Brand colors
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'
];

const EMAIL_TEMPLATES = [
  {
    name: 'Welcome Header',
    category: 'Headers',
    html: `<div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to GreenGhost</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Premium Automated Lawn Care Services</p>
    </div>`
  },
  {
    name: 'Service Card',
    category: 'Content',
    html: `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1f2937;">Lawn Maintenance</h3>
      <p style="margin: 0 0 16px 0; color: #6b7280; line-height: 1.6;">Professional lawn care services including mowing, edging, and cleanup for your property.</p>
      <div style="text-align: center;">
        <a href="#" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.2s;">Learn More</a>
      </div>
    </div>`
  },
  {
    name: 'Call to Action',
    category: 'Buttons',
    html: `<div style="text-align: center; margin: 32px 0;">
      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); transition: all 0.3s;">
        Get Your Free Quote
      </a>
    </div>`
  },
  {
    name: 'Footer',
    category: 'Footers',
    html: `<div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px 20px; margin-top: 40px;">
      <div style="text-align: center; max-width: 600px; margin: 0 auto;">
        <h4 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Stay Connected</h4>
        <div style="margin: 0 0 24px 0;">
          <a href="#" style="display: inline-block; margin: 0 8px; color: #22c55e; text-decoration: none; font-weight: 500;">Facebook</a>
          <a href="#" style="display: inline-block; margin: 0 8px; color: #22c55e; text-decoration: none; font-weight: 500;">Twitter</a>
          <a href="#" style="display: inline-block; margin: 0 8px; color: #22c55e; text-decoration: none; font-weight: 500;">Instagram</a>
        </div>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          © 2025 GreenGhost. All rights reserved.<br>
          <a href="mailto:support@greenghost.io" style="color: #22c55e; text-decoration: none;">support@greenghost.io</a>
        </p>
      </div>
    </div>`
  }
];

export function AdvancedEmailEditor({ value, onChange, placeholder, height = '400px' }: AdvancedEmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif');
  const [selectedSize, setSelectedSize] = useState(16);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlContent, setHtmlContent] = useState(value);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      editorRef.current.innerHTML = value;
    }
  }, [value, activeTab]);

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleContentChange();
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    executeCommand('fontName', font);
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      try {
        range.surroundContents(span);
      } catch (e) {
        span.innerHTML = range.toString();
        range.deleteContents();
        range.insertNode(span);
      }
    }
    handleContentChange();
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    executeCommand('foreColor', color);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    executeCommand('hiliteColor', color);
  };

  const handleImageInsert = (url: string, altText?: string) => {
    const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0;" alt="${altText || 'Inserted image'}" />`;
    executeCommand('insertHTML', imgHtml);
    setShowImageDialog(false);
  };

  const handleLinkInsert = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #22c55e; text-decoration: underline; font-weight: 500;">${linkText}</a>`;
      executeCommand('insertHTML', linkHtml);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      onChange(content);
    }
  };

  const insertTemplate = (templateHtml: string) => {
    executeCommand('insertHTML', templateHtml);
    setShowTemplateDialog(false);
  };

  const clearFormatting = () => {
    executeCommand('removeFormat');
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">Cell 2</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">Cell 3</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">Cell 4</td>
        </tr>
      </table>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const insertDivider = () => {
    const dividerHtml = `<div style="border-top: 2px solid #e5e7eb; margin: 24px 0; width: 100%;"></div>`;
    executeCommand('insertHTML', dividerHtml);
  };

  const insertSpacing = () => {
    const spacingHtml = `<div style="height: 24px;"></div>`;
    executeCommand('insertHTML', spacingHtml);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="html">HTML Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          {/* Advanced Toolbar */}
          <div className="border rounded-lg p-4 space-y-4">
            {/* Font and Size Controls */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Font:</Label>
                <Select value={selectedFont} onValueChange={handleFontChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Size:</Label>
                <Select value={selectedSize.toString()} onValueChange={(v) => handleSizeChange(parseInt(v))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map(size => (
                      <SelectItem key={size.value} value={size.value.toString()}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Text Formatting */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => executeCommand('bold')}>
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => executeCommand('italic')}>
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => executeCommand('underline')}>
                  <Underline className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={clearFormatting}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Alignment */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => executeCommand('justifyLeft')}>
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => executeCommand('justifyCenter')}>
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => executeCommand('justifyRight')}>
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists and Structure */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => executeCommand('insertUnorderedList')}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => executeCommand('insertOrderedList')}>
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={insertTable}>
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Color Controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Text Color:</Label>
                  <div className="flex flex-wrap gap-1">
                    {COLOR_PALETTE.slice(0, 12).map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                          selectedColor === color ? 'border-gray-600 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Background:</Label>
                  <div className="flex flex-wrap gap-1">
                    {COLOR_PALETTE.slice(0, 12).map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                          backgroundColor === color ? 'border-gray-600 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleBackgroundColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-muted-foreground">More Colors</summary>
                <div className="mt-2 grid grid-cols-12 gap-1 p-2 border rounded">
                  {COLOR_PALETTE.slice(12).map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                        selectedColor === color ? 'border-gray-600 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </details>
            </div>

            {/* Insert Tools */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowImageDialog(true)}>
                <Image className="w-4 h-4 mr-1" />
                Image
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLinkDialog(true)}>
                <Link className="w-4 h-4 mr-1" />
                Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
                <Settings className="w-4 h-4 mr-1" />
                Templates
              </Button>
              <Button variant="outline" size="sm" onClick={insertDivider}>
                <Minus className="w-4 h-4 mr-1" />
                Divider
              </Button>
              <Button variant="outline" size="sm" onClick={insertSpacing}>
                <Plus className="w-4 h-4 mr-1" />
                Spacing
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="border rounded-lg p-6 min-h-[400px] focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            style={{ height, fontFamily: selectedFont, fontSize: `${selectedSize}px` }}
            onInput={handleContentChange}
            suppressContentEditableWarning={true}
          />
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <Textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full font-mono text-sm"
            style={{ height }}
            placeholder="Enter your HTML content here..."
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Email Preview
            </div>
            <div className="p-4 bg-white">
              <iframe 
                srcDoc={htmlContent || value}
                className="w-full border-0"
                style={{ height }}
                title="Email Preview"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Dialog */}
      <ImageUploader 
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageInsert={handleImageInsert}
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLinkInsert} disabled={!linkUrl || !linkText}>
                Insert Link
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Insert Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              {EMAIL_TEMPLATES.map((template, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div dangerouslySetInnerHTML={{ __html: template.html }} />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => insertTemplate(template.html)}
                  >
                    Insert Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              '{{verificationCode}}',
              '{{firstName}}',
              '{{lastName}}',
              '{{email}}',
              '{{zipCode}}',
              '{{dashboardUrl}}',
              '{{companyName}}',
              '{{supportEmail}}'
            ].map(variable => (
              <Badge
                key={variable}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => executeCommand('insertHTML', variable)}
              >
                {variable}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}