import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TAGS = [
  { name: "דחוף", color: "#EF4444" },
  { name: "עסקי", color: "#3B82F6" },
  { name: "אישי", color: "#8B5CF6" },
  { name: "מתנה", color: "#EC4899" },
  { name: "חד-פעמי", color: "#F59E0B" },
  { name: "השקעה", color: "#10B981" },
  { name: "חירום", color: "#EF4444" },
  { name: "משפחה", color: "#06B6D4" },
  { name: "בריאות", color: "#EC4899" },
  { name: "חינוך", color: "#8B5CF6" },
];

interface TagsManagerProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: { name: string; color: string }[];
}

export default function TagsManager({ 
  selectedTags = [], 
  onChange, 
  availableTags = DEFAULT_TAGS 
}: TagsManagerProps) {
  const [open, setOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onChange([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Tag className="w-4 h-4 ml-2" />
            {selectedTags.length === 0 ? (
              <span className="text-muted-foreground">הוסף תגיות...</span>
            ) : (
              <div className="flex gap-1 flex-wrap">
                {selectedTags.slice(0, 3).map((tag) => {
                  const tagData = availableTags.find((t) => t.name === tag);
                  return (
                    <Badge
                      key={tag}
                      style={{ backgroundColor: tagData?.color || "#6B7280" }}
                      className="text-white"
                    >
                      {tag}
                    </Badge>
                  );
                })}
                {selectedTags.length > 3 && (
                  <Badge variant="secondary">+{selectedTags.length - 3}</Badge>
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                בחר תגיות
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <Badge
                      key={tag.name}
                      style={{
                        backgroundColor: isSelected ? tag.color : "transparent",
                        color: isSelected ? "white" : tag.color,
                        borderColor: tag.color,
                      }}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105 border-2",
                        isSelected && "shadow-md"
                      )}
                      onClick={() => toggleTag(tag.name)}
                    >
                      {isSelected && <Check className="w-3 h-3 ml-1" />}
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">תגית מותאמת</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="הקלד תגית..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addCustomTag();
                    }
                  }}
                />
                <Button size="sm" onClick={addCustomTag} disabled={!customTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          {selectedTags.map((tag) => {
            const tagData = availableTags.find((t) => t.name === tag);
            return (
              <Badge
                key={tag}
                style={{ backgroundColor: tagData?.color || "#6B7280" }}
                className="text-white pr-1"
              >
                {tag}
                <button
                  onClick={(e) => removeTag(tag, e)}
                  className="mr-1 hover:bg-white/20 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export tags list for use in filters
export { DEFAULT_TAGS };
