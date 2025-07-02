import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sofa } from "lucide-react";
import { furnitureTemplates, createFurnitureFromTemplate, getFurnitureCategories } from "@/lib/furniture-templates";
import type { Furniture } from "@/types/room";

interface FurnitureLibraryProps {
  onFurnitureAdd: (furniture: Furniture) => void;
  roomDimensions: { length: number; width: number; height: number };
}

export default function FurnitureLibrary({ onFurnitureAdd, roomDimensions }: FurnitureLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("거실");
  const categories = getFurnitureCategories();

  const handleFurnitureDrop = (templateId: string) => {
    const template = furnitureTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Place furniture at center of room initially
    const roomCenterX = (roomDimensions.width * 100) / 2 - template.defaultWidth / 2;
    const roomCenterY = (roomDimensions.length * 100) / 2 - template.defaultDepth / 2;

    const newFurniture = createFurnitureFromTemplate(template, {
      x: Math.max(0, roomCenterX),
      y: Math.max(0, roomCenterY)
    });

    onFurnitureAdd(newFurniture);
  };

  const filteredTemplates = furnitureTemplates.filter(
    template => template.category === selectedCategory
  );

  return (
    <div className="p-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
        <Sofa className="text-primary mr-2" size={20} />
        가구 라이브러리
      </h2>
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.slice(0, 3).map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {filteredTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="p-3 h-auto flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() => handleFurnitureDrop(template.id)}
                >
                  <div 
                    className="text-xl mb-1"
                    style={{ color: template.color }}
                  >
                    <i className={template.icon}></i>
                  </div>
                  <div className="text-xs font-medium text-center">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.defaultWidth}×{template.defaultDepth}cm
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {categories.length > 3 && (
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-700 mb-2">기타 카테고리</div>
          <div className="flex flex-wrap gap-1">
            {categories.slice(3).map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
