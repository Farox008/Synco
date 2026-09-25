// Centralized Feasibility Rates Configuration — Synco Manufacturing Operations
// Configurable allocation percentages and hourly rates across manufacturing & procurement categories

export interface FeasibilityRateItem {
  name: string;
  code: string;
  allocationPercent: number;
  hourlyRate?: number; // Departments without hourlyRate are procurement / budget-only categories
  isMachiningOrLabor: boolean;
}

export type FeasibilityCategoryKey = 
  | 'design' 
  | 'milling' 
  | 'cnc' 
  | 'grinding' 
  | 'wireCut' 
  | 'assembly' 
  | 'material' 
  | 'std' 
  | 'others';

export interface FeasibilityRatesConfig {
  design: { allocationPercent: number; hourlyRate: number };
  milling: { allocationPercent: number; hourlyRate: number };
  cnc: { allocationPercent: number; hourlyRate: number };
  grinding: { allocationPercent: number; hourlyRate: number };
  wireCut: { allocationPercent: number; hourlyRate: number };
  assembly: { allocationPercent: number; hourlyRate: number };
  material: { allocationPercent: number };
  std: { allocationPercent: number };
  others: { allocationPercent: number };
}

// Default profit percentage allocated from customer budget
export const DEFAULT_PROFIT_PERCENT = 15; // 15%

// Centralized configuration data structure as specified
export const feasibilityRates: FeasibilityRatesConfig = {
  design: {
    allocationPercent: 16,
    hourlyRate: 175
  },
  milling: {
    allocationPercent: 3,
    hourlyRate: 35
  },
  cnc: {
    allocationPercent: 15,
    hourlyRate: 105
  },
  grinding: {
    allocationPercent: 7,
    hourlyRate: 40
  },
  wireCut: {
    allocationPercent: 20,
    hourlyRate: 66
  },
  assembly: {
    allocationPercent: 6,
    hourlyRate: 35
  },
  material: {
    allocationPercent: 23
  },
  std: {
    allocationPercent: 8
  },
  others: {
    allocationPercent: 2
  }
};

// Department metadata & presentation descriptors
export const FEASIBILITY_CATEGORY_METADATA: Record<FeasibilityCategoryKey, { label: string; processCode: string; description: string }> = {
  design: { label: 'Design', processCode: 'DSN', description: 'CAD/CAM & Tooling Engineering' },
  milling: { label: 'Milling', processCode: 'MILL', description: 'Conventional Milling Operations' },
  cnc: { label: 'CNC', processCode: 'CNC', description: 'High Precision 3/5-Axis CNC Machining' },
  grinding: { label: 'Grinding', processCode: 'GR', description: 'Surface & Cylindrical Grinding' },
  wireCut: { label: 'Wire Cut', processCode: 'WC', description: 'Wire EDM & Spark Erosion' },
  assembly: { label: 'Assembly', processCode: 'ASSY', description: 'Tool & Die Fitting & Assembly' },
  material: { label: 'Material', processCode: 'MATL', description: 'Raw Material Stock & Tool Steel' },
  std: { label: 'STD', processCode: 'STD', description: 'Standard Components (Pins, Springs, Bushings)' },
  others: { label: 'Others', processCode: 'OTHERS', description: 'Subcontracting, Surface Coating, Heat Treatment' }
};

// Ordered list for display and processing
export const FEASIBILITY_CATEGORY_ORDER: FeasibilityCategoryKey[] = [
  'design',
  'milling',
  'cnc',
  'grinding',
  'wireCut',
  'assembly',
  'material',
  'std',
  'others'
];
