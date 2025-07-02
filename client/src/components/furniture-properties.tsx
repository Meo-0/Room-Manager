import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Trash2, Edit, Maximize2 } from "lucide-react";
import type { Furniture } from "@/types/room";

interface FurniturePropertiesProps {
  furniture: Furniture | null;
  onFurnitureUpdate: (furniture: Furniture) => void;
  onFurnitureDelete: (furnitureId: string) => void;
}

export default function FurnitureProperties({ 
  furniture, 
  onFurnitureUpdate, 
  onFurnitureDelete 
}: FurniturePropertiesProps) {
  if (!furniture) {
    return (
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
          <Settings className="text-primary mr-2" size={20} />
          선택된 가구
        </h2>
        <div className="text-sm text-gray-500 text-center py-8">
          가구를 선택하여 속성을 편집하세요
        </div>
      </div>
    );
  }

  const handleUpdate = (field: keyof Furniture, value: any) => {
    const updatedFurniture = { ...furniture, [field]: value };
    onFurnitureUpdate(updatedFurniture);
  };

  const handleRotation = (angle: number) => {
    handleUpdate('rotation', angle);
  };

  return (
    <div className="p-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
        <Settings className="text-primary mr-2" size={20} />
        선택된 가구
      </h2>
      
      <div className="space-y-4">
        <div 
          className="p-4 rounded-lg border-2"
          style={{ 
            backgroundColor: `${furniture.color}20`,
            borderColor: furniture.color 
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium" style={{ color: furniture.color }}>
              {furniture.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFurnitureDelete(furniture.id)}
              className="text-error hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">가구 이름</Label>
              <Input
                type="text"
                value={furniture.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Maximize2 className="text-primary" size={14} />
                <span className="text-xs font-medium text-gray-700">크기 조정</span>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="block text-xs font-medium text-gray-700">너비</Label>
                  <span className="text-xs text-gray-600">{furniture.width}cm</span>
                </div>
                <Slider
                  value={[furniture.width]}
                  onValueChange={(value) => handleUpdate('width', value[0])}
                  min={20}
                  max={400}
                  step={5}
                  className="mb-2"
                />
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={furniture.width}
                    onChange={(e) => handleUpdate('width', Math.max(20, Math.min(400, parseInt(e.target.value) || 20)))}
                    className="text-xs flex-1"
                    min="20"
                    max="400"
                    step="5"
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => onFurnitureUpdate({ ...furniture, width: Math.max(20, furniture.width - 10) })}
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => onFurnitureUpdate({ ...furniture, width: Math.min(400, furniture.width + 10) })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="block text-xs font-medium text-gray-700">깊이</Label>
                  <span className="text-xs text-gray-600">{furniture.depth}cm</span>
                </div>
                <Slider
                  value={[furniture.depth]}
                  onValueChange={(value) => handleUpdate('depth', value[0])}
                  min={20}
                  max={400}
                  step={5}
                  className="mb-2"
                />
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={furniture.depth}
                    onChange={(e) => handleUpdate('depth', Math.max(20, Math.min(400, parseInt(e.target.value) || 20)))}
                    className="text-xs flex-1"
                    min="20"
                    max="400"
                    step="5"
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => onFurnitureUpdate({ ...furniture, depth: Math.max(20, furniture.depth - 10) })}
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => onFurnitureUpdate({ ...furniture, depth: Math.min(400, furniture.depth + 10) })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    const newWidth = Math.max(20, Math.round(furniture.width * 0.8));
                    const newDepth = Math.max(20, Math.round(furniture.depth * 0.8));
                    onFurnitureUpdate({ ...furniture, width: newWidth, depth: newDepth });
                  }}
                >
                  작게
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    const template = furniture.type === 'sofa' ? { width: 200, depth: 90 } :
                                   furniture.type === 'bed' ? { width: 150, depth: 200 } :
                                   furniture.type === 'table' ? { width: 120, depth: 80 } :
                                   { width: 100, depth: 60 };
                    onFurnitureUpdate({ ...furniture, width: template.width, depth: template.depth });
                  }}
                >
                  기본
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    const newWidth = Math.min(400, Math.round(furniture.width * 1.2));
                    const newDepth = Math.min(400, Math.round(furniture.depth * 1.2));
                    onFurnitureUpdate({ ...furniture, width: newWidth, depth: newDepth });
                  }}
                >
                  크게
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">높이 (cm)</Label>
              <Input
                type="number"
                value={furniture.height}
                onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 0)}
                className="text-sm"
                min="10"
                max="300"
              />
            </div>
            
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">모양</Label>
              <Select value={furniture.shape} onValueChange={(value: any) => handleUpdate('shape', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">직사각형</SelectItem>
                  <SelectItem value="circle">원형</SelectItem>
                  <SelectItem value="l-shape">L자형</SelectItem>
                  <SelectItem value="custom">커스텀</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-2">회전각도</Label>
              <div className="flex space-x-1">
                {[0, 90, 180, 270].map(angle => (
                  <Button
                    key={angle}
                    variant={furniture.rotation === angle ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleRotation(angle)}
                  >
                    {angle}°
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">X 위치 (cm)</Label>
                <Input
                  type="number"
                  value={Math.round(furniture.x)}
                  onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
                  className="text-sm"
                  min="0"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">Y 위치 (cm)</Label>
                <Input
                  type="number"
                  value={Math.round(furniture.y)}
                  onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
                  className="text-sm"
                  min="0"
                />
              </div>
            </div>
            
            {furniture.shape === 'custom' && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => {
                    // Implement custom shape drawing
                    alert("커스텀 모양 그리기 기능은 현재 개발 중입니다.");
                  }}
                >
                  <Edit className="mr-2" size={14} />
                  커스텀 모양 그리기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
