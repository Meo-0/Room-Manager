import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DoorOpen, Plus, Trash2 } from "lucide-react";
import type { Door } from "@/types/room";

interface DoorConfigProps {
  doors: Door[];
  onDoorsChange: (doors: Door[]) => void;
  roomDimensions: { length: number; width: number; height: number };
}

export default function DoorConfig({ doors, onDoorsChange, roomDimensions }: DoorConfigProps) {
  const addDoor = () => {
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      width: 80,
      height: 200,
      wall: 'north',
      position: 0.5,
      swingDirection: 'inward',
      swingAngle: 90,
      hingePosition: 'left'
    };
    onDoorsChange([...doors, newDoor]);
  };

  const updateDoor = (doorId: string, updates: Partial<Door>) => {
    onDoorsChange(
      doors.map(door => 
        door.id === doorId ? { ...door, ...updates } : door
      )
    );
  };

  const deleteDoor = (doorId: string) => {
    onDoorsChange(doors.filter(door => door.id !== doorId));
  };

  return (
    <div className="p-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
        <DoorOpen className="text-primary mr-2" size={20} />
        문 설정
      </h2>
      
      <div className="space-y-4">
        {doors.map((door, index) => (
          <div key={door.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-text">문 #{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteDoor(door.id)}
                className="text-error hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">너비 (cm)</Label>
                <Input
                  type="number"
                  value={door.width}
                  onChange={(e) => updateDoor(door.id, { width: parseInt(e.target.value) || 80 })}
                  className="text-sm"
                  min="60"
                  max="120"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">높이 (cm)</Label>
                <Input
                  type="number"
                  value={door.height}
                  onChange={(e) => updateDoor(door.id, { height: parseInt(e.target.value) || 200 })}
                  className="text-sm"
                  min="180"
                  max="220"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <Label className="block text-xs font-medium text-gray-700 mb-1">벽면 위치</Label>
              <Select value={door.wall} onValueChange={(value: any) => updateDoor(door.id, { wall: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">북쪽 벽</SelectItem>
                  <SelectItem value="south">남쪽 벽</SelectItem>
                  <SelectItem value="east">동쪽 벽</SelectItem>
                  <SelectItem value="west">서쪽 벽</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <Label className="block text-xs font-medium text-gray-700 mb-2">벽면 내 정확한 위치</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[door.position]}
                    onValueChange={(value) => updateDoor(door.id, { position: value[0] })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(door.position * 100)}
                    onChange={(e) => updateDoor(door.id, { position: (parseInt(e.target.value) || 0) / 100 })}
                    className="w-16 text-xs"
                    min="0"
                    max="100"
                    placeholder="50"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="block text-xs font-medium text-gray-600 mb-1">미터 단위</Label>
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        step="0.1"
                        value={Number((door.position * (door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length)).toFixed(1))}
                        onChange={(e) => {
                          const meters = parseFloat(e.target.value) || 0;
                          const wallLength = door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length;
                          const position = Math.max(0, Math.min(1, meters / wallLength));
                          updateDoor(door.id, { position });
                        }}
                        className="text-xs"
                        min="0"
                        max={door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length}
                      />
                      <span className="text-xs text-gray-500">m</span>
                    </div>
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-600 mb-1">벽 중앙기준</Label>
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        step="0.1"
                        value={Number(((door.position - 0.5) * (door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length)).toFixed(1))}
                        onChange={(e) => {
                          const offsetFromCenter = parseFloat(e.target.value) || 0;
                          const wallLength = door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length;
                          const position = Math.max(0, Math.min(1, 0.5 + offsetFromCenter / wallLength));
                          updateDoor(door.id, { position });
                        }}
                        className="text-xs"
                        min={-(door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length) / 2}
                        max={(door.wall === 'north' || door.wall === 'south' ? roomDimensions.width : roomDimensions.length) / 2}
                      />
                      <span className="text-xs text-gray-500">m</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {door.wall === 'north' || door.wall === 'south' ? 
                    <span>🧭 {door.wall === 'north' ? '북쪽' : '남쪽'} 벽 ({roomDimensions.width}m) - 왼쪽에서 {(door.position * roomDimensions.width).toFixed(1)}m</span> :
                    <span>🧭 {door.wall === 'east' ? '동쪽' : '서쪽'} 벽 ({roomDimensions.length}m) - 위에서 {(door.position * roomDimensions.length).toFixed(1)}m</span>
                  }
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">열림 방향</Label>
                <Select value={door.swingDirection} onValueChange={(value: any) => updateDoor(door.id, { swingDirection: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inward">안쪽으로</SelectItem>
                    <SelectItem value="outward">바깥쪽으로</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">경첩 위치</Label>
                <Select value={door.hingePosition} onValueChange={(value: any) => updateDoor(door.id, { hingePosition: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">왼쪽</SelectItem>
                    <SelectItem value="right">오른쪽</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-2">개폐각도</Label>
              <div className="space-y-2">
                <Slider
                  value={[door.swingAngle]}
                  onValueChange={(value) => updateDoor(door.id, { swingAngle: value[0] })}
                  min={45}
                  max={180}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-gray-600">{door.swingAngle}°</span>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          onClick={addDoor}
          variant="outline"
          className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="mr-2" size={16} />
          문 추가
        </Button>
      </div>
    </div>
  );
}
