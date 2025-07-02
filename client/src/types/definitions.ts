// 파일 경로: client/src/types/definitions.ts

// 이 파일은 우리 앱에서 사용하는 데이터들의 설계도(타입)입니다.

export type Room = {
  id: number;
  name: string;
  width: number;
  height: number;
  walls: Wall[];
  furnitures: Furniture[];
};

export type Wall = {
  id: number;
  points: number[]; // 예: [x1, y1, x2, y2]
  doors: Door[];
};

export type Door = {
  id: number;
  position: number; // 벽 위에서의 위치 (0에서 1 사이의 값)
  width: number;
};

export type Furniture = {
  id: number;
  templateId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};