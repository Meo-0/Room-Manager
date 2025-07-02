import type { Furniture } from "@/types/room";

export interface FurnitureTemplate {
  id: string;
  name: string;
  category: string;
  type: string;
  shape: 'rectangle' | 'circle' | 'l-shape' | 'custom';
  defaultWidth: number; // cm
  defaultDepth: number; // cm
  defaultHeight: number; // cm
  icon: string;
  color: string;
}

export const furnitureTemplates: FurnitureTemplate[] = [
  // 거실 가구
  {
    id: 'sofa-standard',
    name: '일반 소파',
    category: '거실',
    type: 'sofa',
    shape: 'rectangle',
    defaultWidth: 200,
    defaultDepth: 90,
    defaultHeight: 85,
    icon: 'fas fa-couch',
    color: '#FF5722'
  },
  {
    id: 'sofa-l-shape',
    name: 'L자형 소파',
    category: '거실',
    type: 'sofa',
    shape: 'l-shape',
    defaultWidth: 250,
    defaultDepth: 200,
    defaultHeight: 85,
    icon: 'fas fa-couch',
    color: '#FF5722'
  },
  {
    id: 'coffee-table',
    name: '커피 테이블',
    category: '거실',
    type: 'table',
    shape: 'rectangle',
    defaultWidth: 120,
    defaultDepth: 60,
    defaultHeight: 45,
    icon: 'fas fa-table',
    color: '#388E3C'
  },
  {
    id: 'coffee-table-round',
    name: '원형 커피 테이블',
    category: '거실',
    type: 'table',
    shape: 'circle',
    defaultWidth: 80,
    defaultDepth: 80,
    defaultHeight: 45,
    icon: 'fas fa-table',
    color: '#388E3C'
  },
  {
    id: 'armchair',
    name: '안락의자',
    category: '거실',
    type: 'chair',
    shape: 'rectangle',
    defaultWidth: 80,
    defaultDepth: 80,
    defaultHeight: 85,
    icon: 'fas fa-chair',
    color: '#9C27B0'
  },
  {
    id: 'tv-stand',
    name: 'TV 스탠드',
    category: '거실',
    type: 'tv',
    shape: 'rectangle',
    defaultWidth: 150,
    defaultDepth: 40,
    defaultHeight: 60,
    icon: 'fas fa-tv',
    color: '#607D8B'
  },
  
  // 침실 가구
  {
    id: 'bed-single',
    name: '싱글 침대',
    category: '침실',
    type: 'bed',
    shape: 'rectangle',
    defaultWidth: 120,
    defaultDepth: 200,
    defaultHeight: 50,
    icon: 'fas fa-bed',
    color: '#2196F3'
  },
  {
    id: 'bed-double',
    name: '더블 침대',
    category: '침실',
    type: 'bed',
    shape: 'rectangle',
    defaultWidth: 150,
    defaultDepth: 200,
    defaultHeight: 50,
    icon: 'fas fa-bed',
    color: '#2196F3'
  },
  {
    id: 'bed-queen',
    name: '퀸 침대',
    category: '침실',
    type: 'bed',
    shape: 'rectangle',
    defaultWidth: 160,
    defaultDepth: 200,
    defaultHeight: 50,
    icon: 'fas fa-bed',
    color: '#2196F3'
  },
  {
    id: 'wardrobe',
    name: '옷장',
    category: '침실',
    type: 'storage',
    shape: 'rectangle',
    defaultWidth: 100,
    defaultDepth: 60,
    defaultHeight: 200,
    icon: 'fas fa-archive',
    color: '#795548'
  },
  {
    id: 'dresser',
    name: '화장대',
    category: '침실',
    type: 'dresser',
    shape: 'rectangle',
    defaultWidth: 120,
    defaultDepth: 45,
    defaultHeight: 75,
    icon: 'fas fa-mirror',
    color: '#E91E63'
  },
  
  // 식당 가구
  {
    id: 'dining-table-4',
    name: '4인 식탁',
    category: '식당',
    type: 'table',
    shape: 'rectangle',
    defaultWidth: 120,
    defaultDepth: 80,
    defaultHeight: 75,
    icon: 'fas fa-table',
    color: '#388E3C'
  },
  {
    id: 'dining-table-6',
    name: '6인 식탁',
    category: '식당',
    type: 'table',
    shape: 'rectangle',
    defaultWidth: 160,
    defaultDepth: 90,
    defaultHeight: 75,
    icon: 'fas fa-table',
    color: '#388E3C'
  },
  {
    id: 'dining-chair',
    name: '식탁 의자',
    category: '식당',
    type: 'chair',
    shape: 'rectangle',
    defaultWidth: 45,
    defaultDepth: 50,
    defaultHeight: 80,
    icon: 'fas fa-chair',
    color: '#9C27B0'
  },
  
  // 기타 가구
  {
    id: 'bookshelf',
    name: '책장',
    category: '서재',
    type: 'storage',
    shape: 'rectangle',
    defaultWidth: 80,
    defaultDepth: 30,
    defaultHeight: 180,
    icon: 'fas fa-book',
    color: '#FF9800'
  },
  {
    id: 'desk',
    name: '책상',
    category: '서재',
    type: 'desk',
    shape: 'rectangle',
    defaultWidth: 120,
    defaultDepth: 60,
    defaultHeight: 75,
    icon: 'fas fa-desktop',
    color: '#4CAF50'
  }
];

export function createFurnitureFromTemplate(template: FurnitureTemplate, position: { x: number; y: number }): Furniture {
  return {
    id: `${template.id}-${Date.now()}`,
    name: template.name,
    type: template.type,
    shape: template.shape,
    width: template.defaultWidth,
    depth: template.defaultDepth,
    height: template.defaultHeight,
    x: position.x,
    y: position.y,
    rotation: 0,
    color: template.color
  };
}

export function getFurnitureTemplatesByCategory(category?: string): FurnitureTemplate[] {
  if (!category) return furnitureTemplates;
  return furnitureTemplates.filter(template => template.category === category);
}

export function getFurnitureCategories(): string[] {
  const categories = new Set(furnitureTemplates.map(template => template.category));
  return Array.from(categories);
}
