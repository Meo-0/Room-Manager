import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RoomConfig from "@/components/room-config";
import DoorConfig from "@/components/door-config";
import RoomCanvas from "@/components/room-canvas";
import FurnitureLibrary from "@/components/furniture-library";
import FurnitureProperties from "@/components/furniture-properties";
import SpaceAnalysis from "@/components/space-analysis";
import type { RoomLayout, Furniture, Door } from "@/types/room";
import { Save, Share2, Home as HomeIcon } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentRoom, setCurrentRoom] = useState<RoomLayout>({
    name: "새 방",
    dimensions: { length: 4.5, width: 3.5, height: 2.4 },
    doors: [],
    furniture: []
  });
  
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Keep selectedFurniture in sync with currentRoom.furniture
  useEffect(() => {
    if (selectedFurniture) {
      const updatedFurniture = currentRoom.furniture.find(f => f.id === selectedFurniture.id);
      if (updatedFurniture && 
          (updatedFurniture.x !== selectedFurniture.x || 
           updatedFurniture.y !== selectedFurniture.y ||
           updatedFurniture.width !== selectedFurniture.width ||
           updatedFurniture.depth !== selectedFurniture.depth ||
           updatedFurniture.rotation !== selectedFurniture.rotation)) {
        setSelectedFurniture(updatedFurniture);
      }
    }
  }, [currentRoom.furniture, selectedFurniture]);

  // Save room mutation
  const saveRoomMutation = useMutation({
    mutationFn: async (room: RoomLayout) => {
      const response = await apiRequest("POST", "/api/rooms", {
        name: room.name,
        length: room.dimensions.length,
        width: room.dimensions.width,
        height: room.dimensions.height,
        doors: room.doors,
        furniture: room.furniture,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentRoom(prev => ({ ...prev, id: data.id }));
      toast({
        title: "저장 완료",
        description: "방 레이아웃이 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "방 레이아웃 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleRoomDimensionsChange = (dimensions: { length: number; width: number; height: number }) => {
    setCurrentRoom(prev => ({ ...prev, dimensions }));
  };

  const handleDoorsChange = (doors: Door[]) => {
    setCurrentRoom(prev => ({ ...prev, doors }));
  };

  const handleDoorUpdate = (doorId: string, updates: Partial<Door>) => {
    setCurrentRoom(prev => ({
      ...prev,
      doors: prev.doors.map(door => 
        door.id === doorId ? { ...door, ...updates } : door
      )
    }));
  };

  const handleFurnitureChange = (furniture: Furniture[]) => {
    setCurrentRoom(prev => ({ ...prev, furniture }));
  };

  const handleFurnitureAdd = (newFurniture: Furniture) => {
    setCurrentRoom(prev => ({
      ...prev,
      furniture: [...prev.furniture, newFurniture]
    }));
  };

  const handleFurnitureUpdate = (updatedFurniture: Furniture) => {
    setCurrentRoom(prev => ({
      ...prev,
      furniture: prev.furniture.map(item => 
        item.id === updatedFurniture.id ? updatedFurniture : item
      )
    }));
    
    // Update selected furniture if it's the same item
    if (selectedFurniture?.id === updatedFurniture.id) {
      setSelectedFurniture(updatedFurniture);
    }
  };

  const handleFurnitureDelete = (furnitureId: string) => {
    setCurrentRoom(prev => ({
      ...prev,
      furniture: prev.furniture.filter(item => item.id !== furnitureId)
    }));
    if (selectedFurniture?.id === furnitureId) {
      setSelectedFurniture(null);
    }
  };

  const handleSave = () => {
    saveRoomMutation.mutate(currentRoom);
  };

  const handleShare = () => {
    // Implement sharing functionality
    toast({
      title: "공유 기능",
      description: "공유 기능은 현재 개발 중입니다.",
    });
  };

  const handleAutoArrange = () => {
    toast({
      title: "자동 배치",
      description: "자동 배치 기능은 현재 개발 중입니다.",
    });
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <HomeIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">스마트 레이아웃 플래너</h1>
              <p className="text-sm text-gray-600">방 구조 설계 및 가구 배치 도구</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleSave}
              disabled={saveRoomMutation.isPending}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Save className="mr-2" size={16} />
              저장
            </Button>
            <Button 
              onClick={handleShare}
              className="bg-accent hover:bg-accent/90"
            >
              <Share2 className="mr-2" size={16} />
              공유
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-border flex flex-col">
          <RoomConfig
            dimensions={currentRoom.dimensions}
            onDimensionsChange={handleRoomDimensionsChange}
          />
          
          <DoorConfig
            doors={currentRoom.doors}
            onDoorsChange={handleDoorsChange}
            roomDimensions={currentRoom.dimensions}
          />
          
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">빠른 작업</h3>
            <div className="space-y-2">
              <Button 
                onClick={handleAutoArrange}
                className="w-full bg-primary hover:bg-primary/90 text-sm"
              >
                ✨ 자동 배치 제안
              </Button>
              <Button 
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  // Implement undo functionality
                  toast({ title: "되돌리기", description: "되돌리기 기능은 현재 개발 중입니다." });
                }}
              >
                ↶ 되돌리기
              </Button>
              <Button 
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  // Implement traffic analysis
                  toast({ title: "동선 분석", description: "동선 분석 기능은 현재 개발 중입니다." });
                }}
              >
                👁 동선 분석
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Canvas Toolbar */}
          <div className="bg-white border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">확대/축소:</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                  >
                    🔍-
                  </Button>
                  <span className="text-sm text-gray-600">{zoomLevel}%</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                  >
                    🔍+
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">격자:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGridVisible(!isGridVisible)}
                    className={isGridVisible ? "bg-primary text-white" : ""}
                  >
                    {isGridVisible ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 bg-white rounded text-sm font-medium text-primary shadow-sm">2D</button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-primary">3D</button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-border h-full">
              <RoomCanvas
                room={currentRoom}
                selectedFurniture={selectedFurniture}
                onFurnitureSelect={setSelectedFurniture}
                onFurnitureUpdate={handleFurnitureUpdate}
                onFurnitureAdd={handleFurnitureAdd}
                onDoorUpdate={handleDoorUpdate}
                isGridVisible={isGridVisible}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-white border-l border-border flex flex-col">
          <FurnitureLibrary
            onFurnitureAdd={handleFurnitureAdd}
            roomDimensions={currentRoom.dimensions}
          />
          
          <FurnitureProperties
            key={selectedFurniture?.id || 'no-selection'}
            furniture={selectedFurniture}
            onFurnitureUpdate={handleFurnitureUpdate}
            onFurnitureDelete={handleFurnitureDelete}
          />
          
          <SpaceAnalysis
            room={currentRoom}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <Button
          size="icon"
          className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full shadow-lg"
          onClick={() => {
            toast({ title: "도움말", description: "도움말 기능은 현재 개발 중입니다." });
          }}
        >
          ❓
        </Button>
        <Button
          size="icon"
          className="w-14 h-14 bg-accent hover:bg-accent/90 rounded-full shadow-lg"
          onClick={() => {
            toast({ title: "새 프로젝트", description: "새 프로젝트 기능은 현재 개발 중입니다." });
          }}
        >
          ➕
        </Button>
      </div>
    </div>
  );
}
