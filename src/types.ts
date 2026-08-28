export type ModuleId = 'module1' | 'module2' | 'module3' | 'module4' | 'module5' | 'overview';

export interface ModuleMeta {
  id: ModuleId;
  promptNum: number;
  title: string;
  subTitle: string;
  sourceExam: string;
  iconName: string;
  badge: string;
  points: number;
}

// Module 1: 太阳系竞速赛
export interface PlanetData {
  id: 'P' | 'Q' | 'R' | 'S';
  nameZh: string;
  nameEn: string;
  distanceMillionKm: number;
  color: string;
  accentColor: string;
  radius: number;
  orbitIndex: number; // 0, 1, 2, 3 corresponding to distance order: 58(P)->0, 150(R)->1, 778(Q)->2, 4495(S)->3
  realPlanet: string;
}

export interface RevolutionRow {
  planet: 'X' | 'Y' | 'Z';
  distance: number;
  time: string;
  relatedOptionId?: string;
}

// Module 2: 光合作用
export interface GasBubble {
  id: 'co2' | 'o2';
  formula: string;
  name: string;
  color: string;
  glowColor: string;
}

// Module 3: 植物繁衍
export interface PlantItem {
  id: string;
  name: string;
  methodId: string;
  correctMethod: string;
  color: string;
  desc: string;
}

export interface TargetMethod {
  id: string;
  name: string;
  desc: string;
  color: string;
}

// Module 4: 石蕊试纸
export interface SubstanceBeaker {
  id: string;
  name: string;
  color: string;
  liquidClass: string;
  type: 'acid' | 'neutral' | 'alkali';
  testedRedTo: 'red' | 'blue';
  testedBlueTo: 'red' | 'blue';
}

// Module 5: 营养扫描仪
export interface MealPlate {
  id: string;
  title: string;
  contents: string[];
  balanced: boolean;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  vitamins: number;
  explanation: string;
}
