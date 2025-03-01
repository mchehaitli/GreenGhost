import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Layout, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Ruler,
  Text
} from 'lucide-react';

interface StyleSettings {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  spacing: number;
  alignment: 'left' | 'center' | 'right';
  layout: 'single-column' | 'two-column';
}

interface EmailTemplateCustomizerProps {
  onStyleChange: (styles: StyleSettings) => void;
  initialStyles?: Partial<StyleSettings>;
}

export function EmailTemplateCustomizer({ 
  onStyleChange,
  initialStyles = {}
}: EmailTemplateCustomizerProps) {
  const [styles, setStyles] = useState<StyleSettings>({
    primaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    fontSize: 16,
    spacing: 20,
    alignment: 'left',
    layout: 'single-column',
    ...initialStyles
  });

  const handleStyleChange = <K extends keyof StyleSettings>(
    key: K,
    value: StyleSettings[K]
  ) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onStyleChange(newStyles);
  };

  return (
    <Card className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Template Customization
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="text-sm">Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={styles.primaryColor}
                  onChange={(e) => handleStyleChange('primaryColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={styles.primaryColor}
                  onChange={(e) => handleStyleChange('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={styles.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={styles.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Text Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={styles.textColor}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={styles.textColor}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Text className="w-4 h-4" />
            Font Size
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <Slider
              value={[styles.fontSize]}
              onValueChange={([value]) => handleStyleChange('fontSize', value)}
              min={12}
              max={24}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {styles.fontSize}px
            </span>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Spacing
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <Slider
              value={[styles.spacing]}
              onValueChange={([value]) => handleStyleChange('spacing', value)}
              min={10}
              max={40}
              step={2}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {styles.spacing}px
            </span>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text Alignment
          </Label>
          <div className="flex gap-2 mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={styles.alignment === 'left' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleStyleChange('alignment', 'left')}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={styles.alignment === 'center' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleStyleChange('alignment', 'center')}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={styles.alignment === 'right' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleStyleChange('alignment', 'right')}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </Label>
          <Select
            value={styles.layout}
            onValueChange={(value) => 
              handleStyleChange('layout', value as 'single-column' | 'two-column')
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-column">Single Column</SelectItem>
              <SelectItem value="two-column">Two Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}