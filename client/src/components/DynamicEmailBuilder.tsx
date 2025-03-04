import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import type { ContentBlock, Variable } from "@db/schema";
import { apiRequest } from "@/lib/queryClient";

const BLOCK_TYPES = [
  { value: "text", label: "Text Block" },
  { value: "image", label: "Image" },
  { value: "button", label: "Button" },
  { value: "spacer", label: "Spacer" },
  { value: "divider", label: "Divider" },
];

type DynamicEmailBuilderProps = {
  initialTemplate?: {
    id?: number;
    name: string;
    subject: string;
    html_content: string;
    content_blocks?: ContentBlock[];
    variables?: Variable[];
  };
  onSave?: () => void;
};

export function DynamicEmailBuilder({ initialTemplate, onSave }: DynamicEmailBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialTemplate?.name || "");
  const [subject, setSubject] = useState(initialTemplate?.subject || "");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    initialTemplate?.content_blocks || []
  );
  const [variables, setVariables] = useState<Variable[]>(
    initialTemplate?.variables || []
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        subject,
        html_content: generateHtmlContent(),
        content_blocks: contentBlocks,
        variables,
      };

      const response = await apiRequest(
        initialTemplate?.id ? "PATCH" : "POST",
        `/api/email-templates${initialTemplate?.id ? `/${initialTemplate.id}` : ""}`,
        payload
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Template ${initialTemplate?.id ? "updated" : "created"} successfully`,
      });
      onSave?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      });
    },
  });

  const generateHtmlContent = () => {
    return contentBlocks
      .map((block) => {
        switch (block.type) {
          case "text":
            return `<div style="${generateStyles(block.styles)}">${block.content}</div>`;
          case "image":
            return `<img src="${block.content}" style="${generateStyles(block.styles)}" />`;
          case "button":
            return `<a href="${block.settings?.url || '#'}" style="${generateStyles(
              block.styles
            )}">${block.content}</a>`;
          case "spacer":
            return `<div style="height: ${block.settings?.height || '20px'}"></div>`;
          case "divider":
            return `<hr style="${generateStyles(block.styles)}" />`;
          default:
            return "";
        }
      })
      .join("\n");
  };

  const generateStyles = (styles?: Record<string, string>) => {
    if (!styles) return "";
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(contentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContentBlocks(items);
  };

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      styles: {},
      settings: {},
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlockContent = (index: number, content: string) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = { ...newBlocks[index], content };
    setContentBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const addVariable = () => {
    const newVariable: Variable = {
      name: `variable-${variables.length + 1}`,
      defaultValue: "",
      description: "",
    };
    setVariables([...variables, newVariable]);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
          />
        </div>

        <div className="space-y-2">
          <Label>Variables</Label>
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={variable.name}
                  onChange={(e) =>
                    setVariables(
                      variables.map((v, i) =>
                        i === index ? { ...v, name: e.target.value } : v
                      )
                    )
                  }
                  placeholder="Variable name"
                />
                <Input
                  value={variable.defaultValue}
                  onChange={(e) =>
                    setVariables(
                      variables.map((v, i) =>
                        i === index ? { ...v, defaultValue: e.target.value } : v
                      )
                    )
                  }
                  placeholder="Default value"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addVariable} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <Label>Content Blocks</Label>
            <Select onValueChange={(value) => addContentBlock(value as ContentBlock["type"])}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add content block" />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="content-blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {contentBlocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>{BLOCK_TYPES.find(t => t.value === block.type)?.label}</Label>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBlock(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {block.type === "text" ? (
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(index, e.target.value)}
                                  placeholder="Enter text content"
                                />
                              ) : block.type === "image" ? (
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(index, e.target.value)}
                                  placeholder="Enter image URL"
                                />
                              ) : block.type === "button" ? (
                                <div className="space-y-2">
                                  <Input
                                    value={block.content}
                                    onChange={(e) => updateBlockContent(index, e.target.value)}
                                    placeholder="Button text"
                                  />
                                  <Input
                                    value={block.settings?.url || ""}
                                    onChange={(e) =>
                                      setContentBlocks(
                                        contentBlocks.map((b, i) =>
                                          i === index
                                            ? {
                                                ...b,
                                                settings: { ...b.settings, url: e.target.value },
                                              }
                                            : b
                                        )
                                      )
                                    }
                                    placeholder="Button URL"
                                  />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !name || !subject}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Template"
          )}
        </Button>
      </div>
    </div>
  );
}
