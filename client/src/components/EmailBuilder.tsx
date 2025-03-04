import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, MoveUp, MoveDown, Eye } from 'lucide-react';

type BlockType = 'header' | 'text' | 'button' | 'spacer';

interface EmailBlock {
  id: string;
  type: BlockType;
  content: {
    text?: string;
    size?: string;
    url?: string;
    height?: string;
    align?: 'left' | 'center' | 'right';
  };
}

interface EmailBuilderProps {
  defaultTemplate?: {
    subject?: string;
    blocks?: EmailBlock[];
  };
  onSave: (template: { html: string; text: string; subject: string }) => void;
}

export function EmailBuilder({ defaultTemplate, onSave }: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(defaultTemplate?.blocks || []);
  const [showPreview, setShowPreview] = useState(false);
  const [subject, setSubject] = useState(defaultTemplate?.subject || '');

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: {}
    }]);
  };

  const updateBlock = (id: string, content: Partial<EmailBlock['content']>) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content: { ...block.content, ...content } } : block
    ));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if ((direction === 'up' && index === 0) ||
        (direction === 'down' && index === blocks.length - 1)) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const generateHTML = () => {
    const styles = `
      .email-container {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        font-weight: bold;
        margin-bottom: 20px;
      }
      .text {
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .button {
        background-color: #22c55e;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
      }
      .spacer {
        height: 20px;
      }
    `;

    const html = blocks.map(block => {
      switch (block.type) {
        case 'header':
          return `
            <div class="header" style="font-size: ${block.content.size || '24px'}; text-align: ${block.content.align || 'left'}">
              ${block.content.text || ''}
            </div>
          `;
        case 'text':
          return `
            <div class="text" style="text-align: ${block.content.align || 'left'}">
              ${block.content.text || ''}
            </div>
          `;
        case 'button':
          return `
            <div style="text-align: ${block.content.align || 'left'}; margin: 20px 0;">
              <a href="${block.content.url || '#'}" class="button">
                ${block.content.text || 'Click here'}
              </a>
            </div>
          `;
        case 'spacer':
          return `
            <div class="spacer" style="height: ${block.content.height || '20px'};"></div>
          `;
        default:
          return '';
      }
    }).join('');

    return `
      <style>${styles}</style>
      <div class="email-container">
        ${html}
      </div>
    `;
  };

  const generatePlainText = () => {
    return blocks.map(block => {
      switch (block.type) {
        case 'header':
          return `${block.content.text}\n\n`;
        case 'text':
          return `${block.content.text}\n\n`;
        case 'button':
          return `${block.content.text} (${block.content.url})\n\n`;
        case 'spacer':
          return '\n';
        default:
          return '';
      }
    }).join('');
  };

  const handleSave = () => {
    onSave({
      subject,
      html: generateHTML(),
      text: generatePlainText()
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Email Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button onClick={() => addBlock('header')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Header
            </Button>
            <Button onClick={() => addBlock('text')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button onClick={() => addBlock('button')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Button
            </Button>
            <Button onClick={() => addBlock('spacer')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Spacer
            </Button>
          </div>
          <div className="space-x-2">
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <Card key={block.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                </CardTitle>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {block.type !== 'spacer' && (
                  <div className="space-y-4">
                    {(block.type === 'header' || block.type === 'text' || block.type === 'button') && (
                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Textarea
                          value={block.content.text || ''}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        />
                      </div>
                    )}
                    {block.type === 'header' && (
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={block.content.size || '24px'}
                          onValueChange={(value) => updateBlock(block.id, { size: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20px">Small</SelectItem>
                            <SelectItem value="24px">Medium</SelectItem>
                            <SelectItem value="32px">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {block.type === 'button' && (
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={block.content.url || ''}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                        />
                      </div>
                    )}
                    {block.type === 'spacer' && (
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Select
                          value={block.content.height || '20px'}
                          onValueChange={(value) => updateBlock(block.id, { height: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10px">Small</SelectItem>
                            <SelectItem value="20px">Medium</SelectItem>
                            <SelectItem value="40px">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Alignment</Label>
                      <Select
                        value={block.content.align || 'left'}
                        onValueChange={(value) => updateBlock(block.id, { align: value as 'left' | 'center' | 'right' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {showPreview && (
          <div className="border rounded-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
          </div>
        )}
      </div>
    </div>
  );
}