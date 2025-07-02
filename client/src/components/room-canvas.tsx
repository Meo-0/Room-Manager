import { useRef, useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RotateCw } from "lucide-react";
import { getDoorSwingPath, getFurnitureCorners, checkDoorFurnitureInterference } from "@/lib/geometry";
import type { RoomLayout, Furniture, Point, DragState } from "@/types/room";

interface RoomCanvasProps {
  room: RoomLayout;
  selectedFurniture: Furniture | null;
  onFurnitureSelect: (furniture: Furniture | null) => void;
  onFurnitureUpdate: (furniture: Furniture) => void;
  onFurnitureAdd: (furniture: Furniture) => void;
  onDoorUpdate?: (doorId: string, updates: Partial<import("@/types/room").Door>) => void;
  isGridVisible: boolean;
  zoomLevel: number;
}

export default function RoomCanvas({
  room,
  selectedFurniture,
  onFurnitureSelect,
  onFurnitureUpdate,
  onDoorUpdate,
  isGridVisible,
  zoomLevel
}: RoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    offset: { x: 0, y: 0 }
  });
  const [isDraggingDoor, setIsDraggingDoor] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<{
    furnitureId: string;
    handle: 'width' | 'depth' | 'both';
    startSize: { width: number; depth: number };
    startMouse: Point;
  } | null>(null);
  
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('default');
  const [warnings, setWarnings] = useState<string[]>([]);

  const scale = zoomLevel / 100;
  const pixelsPerMeter = 50 * scale; // 50 pixels per meter at 100% zoom
  const roomWidthPx = room.dimensions.width * pixelsPerMeter;
  const roomLengthPx = room.dimensions.length * pixelsPerMeter;

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!isGridVisible) return;

      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;

      const gridSize = 20 * scale;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    [isGridVisible, scale]
  );

  const drawRoom = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const offsetX = (ctx.canvas.width - roomWidthPx) / 2;
      const offsetY = (ctx.canvas.height - roomLengthPx) / 2;

      // Draw room walls
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 4 * scale;
      ctx.strokeRect(offsetX, offsetY, roomWidthPx, roomLengthPx);

      // Fill room
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(offsetX, offsetY, roomWidthPx, roomLengthPx);

      return { offsetX, offsetY };
    },
    [roomWidthPx, roomLengthPx, scale]
  );

  const drawDoors = useCallback(
    (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      room.doors.forEach(door => {
        // Calculate door position on wall
        let doorX = offsetX, doorY = offsetY;
        let doorWidth = (door.width / 100) * pixelsPerMeter;
        let doorHeight = 4 * scale; // Visual thickness

        switch (door.wall) {
          case 'north':
            doorX += door.position * roomWidthPx - doorWidth / 2;
            doorY -= doorHeight / 2;
            break;
          case 'south':
            doorX += door.position * roomWidthPx - doorWidth / 2;
            doorY += roomLengthPx - doorHeight / 2;
            break;
          case 'east':
            doorX += roomWidthPx - doorHeight / 2;
            doorY += door.position * roomLengthPx - doorWidth / 2;
            [doorWidth, doorHeight] = [doorHeight, doorWidth]; // Swap for vertical door
            break;
          case 'west':
            doorX -= doorHeight / 2;
            doorY += door.position * roomLengthPx - doorWidth / 2;
            [doorWidth, doorHeight] = [doorHeight, doorWidth]; // Swap for vertical door
            break;
        }

        // Draw door
        ctx.fillStyle = isDraggingDoor === door.id ? "#4CAF50" : "#1976D2";
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        // Draw door handle for dragging
        ctx.fillStyle = isDraggingDoor === door.id ? "#388E3C" : "#0D47A1";
        const handleSize = 6 * scale;
        ctx.fillRect(
          doorX + doorWidth / 2 - handleSize / 2, 
          doorY + doorHeight / 2 - handleSize / 2, 
          handleSize, 
          handleSize
        );

        // Draw door swing arc
        const swingPath = getDoorSwingPath(door, room.dimensions);
        if (swingPath.length > 0) {
          ctx.strokeStyle = "#1976D2";
          ctx.lineWidth = 1 * scale;
          ctx.setLineDash([3 * scale, 3 * scale]);
          ctx.globalAlpha = 0.6;

          ctx.beginPath();
          swingPath.forEach((point, index) => {
            const x = offsetX + (point.x / 100) * pixelsPerMeter;
            const y = offsetY + (point.y / 100) * pixelsPerMeter;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      });
    },
    [room.doors, room.dimensions, pixelsPerMeter, roomWidthPx, roomLengthPx, scale]
  );

  const drawFurniture = useCallback(
    (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      room.furniture.forEach(furniture => {
        const x = offsetX + (furniture.x / 100) * pixelsPerMeter;
        const y = offsetY + (furniture.y / 100) * pixelsPerMeter;
        const width = (furniture.width / 100) * pixelsPerMeter;
        const height = (furniture.depth / 100) * pixelsPerMeter;

        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((furniture.rotation * Math.PI) / 180);

        // Draw furniture based on shape
        if (furniture.shape === 'circle') {
          const radius = Math.max(width, height) / 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, 2 * Math.PI);
          ctx.fillStyle = furniture.color ? `${furniture.color}33` : "#FF572233";
          ctx.fill();
          ctx.strokeStyle = furniture.color || "#FF5722";
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        } else if (furniture.shape === 'l-shape') {
          // Draw L-shape
          const w = width;
          const h = height;
          const w2 = w * 0.6;
          const h2 = h * 0.6;

          ctx.fillStyle = furniture.color ? `${furniture.color}33` : "#FF572233";
          ctx.strokeStyle = furniture.color || "#FF5722";
          ctx.lineWidth = 2 * scale;

          ctx.beginPath();
          ctx.moveTo(-w / 2, -h / 2);
          ctx.lineTo(-w / 2 + w2, -h / 2);
          ctx.lineTo(-w / 2 + w2, -h / 2 + h - h2);
          ctx.lineTo(w / 2, -h / 2 + h - h2);
          ctx.lineTo(w / 2, h / 2);
          ctx.lineTo(-w / 2, h / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Rectangle (default)
          ctx.fillStyle = furniture.color ? `${furniture.color}33` : "#FF572233";
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.strokeStyle = furniture.color || "#FF5722";
          ctx.lineWidth = 2 * scale;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        }

        // Draw furniture label
        ctx.fillStyle = furniture.color || "#FF5722";
        ctx.font = `${12 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(furniture.name, 0, 0);

        // Draw selection indicator
        if (selectedFurniture?.id === furniture.id) {
          ctx.strokeStyle = "#1976D2";
          ctx.lineWidth = 3 * scale;
          ctx.setLineDash([5 * scale, 5 * scale]);
          ctx.strokeRect(-width / 2 - 5, -height / 2 - 5, width + 10, height + 10);
          ctx.setLineDash([]);

          // Draw rotation handle
          ctx.fillStyle = "#1976D2";
          ctx.beginPath();
          ctx.arc(width / 2 + 15, -height / 2 - 15, 8 * scale, 0, 2 * Math.PI);
          ctx.fill();

          // Draw rotation icon
          ctx.fillStyle = "white";
          ctx.font = `${10 * scale}px Font Awesome`;
          ctx.fillText("↻", width / 2 + 15, -height / 2 - 15);

          // Draw resize handles
          const handleSize = 10 * scale;
          
          // Width resize handle (right side)
          ctx.fillStyle = "#4CAF50";
          ctx.fillRect(width / 2 - handleSize / 2, -handleSize / 2, handleSize, handleSize);
          ctx.strokeStyle = "#2E7D32";
          ctx.lineWidth = 1;
          ctx.strokeRect(width / 2 - handleSize / 2, -handleSize / 2, handleSize, handleSize);
          
          // Depth resize handle (bottom side)
          ctx.fillStyle = "#4CAF50";
          ctx.fillRect(-handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(-handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);
          
          // Both resize handle (bottom-right corner)
          ctx.fillStyle = "#FF9800";
          ctx.fillRect(width / 2 - handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);
          ctx.strokeStyle = "#F57C00";
          ctx.strokeRect(width / 2 - handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);

          // Draw handle labels
          ctx.fillStyle = "white";
          ctx.font = `${8 * scale}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("↔", width / 2, 0);
          ctx.fillText("↕", 0, height / 2);
          ctx.fillText("⤡", width / 2, height / 2);
        }

        ctx.restore();
      });
    },
    [room.furniture, selectedFurniture, pixelsPerMeter, scale]
  );

  const checkInterferences = useCallback(() => {
    const newWarnings: string[] = [];

    room.doors.forEach(door => {
      room.furniture.forEach(furniture => {
        if (checkDoorFurnitureInterference(door, furniture, room.dimensions)) {
          newWarnings.push(`${furniture.name}이(가) 문 개폐 범위를 방해합니다`);
        }
      });
    });

    setWarnings(newWarnings);
  }, [room]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw room and get offsets
    const { offsetX, offsetY } = drawRoom(ctx);

    // Draw doors and swing arcs
    drawDoors(ctx, offsetX, offsetY);

    // Draw furniture
    drawFurniture(ctx, offsetX, offsetY);
  }, [drawGrid, drawRoom, drawDoors, drawFurniture]);

  // Handle canvas resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
  }, [draw]);

  // Mouse event handlers
  const getMousePos = (e: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getFurnitureAt = (point: Point): Furniture | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const offsetX = (canvas.width - roomWidthPx) / 2;
    const offsetY = (canvas.height - roomLengthPx) / 2;

    for (let i = room.furniture.length - 1; i >= 0; i--) {
      const furniture = room.furniture[i];
      const x = offsetX + (furniture.x / 100) * pixelsPerMeter;
      const y = offsetY + (furniture.y / 100) * pixelsPerMeter;
      const width = (furniture.width / 100) * pixelsPerMeter;
      const height = (furniture.depth / 100) * pixelsPerMeter;

      if (
        point.x >= x &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + height
      ) {
        return furniture;
      }
    }

    return null;
  };

  const getDoorAt = (point: Point): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const offsetX = (canvas.width - roomWidthPx) / 2;
    const offsetY = (canvas.height - roomLengthPx) / 2;

    for (const door of room.doors) {
      let doorX = offsetX, doorY = offsetY;
      let doorWidth = (door.width / 100) * pixelsPerMeter;
      let doorHeight = 4 * scale;

      switch (door.wall) {
        case 'north':
          doorX += door.position * roomWidthPx - doorWidth / 2;
          doorY -= doorHeight / 2;
          break;
        case 'south':
          doorX += door.position * roomWidthPx - doorWidth / 2;
          doorY += roomLengthPx - doorHeight / 2;
          break;
        case 'east':
          doorX += roomWidthPx - doorHeight / 2;
          doorY += door.position * roomLengthPx - doorWidth / 2;
          [doorWidth, doorHeight] = [doorHeight, doorWidth];
          break;
        case 'west':
          doorX -= doorHeight / 2;
          doorY += door.position * roomLengthPx - doorWidth / 2;
          [doorWidth, doorHeight] = [doorHeight, doorWidth];
          break;
      }

      // Expand clickable area slightly
      const padding = 10;
      if (
        point.x >= doorX - padding &&
        point.x <= doorX + doorWidth + padding &&
        point.y >= doorY - padding &&
        point.y <= doorY + doorHeight + padding
      ) {
        return door.id;
      }
    }

    return null;
  };

  const handleMouseDown = (e: MouseEvent) => {
    const mousePos = getMousePos(e);
    
    // Check for door first
    const doorId = getDoorAt(mousePos);
    if (doorId) {
      setIsDraggingDoor(doorId);
      return;
    }

    const furniture = getFurnitureAt(mousePos);

    if (furniture) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const offsetX = (canvas.width - roomWidthPx) / 2;
      const offsetY = (canvas.height - roomLengthPx) / 2;
      const furnitureX = offsetX + (furniture.x / 100) * pixelsPerMeter;
      const furnitureY = offsetY + (furniture.y / 100) * pixelsPerMeter;

      // Check if clicking on rotation or resize handles
      if (selectedFurniture?.id === furniture.id) {
        const width = (furniture.width / 100) * pixelsPerMeter;
        const height = (furniture.depth / 100) * pixelsPerMeter;
        const centerX = furnitureX + width / 2;
        const centerY = furnitureY + height / 2;
        
        // Rotation handle
        const rotationHandleX = centerX + width / 2 + 15;
        const rotationHandleY = centerY - height / 2 - 15;
        
        if (
          Math.abs(mousePos.x - rotationHandleX) < 15 &&
          Math.abs(mousePos.y - rotationHandleY) < 15
        ) {
          // Rotate furniture
          const newRotation = (furniture.rotation + 90) % 360;
          onFurnitureUpdate({ ...furniture, rotation: newRotation });
          return;
        }

        // Resize handles
        const handleSize = 10 * scale;
        const clickTolerance = 15; // Larger click area
        
        // Width resize handle (right side)
        const widthHandleX = centerX + width / 2;
        const widthHandleY = centerY;
        
        if (
          Math.abs(mousePos.x - widthHandleX) < clickTolerance &&
          Math.abs(mousePos.y - widthHandleY) < clickTolerance
        ) {
          setIsResizing({
            furnitureId: furniture.id,
            handle: 'width',
            startSize: { width: furniture.width, depth: furniture.depth },
            startMouse: mousePos
          });
          return;
        }

        // Depth resize handle (bottom side)
        const depthHandleX = centerX;
        const depthHandleY = centerY + height / 2;
        
        if (
          Math.abs(mousePos.x - depthHandleX) < clickTolerance &&
          Math.abs(mousePos.y - depthHandleY) < clickTolerance
        ) {
          setIsResizing({
            furnitureId: furniture.id,
            handle: 'depth',
            startSize: { width: furniture.width, depth: furniture.depth },
            startMouse: mousePos
          });
          return;
        }

        // Both resize handle (bottom-right corner)
        const bothHandleX = centerX + width / 2;
        const bothHandleY = centerY + height / 2;
        
        if (
          Math.abs(mousePos.x - bothHandleX) < clickTolerance &&
          Math.abs(mousePos.y - bothHandleY) < clickTolerance
        ) {
          setIsResizing({
            furnitureId: furniture.id,
            handle: 'both',
            startSize: { width: furniture.width, depth: furniture.depth },
            startMouse: mousePos
          });
          return;
        }
      }

      onFurnitureSelect(furniture);
      setDragState({
        isDragging: true,
        draggedItem: furniture,
        offset: {
          x: mousePos.x - furnitureX,
          y: mousePos.y - furnitureY
        }
      });
    } else {
      onFurnitureSelect(null);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePos(e);

    // Handle furniture resizing
    if (isResizing) {
      const furniture = room.furniture.find(f => f.id === isResizing.furnitureId);
      if (!furniture) return;

      const deltaX = mousePos.x - isResizing.startMouse.x;
      const deltaY = mousePos.y - isResizing.startMouse.y;
      
      // Convert pixel movement to cm
      const deltaWidthCm = (deltaX / pixelsPerMeter) * 100;
      const deltaDepthCm = (deltaY / pixelsPerMeter) * 100;

      let newWidth = isResizing.startSize.width;
      let newDepth = isResizing.startSize.depth;

      switch (isResizing.handle) {
        case 'width':
          newWidth = Math.max(20, Math.min(400, isResizing.startSize.width + deltaWidthCm));
          break;
        case 'depth':
          newDepth = Math.max(20, Math.min(400, isResizing.startSize.depth + deltaDepthCm));
          break;
        case 'both':
          newWidth = Math.max(20, Math.min(400, isResizing.startSize.width + deltaWidthCm));
          newDepth = Math.max(20, Math.min(400, isResizing.startSize.depth + deltaDepthCm));
          break;
      }

      // Throttle updates for smoother performance (update every 16ms for 60fps)
      const now = Date.now();
      if (now - lastUpdateTime > 16) {
        const updatedFurniture = {
          ...furniture,
          width: Math.round(newWidth),
          depth: Math.round(newDepth)
        };
        onFurnitureUpdate(updatedFurniture);
        setLastUpdateTime(now);
      }
      return;
    }

    // Handle door dragging
    if (isDraggingDoor && onDoorUpdate) {
      const offsetX = (canvas.width - roomWidthPx) / 2;
      const offsetY = (canvas.height - roomLengthPx) / 2;
      
      const door = room.doors.find(d => d.id === isDraggingDoor);
      if (!door) return;

      let newPosition = 0;

      switch (door.wall) {
        case 'north':
        case 'south':
          newPosition = (mousePos.x - offsetX) / roomWidthPx;
          break;
        case 'east':
        case 'west':
          newPosition = (mousePos.y - offsetY) / roomLengthPx;
          break;
      }

      // Constrain position to wall bounds
      newPosition = Math.max(0.05, Math.min(0.95, newPosition));
      onDoorUpdate(isDraggingDoor, { position: newPosition });
      return;
    }

    // Handle furniture dragging
    if (!dragState.isDragging || !dragState.draggedItem) return;

    const offsetX = (canvas.width - roomWidthPx) / 2;
    const offsetY = (canvas.height - roomLengthPx) / 2;

    const newX = ((mousePos.x - dragState.offset.x - offsetX) / pixelsPerMeter) * 100;
    const newY = ((mousePos.y - dragState.offset.y - offsetY) / pixelsPerMeter) * 100;

    // Constrain to room bounds
    const maxX = room.dimensions.width * 100 - dragState.draggedItem.width;
    const maxY = room.dimensions.length * 100 - dragState.draggedItem.depth;

    const constrainedX = Math.max(0, Math.min(maxX, newX));
    const constrainedY = Math.max(0, Math.min(maxY, newY));

    onFurnitureUpdate({
      ...dragState.draggedItem,
      x: constrainedX,
      y: constrainedY
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    // Final update on mouse up for resizing
    if (isResizing) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mousePos = getMousePos(e);
      const furniture = room.furniture.find(f => f.id === isResizing.furnitureId);
      
      if (furniture) {
        const deltaX = mousePos.x - isResizing.startMouse.x;
        const deltaY = mousePos.y - isResizing.startMouse.y;
        
        const deltaWidthCm = (deltaX / pixelsPerMeter) * 100;
        const deltaDepthCm = (deltaY / pixelsPerMeter) * 100;

        let newWidth = isResizing.startSize.width;
        let newDepth = isResizing.startSize.depth;

        switch (isResizing.handle) {
          case 'width':
            newWidth = Math.max(20, Math.min(400, isResizing.startSize.width + deltaWidthCm));
            break;
          case 'depth':
            newDepth = Math.max(20, Math.min(400, isResizing.startSize.depth + deltaDepthCm));
            break;
          case 'both':
            newWidth = Math.max(20, Math.min(400, isResizing.startSize.width + deltaWidthCm));
            newDepth = Math.max(20, Math.min(400, isResizing.startSize.depth + deltaDepthCm));
            break;
        }

        // Final update with exact values
        onFurnitureUpdate({
          ...furniture,
          width: Math.round(newWidth),
          depth: Math.round(newDepth)
        });
      }
    }

    setDragState({
      isDragging: false,
      draggedItem: null,
      offset: { x: 0, y: 0 }
    });
    setIsDraggingDoor(null);
    setIsResizing(null);
    setLastUpdateTime(0);
  };

  // Effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedFurniture, room.furniture, isDraggingDoor, isResizing]);

  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    checkInterferences();
  }, [checkInterferences]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          isResizing ? 
            (isResizing.handle === 'width' ? 'cursor-ew-resize' : 
             isResizing.handle === 'depth' ? 'cursor-ns-resize' : 
             'cursor-nwse-resize') :
          isDraggingDoor ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
        style={{
          backgroundImage: isGridVisible
            ? `radial-gradient(circle, #E5E7EB 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${20 * scale}px ${20 * scale}px`
        }}
      />

      {/* Warnings */}
      {warnings.map((warning, index) => (
        <Alert
          key={index}
          className="absolute bottom-4 left-4 bg-warning text-white border-warning max-w-sm"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {warning}
          </AlertDescription>
        </Alert>
      ))}

      {/* Room info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 backdrop-blur-sm">
        방 ({room.dimensions.length}m × {room.dimensions.width}m)
      </div>

      {/* Door editing hint */}
      {room.doors.length > 0 && (
        <div className="absolute top-4 right-4 bg-blue-50/90 px-3 py-2 rounded-lg text-xs text-blue-700 backdrop-blur-sm border border-blue-200">
          💡 문을 드래그하여 위치를 조정할 수 있습니다
        </div>
      )}

      {/* Active door dragging indicator */}
      {isDraggingDoor && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-50/90 px-4 py-2 rounded-lg text-sm text-green-700 backdrop-blur-sm border border-green-200">
          🚪 문 위치 조정 중... 마우스를 놓으면 완료됩니다
        </div>
      )}

      {/* Active furniture resizing indicator */}
      {isResizing && (() => {
        const furniture = room.furniture.find(f => f.id === isResizing.furnitureId);
        if (!furniture) return null;
        
        return (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-50/90 px-4 py-2 rounded-lg text-sm text-orange-700 backdrop-blur-sm border border-orange-200">
            📏 {furniture.name} 크기 조정 중: {furniture.width}cm × {furniture.depth}cm
          </div>
        );
      })()}

      {/* Furniture resize hint */}
      {selectedFurniture && !isResizing && !isDraggingDoor && !dragState.isDragging && (
        <div className="absolute top-16 right-4 bg-orange-50/90 px-3 py-2 rounded-lg text-xs text-orange-700 backdrop-blur-sm border border-orange-200">
          📏 가구의 핸들을 드래그하여 크기를 조정할 수 있습니다
        </div>
      )}
    </div>
  );
}
