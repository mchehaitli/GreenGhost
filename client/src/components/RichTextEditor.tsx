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
  Save
} from 'lucide-react';

interface RichTextEditorProps {
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
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
];

const FONT_SIZES = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
  { value: '48px', label: '48px' }
];

const COLOR_PALETTE = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
  '#FF0066', '#FF6600', '#FFFF00', '#66FF00', '#00FFFF', '#6666FF',
  '#FF3366', '#FF9900', '#CCFF00', '#00FF66', '#0099FF', '#9900FF'
];

export function RichTextEditor({ value, onChange, placeholder, height = '300px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif');
  const [selectedSize, setSelectedSize] = useState('16px');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlContent, setHtmlContent] = useState(value);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      editorRef.current.innerHTML = value;
    }
  }, [value, activeTab]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    executeCommand('fontName', font);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    executeCommand('fontSize', '3');
    // Apply custom size through CSS
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
      } catch (e) {
        // Fallback for complex selections
        span.innerHTML = range.toString();
        range.deleteContents();
        range.insertNode(span);
      }
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    executeCommand('foreColor', color);
  };

  const handleImageInsert = () => {
    if (imageUrl) {
      executeCommand('insertImage', imageUrl);
      setImageUrl('');
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${linkText}</a>`;
      executeCommand('insertHTML', linkHtml);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      onChange(content);
    }
  };

  const insertEmailTemplate = (template: string) => {
    executeCommand('insertHTML', template);
  };

  const emailTemplates = [
    {
      name: 'Header',
      html: `<div style="background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">GreenGhost</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Premium Lawn Care Services</p>
      </div>`
    },
    {
      name: 'Footer',
      html: `<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; margin-top: 20px;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          © 2025 GreenGhost. All rights reserved.<br>
          <a href="mailto:support@greenghost.io" style="color: #22c55e;">support@greenghost.io</a>
        </p>
      </div>`
    },
    {
      name: 'Button',
      html: `<div style="text-align: center; margin: 20px 0;">
        <a href="#" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Get Started
        </a>
      </div>`
    },
    {
      name: 'Divider',
      html: `<div style="margin: 20px 0; border-bottom: 1px solid #e5e7eb;"></div>`
    }
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="html">HTML Code</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          {/* Toolbar */}
          <div className="border rounded-lg p-3 space-y-3">
            {/* Font Controls */}
            <div className="flex flex-wrap gap-2 items-center">
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

              <Select value={selectedSize} onValueChange={handleSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

              {/* Text Formatting */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('bold')}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('italic')}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('underline')}
              >
                <Underline className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Alignment */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('justifyLeft')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('justifyCenter')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('justifyRight')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('insertUnorderedList')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('insertOrderedList')}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Text Color</Label>
              <div className="flex flex-wrap gap-1">
                {COLOR_PALETTE.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>

            {/* Image & Link Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Insert Image</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImageInsert}
                    disabled={!imageUrl}
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Insert Link</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Link text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLinkInsert}
                    disabled={!linkUrl || !linkText}
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Components</Label>
              <div className="flex flex-wrap gap-2">
                {emailTemplates.map(template => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => insertEmailTemplate(template.html)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="border rounded-lg p-4 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ height }}
            onInput={handleContentChange}
            suppressContentEditableWarning={true}
          />
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full border rounded-lg p-4 font-mono text-sm"
            style={{ height }}
            placeholder="Enter your HTML content here..."
          />
        </TabsContent>
      </Tabs>

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
              '{{dashboardUrl}}'
            ].map(variable => (
              <Badge
                key={variable}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
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