// Basic system parameters
export interface LoadData {
  bus5: { p: number };
  bus7: { p: number };
  bus9: { p: number };
}

export interface BranchParameters {
  rating: number;
  reactance: number;
}

export interface BranchRatings {
  [key: number]: BranchParameters;
}

export interface GeneratorLimits {
  g2: { min: number; max: number; };
  g3: { min: number; max: number; };
}

export interface NewBranch {
  fromBus: number;
  toBus: number;
  templateBranch: number;
}

// API response types
export interface Coefficients {
  a: number;
  b: number;
  c: number;
}

export interface Constraint {
  coefficients: Coefficients;
  description: string;
  color: string;
  style: string;
}

export interface Statistics {
  feasiblePercentage: number;
  bindingConstraints: number;
  totalConstraints: number;
  feasibleArea: number;
}

export interface Limits {
  g2_max: number;
  g3_max: number;
}

export interface SecurityRegionData {
  statistics: Statistics;
  limits: Limits;
  constraints: Constraint[];
  feasibleRegion: Array<{x: number, y: number}>;
  loadData: LoadData;
}