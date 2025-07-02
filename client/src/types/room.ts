import { z } from "zod";

export interface Point {
  x: number;
  y: number;
}

export interface RoomDimensions {
  length: number; // meters
  width: number; // meters
  height: number; // meters
}

export interface Door {
  id: string;
  width: number; // cm
  height: number; // cm
  wall: 'north' | 'south' | 'east' | 'west';
  position: number; // 0-1 position along wall
  swingDirection: 'inward' | 'outward';
  swingAngle: number; // degrees
  hingePosition: 'left' | 'right';
}

export interface Furniture {
  id: string;
  name: string;
  type: string;
  shape: 'rectangle' | 'circle' | 'l-shape' | 'custom';
  width: number; // cm
  depth: number; // cm
  height: number; // cm
  x: number; // cm from origin
  y: number; // cm from origin
  rotation: number; // degrees
  customPath?: Point[]; // for custom shapes
  color?: string;
}

export interface RoomLayout {
  id?: number;
  name: string;
  dimensions: RoomDimensions;
  doors: Door[];
  furniture: Furniture[];
}

export interface DragState {
  isDragging: boolean;
  draggedItem: Furniture | null;
  offset: Point;
}

export interface InterferenceWarning {
  id: string;
  type: 'door-furniture' | 'furniture-furniture';
  message: string;
  severity: 'warning' | 'error';
  furnitureIds: string[];
  doorId?: string;
}

export interface SpaceAnalysis {
  totalArea: number; // m²
  usedArea: number; // m²
  efficiency: number; // percentage
  accessibilityScore: number; // 0-100
  warnings: InterferenceWarning[];
  suggestions: string[];
}
