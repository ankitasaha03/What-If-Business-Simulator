export interface SimulationParameters {
  salesGrowth: number; // percentage (-20 to +100)
  headcountDelta: number; // number of employees (-50 to +100)
  inventoryBufferDays: number; // days of safety stock (5 to 90)
  shiftCount: number; // 1, 2, or 3 shifts
  machineEfficiency: number; // percentage (70 to 120)
  fleetCapacityDelta: number; // percentage (-30 to +100)
  thirdPartyLogisticsShare: number; // percentage (0 to 100)
  priceAdjustment: number; // percentage (-20 to +30)
  overtimeAllowed: boolean;
  expeditedShipping: boolean;
}

export interface MetricComparison {
  baseline: number;
  simulated: number;
  delta: number;
  percentChange: number;
  unit: string;
  isPositiveGood: boolean;
}

export interface DepartmentConstraint {
  id: string;
  name: string;
  category: 'workforce' | 'inventory' | 'production' | 'logistics';
  capacityLimit: number;
  currentDemand: number;
  utilizationPercent: number;
  status: 'healthy' | 'warning' | 'critical';
  bottleneckDescription?: string;
  recommendedFix?: string;
}

export interface SimulationResult {
  // Financials
  baselineRevenue: number;
  simulatedRevenue: number;
  revenueDelta: number;
  baselineOpex: number;
  simulatedOpex: number;
  baselineProfit: number;
  simulatedProfit: number;
  profitMarginPercent: number;
  profitMarginDelta: number;

  // Key Operational Ratios
  employeeUtilization: number; // %
  inventoryTurnoverDays: number; // days of supply
  stockoutRiskDays: number | null; // null if safe, otherwise days until stockout
  machineUtilization: number; // %
  logisticsUtilization: number; // %
  fulfillmentDelayDays: number; // estimated backlog/delay in business days

  // Overall Feasibility & Risk
  feasibilityScore: number; // 0 to 100
  bottleneckIndex: number; // 0 to 100
  systemHealthStatus: 'Optimal' | 'Manageable Strain' | 'Severe Bottleneck' | 'Critical Failure';
  healthColor: 'emerald' | 'amber' | 'rose' | 'red';

  // Detailed Constraints
  constraints: DepartmentConstraint[];

  // Monthly Projections (6 Months)
  projections: MonthlyProjection[];

  // Radar Assessment
  dimensionScores: {
    workforce: number;
    inventory: number;
    production: number;
    logistics: number;
    financial: number;
  };

  // High-level AI Insights
  bottlenecks: string[];
  recommendations: string[];
}

export interface MonthlyProjection {
  month: string;
  baselineRevenue: number;
  simulatedRevenue: number;
  operationalCost: number;
  projectedProfit: number;
  bottleneckRisk: number; // 0 to 100
  fulfillmentDelay: number; // days
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  params: SimulationParameters;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  scenarioParams?: SimulationParameters;
  analysis?: {
    feasibilityScore: number;
    healthTag: 'Optimal' | 'Strained' | 'Critical';
    bottlenecks: string[];
    financialSummary: string;
    recommendations: string[];
  };
}
