import type { Point, Door, Furniture, RoomDimensions } from "@/types/room";

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const rad = degreesToRadians(angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

export function getDoorSwingPath(door: Door, roomDimensions: RoomDimensions): Point[] {
  const roomWidthCm = roomDimensions.width * 100;
  const roomLengthCm = roomDimensions.length * 100;
  
  // Calculate door position on wall
  let doorX = 0, doorY = 0, hingeX = 0, hingeY = 0;
  
  switch (door.wall) {
    case 'north': // Top wall
      doorX = door.position * roomWidthCm;
      doorY = 0;
      hingeX = doorX + (door.hingePosition === 'left' ? 0 : door.width);
      hingeY = 0;
      break;
    case 'south': // Bottom wall
      doorX = door.position * roomWidthCm;
      doorY = roomLengthCm;
      hingeX = doorX + (door.hingePosition === 'left' ? 0 : door.width);
      hingeY = roomLengthCm;
      break;
    case 'east': // Right wall
      doorX = roomWidthCm;
      doorY = door.position * roomLengthCm;
      hingeX = roomWidthCm;
      hingeY = doorY + (door.hingePosition === 'left' ? 0 : door.width);
      break;
    case 'west': // Left wall
      doorX = 0;
      doorY = door.position * roomLengthCm;
      hingeX = 0;
      hingeY = doorY + (door.hingePosition === 'left' ? 0 : door.width);
      break;
  }
  
  // Calculate swing arc
  const swingRadius = door.width;
  const startAngle = getWallAngle(door.wall) + (door.hingePosition === 'left' ? 0 : 180);
  const endAngle = startAngle + (door.swingDirection === 'inward' ? door.swingAngle : -door.swingAngle);
  
  const path: Point[] = [];
  const steps = Math.max(10, Math.floor(door.swingAngle / 5));
  
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    const x = hingeX + swingRadius * Math.cos(degreesToRadians(angle));
    const y = hingeY + swingRadius * Math.sin(degreesToRadians(angle));
    path.push({ x, y });
  }
  
  return path;
}

function getWallAngle(wall: string): number {
  switch (wall) {
    case 'north': return 90;  // Points down
    case 'south': return 270; // Points up
    case 'east': return 180;  // Points left
    case 'west': return 0;    // Points right
    default: return 0;
  }
}

export function getFurnitureCorners(furniture: Furniture): Point[] {
  const centerX = furniture.x + furniture.width / 2;
  const centerY = furniture.y + furniture.depth / 2;
  const center = { x: centerX, y: centerY };
  
  if (furniture.shape === 'circle') {
    // Return points around the circle
    const radius = Math.max(furniture.width, furniture.depth) / 2;
    const points: Point[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * 360;
      const x = centerX + radius * Math.cos(degreesToRadians(angle));
      const y = centerY + radius * Math.sin(degreesToRadians(angle));
      points.push({ x, y });
    }
    return points;
  }
  
  if (furniture.shape === 'custom' && furniture.customPath) {
    return furniture.customPath.map(point => 
      rotatePoint({ x: furniture.x + point.x, y: furniture.y + point.y }, center, furniture.rotation)
    );
  }
  
  // Rectangle and L-shape
  let corners: Point[] = [];
  
  if (furniture.shape === 'l-shape') {
    const w = furniture.width;
    const d = furniture.depth;
    const w2 = w * 0.6; // L-shape proportions
    const d2 = d * 0.6;
    
    corners = [
      { x: furniture.x, y: furniture.y },
      { x: furniture.x + w2, y: furniture.y },
      { x: furniture.x + w2, y: furniture.y + d - d2 },
      { x: furniture.x + w, y: furniture.y + d - d2 },
      { x: furniture.x + w, y: furniture.y + d },
      { x: furniture.x, y: furniture.y + d }
    ];
  } else {
    // Rectangle
    corners = [
      { x: furniture.x, y: furniture.y },
      { x: furniture.x + furniture.width, y: furniture.y },
      { x: furniture.x + furniture.width, y: furniture.y + furniture.depth },
      { x: furniture.x, y: furniture.y + furniture.depth }
    ];
  }
  
  return corners.map(corner => rotatePoint(corner, center, furniture.rotation));
}

export function checkDoorFurnitureInterference(door: Door, furniture: Furniture, roomDimensions: RoomDimensions): boolean {
  const swingPath = getDoorSwingPath(door, roomDimensions);
  const furnitureCorners = getFurnitureCorners(furniture);
  
  // Check if any furniture corner is inside the door swing area
  for (const corner of furnitureCorners) {
    if (isPointInPolygon(corner, swingPath)) {
      return true;
    }
  }
  
  return false;
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export function checkFurnitureFurnitureCollision(furniture1: Furniture, furniture2: Furniture): boolean {
  const corners1 = getFurnitureCorners(furniture1);
  const corners2 = getFurnitureCorners(furniture2);
  
  // Simple bounding box check first
  const bbox1 = getBoundingBox(corners1);
  const bbox2 = getBoundingBox(corners2);
  
  if (!boundingBoxesIntersect(bbox1, bbox2)) {
    return false;
  }
  
  // More detailed polygon intersection check
  return polygonsIntersect(corners1, corners2);
}

function getBoundingBox(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  return {
    minX: Math.min(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)),
    maxX: Math.max(...points.map(p => p.x)),
    maxY: Math.max(...points.map(p => p.y))
  };
}

function boundingBoxesIntersect(box1: any, box2: any): boolean {
  return !(box1.maxX < box2.minX || box2.maxX < box1.minX || 
           box1.maxY < box2.minY || box2.maxY < box1.minY);
}

function polygonsIntersect(poly1: Point[], poly2: Point[]): boolean {
  // Simplified intersection check - check if any point of one polygon is inside the other
  for (const point of poly1) {
    if (isPointInPolygon(point, poly2)) {
      return true;
    }
  }
  
  for (const point of poly2) {
    if (isPointInPolygon(point, poly1)) {
      return true;
    }
  }
  
  return false;
}

export function calculateSpaceEfficiency(furniture: Furniture[], roomDimensions: RoomDimensions): number {
  const totalRoomArea = roomDimensions.length * roomDimensions.width; // m²
  
  let usedArea = 0;
  furniture.forEach(item => {
    // Convert cm² to m²
    const itemArea = (item.width * item.depth) / 10000;
    usedArea += itemArea;
  });
  
  return Math.min(100, (usedArea / totalRoomArea) * 100);
}
