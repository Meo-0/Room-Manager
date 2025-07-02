import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";

interface RoomConfigProps {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  onDimensionsChange: (dimensions: { length: number; width: number; height: number }) => void;
}

export default function RoomConfig({ dimensions, onDimensionsChange }: RoomConfigProps) {
  const handleChange = (field: keyof typeof dimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    onDimensionsChange({
      ...dimensions,
      [field]: numValue
    });
  };

  return (
    <div className="p-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
        <Ruler className="text-primary mr-2" size={20} />
        방 크기 설정
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">길이 (m)</Label>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={dimensions.length}
              onChange={(e) => handleChange('length', e.target.value)}
              placeholder="4.5"
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">너비 (m)</Label>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={dimensions.width}
              onChange={(e) => handleChange('width', e.target.value)}
              placeholder="3.5"
              className="focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">높이 (m)</Label>
          <Input
            type="number"
            step="0.1"
            min="2"
            max="5"
            value={dimensions.height}
            onChange={(e) => handleChange('height', e.target.value)}
            placeholder="2.4"
            className="focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
