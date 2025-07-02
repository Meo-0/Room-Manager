import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { calculateSpaceEfficiency, checkDoorFurnitureInterference, checkFurnitureFurnitureCollision } from "@/lib/geometry";
import type { RoomLayout, InterferenceWarning } from "@/types/room";

interface SpaceAnalysisProps {
  room: RoomLayout;
}

export default function SpaceAnalysis({ room }: SpaceAnalysisProps) {
  const analysis = useMemo(() => {
    const efficiency = calculateSpaceEfficiency(room.furniture, room.dimensions);
    
    const warnings: InterferenceWarning[] = [];
    const suggestions: string[] = [];
    
    // Check door-furniture interference
    room.doors.forEach(door => {
      room.furniture.forEach(furniture => {
        if (checkDoorFurnitureInterference(door, furniture, room.dimensions)) {
          warnings.push({
            id: `door-${door.id}-furniture-${furniture.id}`,
            type: 'door-furniture',
            message: `${furniture.name}이(가) 문 개폐 범위를 방해합니다`,
            severity: 'warning',
            furnitureIds: [furniture.id],
            doorId: door.id
          });
        }
      });
    });
    
    // Check furniture-furniture collisions
    for (let i = 0; i < room.furniture.length; i++) {
      for (let j = i + 1; j < room.furniture.length; j++) {
        const furniture1 = room.furniture[i];
        const furniture2 = room.furniture[j];
        
        if (checkFurnitureFurnitureCollision(furniture1, furniture2)) {
          warnings.push({
            id: `furniture-${furniture1.id}-${furniture2.id}`,
            type: 'furniture-furniture',
            message: `${furniture1.name}과(와) ${furniture2.name}이(가) 겹칩니다`,
            severity: 'error',
            furnitureIds: [furniture1.id, furniture2.id]
          });
        }
      }
    }
    
    // Generate suggestions
    if (efficiency < 60) {
      suggestions.push("공간 활용도가 낮습니다. 더 많은 가구를 배치해보세요.");
    } else if (efficiency > 85) {
      suggestions.push("공간이 너무 꽉 차 있습니다. 동선을 위해 일부 가구를 제거하거나 재배치하세요.");
    }
    
    if (warnings.length > 0) {
      suggestions.push("가구 배치를 조정하여 간섭을 해결하세요.");
    }
    
    if (room.furniture.length === 0) {
      suggestions.push("가구를 추가하여 방을 꾸며보세요.");
    }
    
    // Calculate accessibility score
    let accessibilityScore = 100;
    accessibilityScore -= warnings.filter(w => w.type === 'door-furniture').length * 20;
    accessibilityScore -= warnings.filter(w => w.type === 'furniture-furniture').length * 10;
    accessibilityScore = Math.max(0, accessibilityScore);
    
    return {
      efficiency,
      accessibilityScore,
      warnings,
      suggestions
    };
  }, [room]);

  return (
    <div className="p-6 flex-1">
      <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
        <TrendingUp className="text-primary mr-2" size={20} />
        공간 분석
      </h2>
      
      <div className="space-y-4">
        {/* Space Efficiency */}
        <div className="bg-success/10 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="text-success mr-2" size={16} />
            <span className="font-medium text-success">공간 효율성</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            전체 공간 활용도: {Math.round(analysis.efficiency)}%
          </div>
          <Progress value={analysis.efficiency} className="h-2" />
        </div>
        
        {/* Accessibility Score */}
        <div className={`p-4 rounded-lg ${
          analysis.accessibilityScore >= 80 
            ? 'bg-success/10' 
            : analysis.accessibilityScore >= 60 
              ? 'bg-warning/10' 
              : 'bg-error/10'
        }`}>
          <div className="flex items-center mb-2">
            <CheckCircle 
              className={`mr-2 ${
                analysis.accessibilityScore >= 80 
                  ? 'text-success' 
                  : analysis.accessibilityScore >= 60 
                    ? 'text-warning' 
                    : 'text-error'
              }`} 
              size={16} 
            />
            <span className={`font-medium ${
              analysis.accessibilityScore >= 80 
                ? 'text-success' 
                : analysis.accessibilityScore >= 60 
                  ? 'text-warning' 
                  : 'text-error'
            }`}>
              접근성 점수
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            동선 및 접근성: {Math.round(analysis.accessibilityScore)}점
          </div>
          <Progress value={analysis.accessibilityScore} className="h-2" />
        </div>
        
        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="space-y-2">
            {analysis.warnings.map(warning => (
              <Alert key={warning.id} className={`${
                warning.severity === 'error' 
                  ? 'border-error bg-error/10' 
                  : 'border-warning bg-warning/10'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  warning.severity === 'error' ? 'text-error' : 'text-warning'
                }`} />
                <AlertDescription className="text-sm">
                  {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
        
        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Lightbulb className="text-primary mr-2" size={16} />
              <span className="font-medium text-primary">개선 제안</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Room Statistics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">방 정보</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>크기: {room.dimensions.length}m × {room.dimensions.width}m</div>
            <div>면적: {(room.dimensions.length * room.dimensions.width).toFixed(1)}m²</div>
            <div>가구 개수: {room.furniture.length}개</div>
            <div>문 개수: {room.doors.length}개</div>
          </div>
        </div>
      </div>
    </div>
  );
}
