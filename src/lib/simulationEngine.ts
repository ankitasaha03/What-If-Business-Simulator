import {
  SimulationParameters,
  SimulationResult,
  ScenarioPreset,
  DepartmentConstraint,
  MonthlyProjection,
} from './types';

export const DEFAULT_PARAMETERS: SimulationParameters = {
  salesGrowth: 0,
  headcountDelta: 0,
  inventoryBufferDays: 42,
  shiftCount: 2,
  machineEfficiency: 100,
  fleetCapacityDelta: 0,
  thirdPartyLogisticsShare: 15,
  priceAdjustment: 0,
  overtimeAllowed: true,
  expeditedShipping: false,
};

export const BASELINE_METRICS = {
  quarterlyRevenue: 14_250_000,
  monthlyRevenue: 4_750_000,
  monthlyUnits: 18_500,
  unitSellingPrice: 256.75,
  unitDirectCost: 114.50,
  baseDirectStaff: 140,
  baseLogisticsStaff: 35,
  baseSupportStaff: 35,
  baseQuarterlyOpex: 11_400_000,
  baseMonthlyOpex: 3_800_000,
  baseMonthlyProfit: 950_000,
  baseProfitMargin: 20.0,
  baseMachineCapacity: 21_000,
  baseFleetCapacity: 19_500,
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'baseline',
    name: 'Current Baseline (Q4)',
    description: 'Existing steady-state operation without growth shocks or workforce adjustments.',
    tag: 'Baseline',
    params: { ...DEFAULT_PARAMETERS },
  },
  {
    id: 'surge_20',
    name: 'Aggressive Sales Push (+20%)',
    description: 'Simulate high commercial growth with existing headcount and warehouse capacity.',
    tag: 'Surge Test',
    params: {
      ...DEFAULT_PARAMETERS,
      salesGrowth: 20,
      headcountDelta: 0,
      inventoryBufferDays: 35,
      shiftCount: 2,
      thirdPartyLogisticsShare: 15,
      overtimeAllowed: true,
    },
  },
  {
    id: 'supply_disruption',
    name: 'Supply Chain Shock (-35% Buffer)',
    description: 'Raw material delays, critical stockout risk, and supplier transit lag.',
    tag: 'Disruption',
    params: {
      ...DEFAULT_PARAMETERS,
      salesGrowth: 5,
      inventoryBufferDays: 14,
      fleetCapacityDelta: -20,
      thirdPartyLogisticsShare: 5,
      priceAdjustment: 5,
      expeditedShipping: true,
    },
  },
  {
    id: 'labor_shortage',
    name: 'Labor Shortage (-15 Staff)',
    description: 'Sudden turnover and hiring freeze testing shop floor line resilience.',
    tag: 'Labor Crunch',
    params: {
      ...DEFAULT_PARAMETERS,
      salesGrowth: 10,
      headcountDelta: -15,
      shiftCount: 2,
      overtimeAllowed: false,
      machineEfficiency: 92,
    },
  },
  {
    id: 'scaled_expansion',
    name: 'Balanced 3-Shift Expansion (+45%)',
    description: 'High-growth strategy supported by 3-shift factory schedule and 3PL scaling.',
    tag: 'Expansion',
    params: {
      ...DEFAULT_PARAMETERS,
      salesGrowth: 45,
      headcountDelta: 28,
      inventoryBufferDays: 55,
      shiftCount: 3,
      machineEfficiency: 108,
      fleetCapacityDelta: 35,
      thirdPartyLogisticsShare: 40,
      overtimeAllowed: true,
      expeditedShipping: false,
    },
  },
];

export function runBusinessSimulation(params: SimulationParameters): SimulationResult {
  // 1. Demand & Sales Calculations
  // Elasticity effect on unit demand if price is changed
  const priceElasticity = params.priceAdjustment > 0 ? -0.45 : -0.6;
  const priceDemandMultiplier = 1 + (params.priceAdjustment * priceElasticity) / 100;
  
  const unitDemand = Math.round(
    BASELINE_METRICS.monthlyUnits * (1 + params.salesGrowth / 100) * priceDemandMultiplier
  );
  
  const effectiveUnitPrice = BASELINE_METRICS.unitSellingPrice * (1 + params.priceAdjustment / 100);
  const simulatedMonthlyRevenue = Math.round(unitDemand * effectiveUnitPrice);
  const baselineMonthlyRevenue = BASELINE_METRICS.monthlyRevenue;
  const revenueDelta = simulatedMonthlyRevenue - baselineMonthlyRevenue;

  // 2. Workforce & Labor Constraints
  const availableDirectLabor = Math.max(40, BASELINE_METRICS.baseDirectStaff + Math.round(params.headcountDelta * 0.75));
  const workHoursPerWorker = 160;
  const overtimeMultiplier = params.overtimeAllowed ? 1.25 : 1.0;
  const standardLaborCapacityHours = availableDirectLabor * workHoursPerWorker;
  const maxAvailableLaborHours = Math.round(standardLaborCapacityHours * overtimeMultiplier);
  
  // Hours required: 1.12 standard direct hours per finished unit
  const requiredLaborHours = Math.round(unitDemand * 1.10);
  const employeeUtilization = Math.round((requiredLaborHours / standardLaborCapacityHours) * 100);
  const effectiveLaborLoadPercent = Math.round((requiredLaborHours / maxAvailableLaborHours) * 100);

  // 3. Machine & Production Capacity
  // 1 shift = 0.55x, 2 shifts = 1.0x, 3 shifts = 1.45x
  const shiftMultiplier = params.shiftCount === 1 ? 0.55 : params.shiftCount === 2 ? 1.0 : 1.45;
  const machineOutputCapacity = Math.round(
    BASELINE_METRICS.baseMachineCapacity * shiftMultiplier * (params.machineEfficiency / 100)
  );
  const machineUtilization = Math.round((unitDemand / machineOutputCapacity) * 100);

  // 4. Inventory & Stockout Timeline
  const demandRunRate = unitDemand / BASELINE_METRICS.monthlyUnits;
  const effectiveDaysOfSupply = Math.max(2, Math.round(params.inventoryBufferDays / demandRunRate));
  
  // Stockout risk threshold is 18 days of raw material buffer
  let stockoutRiskDays: number | null = null;
  if (effectiveDaysOfSupply < 20) {
    stockoutRiskDays = Math.max(3, Math.round(effectiveDaysOfSupply * 0.85));
  }

  // 5. Logistics, Fleet & Fulfillment
  const ownFleetCapacity = BASELINE_METRICS.baseFleetCapacity * (1 + params.fleetCapacityDelta / 100);
  // 3PL adds external flex capacity
  const thirdPartyFlexCapacity = (params.thirdPartyLogisticsShare / 100) * 18_000;
  const totalShippingCapacity = Math.round(ownFleetCapacity + thirdPartyFlexCapacity);
  const logisticsUtilization = Math.round((unitDemand / totalShippingCapacity) * 100);

  // Fulfillment delay calculation in business days
  let fulfillmentDelayDays = 0;
  if (logisticsUtilization > 100) {
    fulfillmentDelayDays = +(1.2 + (logisticsUtilization - 100) * 0.18).toFixed(1);
  } else if (logisticsUtilization > 88) {
    fulfillmentDelayDays = +((logisticsUtilization - 88) * 0.08).toFixed(1);
  }
  if (params.expeditedShipping) {
    fulfillmentDelayDays = Math.max(0.2, +(fulfillmentDelayDays * 0.45).toFixed(1));
  }

  // 6. Cost Modeling & Operating Profit
  // Direct labor cost
  const baseWorkerWage = 5_800; // per month
  const regularLaborCost = availableDirectLabor * baseWorkerWage;
  const overtimeHoursUsed = Math.max(0, requiredLaborHours - standardLaborCapacityHours);
  const overtimeHourlyRate = (baseWorkerWage / 160) * 1.5;
  const overtimeCost = params.overtimeAllowed ? Math.round(overtimeHoursUsed * overtimeHourlyRate) : 0;
  const supportStaffCost = (BASELINE_METRICS.baseLogisticsStaff + BASELINE_METRICS.baseSupportStaff + Math.round(params.headcountDelta * 0.25)) * 6_200;

  // Material & COGS
  const directMaterialCost = Math.round(unitDemand * BASELINE_METRICS.unitDirectCost);
  const inventoryHoldingCost = Math.round(3_200_000 * (params.inventoryBufferDays / 42) * (0.12 / 12));

  // Machine maintenance & power (higher shifts and high utilization accelerate wear)
  const shiftCostPremium = params.shiftCount === 3 ? 120_000 : params.shiftCount === 1 ? -45_000 : 0;
  const machineOpex = Math.round(180_000 * (machineUtilization / 85) + shiftCostPremium);

  // Logistics & 3PL costs
  const baseFreightPerUnit = 16.50;
  const thirdPartyUnitPremium = 6.20; // 3PL is more expensive per unit
  const regularFreightCost = unitDemand * baseFreightPerUnit;
  const thirdPartyCost = Math.round(unitDemand * (params.thirdPartyLogisticsShare / 100) * thirdPartyUnitPremium);
  const expeditedCost = params.expeditedShipping ? 135_000 : 0;
  const totalLogisticsCost = Math.round(regularFreightCost + thirdPartyCost + expeditedCost);

  // General G&A Fixed overhead
  const generalOverhead = 450_000;

  // Unfulfilled order penalty if physical capacity was severely exceeded
  let unfulfilledPenalty = 0;
  if (machineUtilization > 120 || effectiveLaborLoadPercent > 125) {
    const overflowRatio = Math.max(machineUtilization - 120, effectiveLaborLoadPercent - 125) / 100;
    unfulfilledPenalty = Math.round(overflowRatio * simulatedMonthlyRevenue * 0.25);
  }

  const simulatedMonthlyOpex = Math.round(
    regularLaborCost +
    overtimeCost +
    supportStaffCost +
    directMaterialCost +
    inventoryHoldingCost +
    machineOpex +
    totalLogisticsCost +
    generalOverhead +
    unfulfilledPenalty
  );

  const baselineMonthlyOpex = BASELINE_METRICS.baseMonthlyOpex;
  const simulatedMonthlyProfit = simulatedMonthlyRevenue - simulatedMonthlyOpex;
  const baselineMonthlyProfit = BASELINE_METRICS.baseMonthlyProfit;
  const profitMarginPercent = +((simulatedMonthlyProfit / simulatedMonthlyRevenue) * 100).toFixed(1);
  const profitMarginDelta = +(profitMarginPercent - BASELINE_METRICS.baseProfitMargin).toFixed(1);

  // 7. Bottlenecks & Constraint Assessments
  const constraints: DepartmentConstraint[] = [
    {
      id: 'workforce',
      name: 'Direct Shopfloor Workforce',
      category: 'workforce',
      capacityLimit: maxAvailableLaborHours,
      currentDemand: requiredLaborHours,
      utilizationPercent: employeeUtilization,
      status: employeeUtilization > 115 ? 'critical' : employeeUtilization > 95 ? 'warning' : 'healthy',
      bottleneckDescription: employeeUtilization > 100
        ? `Workforce demand exceeds standard capacity by ${employeeUtilization - 100}%. Requires ${Math.round(overtimeHoursUsed)} overtime hours.`
        : undefined,
      recommendedFix: employeeUtilization > 100
        ? `Hire ${Math.ceil((requiredLaborHours - standardLaborCapacityHours) / 160)} shopfloor technicians or authorize paid weekend overtime.`
        : undefined,
    },
    {
      id: 'production',
      name: 'Factory Assembly & CNC Lines',
      category: 'production',
      capacityLimit: machineOutputCapacity,
      currentDemand: unitDemand,
      utilizationPercent: machineUtilization,
      status: machineUtilization > 105 ? 'critical' : machineUtilization > 92 ? 'warning' : 'healthy',
      bottleneckDescription: machineUtilization > 100
        ? `Factory output saturated at ${machineUtilization}%. Machine queue backlog forming.`
        : undefined,
      recommendedFix: machineUtilization > 100
        ? params.shiftCount < 3 ? 'Activate Shift 3 (Graveyard shift) to unlock +40% manufacturing capacity.' : 'Outsource sub-assembly to contract manufacturers.'
        : undefined,
    },
    {
      id: 'inventory',
      name: 'Component & Raw Material Buffer',
      category: 'inventory',
      capacityLimit: 60,
      currentDemand: effectiveDaysOfSupply,
      utilizationPercent: Math.min(150, Math.round((42 / effectiveDaysOfSupply) * 100)),
      status: effectiveDaysOfSupply < 18 ? 'critical' : effectiveDaysOfSupply < 28 ? 'warning' : 'healthy',
      bottleneckDescription: stockoutRiskDays
        ? `Inventory buffer drops to ${effectiveDaysOfSupply} days. Stockout risk in ~${stockoutRiskDays} days!`
        : undefined,
      recommendedFix: stockoutRiskDays
        ? 'Increase safety stock POs immediately and negotiate expedited supplier terms.'
        : undefined,
    },
    {
      id: 'logistics',
      name: 'Fleet Logistics & Order Fulfillment',
      category: 'logistics',
      capacityLimit: totalShippingCapacity,
      currentDemand: unitDemand,
      utilizationPercent: logisticsUtilization,
      status: logisticsUtilization > 110 ? 'critical' : logisticsUtilization > 92 ? 'warning' : 'healthy',
      bottleneckDescription: logisticsUtilization > 100
        ? `Dispatch capacity breached. Projected shipment delay: ${fulfillmentDelayDays} business days.`
        : undefined,
      recommendedFix: logisticsUtilization > 100
        ? `Increase 3PL allocation by ${(Math.ceil((logisticsUtilization - 90) / 10) * 10)}% or enable expedited carrier air freight.`
        : undefined,
    },
  ];

  // 8. Overall Feasibility & Bottleneck Index
  const workforceStress = Math.max(0, employeeUtilization - 90) * 1.5;
  const machineStress = Math.max(0, machineUtilization - 90) * 1.6;
  const inventoryStress = Math.max(0, (26 - effectiveDaysOfSupply) * 3.2);
  const logisticsStress = Math.max(0, logisticsUtilization - 90) * 1.4;

  const rawBottleneck = (workforceStress * 0.30) + (machineStress * 0.30) + (inventoryStress * 0.22) + (logisticsStress * 0.18);
  const bottleneckIndex = Math.min(100, Math.max(0, Math.round(rawBottleneck)));
  const feasibilityScore = Math.max(10, Math.min(100, Math.round(100 - bottleneckIndex)));

  let systemHealthStatus: SimulationResult['systemHealthStatus'] = 'Optimal';
  let healthColor: SimulationResult['healthColor'] = 'emerald';

  if (feasibilityScore < 45) {
    systemHealthStatus = 'Critical Failure';
    healthColor = 'red';
  } else if (feasibilityScore < 68) {
    systemHealthStatus = 'Severe Bottleneck';
    healthColor = 'rose';
  } else if (feasibilityScore < 85) {
    systemHealthStatus = 'Manageable Strain';
    healthColor = 'amber';
  }

  // 9. Six-Month Projections
  const monthNames = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
  const rampFactors = [0.85, 0.94, 1.0, 1.04, 1.08, 1.12];
  
  const projections: MonthlyProjection[] = monthNames.map((month, idx) => {
    const factor = rampFactors[idx];
    const mRevenue = Math.round(simulatedMonthlyRevenue * factor);
    const mCost = Math.round(simulatedMonthlyOpex * (0.95 + (factor - 1) * 0.7));
    const mProfit = mRevenue - mCost;
    const mRisk = Math.min(100, Math.round(bottleneckIndex * (0.8 + idx * 0.08)));
    const mDelay = +(fulfillmentDelayDays * (0.85 + idx * 0.06)).toFixed(1);

    return {
      month,
      baselineRevenue: Math.round(baselineMonthlyRevenue * (1 + idx * 0.015)),
      simulatedRevenue: mRevenue,
      operationalCost: mCost,
      projectedProfit: mProfit,
      bottleneckRisk: mRisk,
      fulfillmentDelay: mDelay,
    };
  });

  // 10. Dimension Radar Scores (0 to 100, 100 is best/healthiest)
  const dimensionScores = {
    workforce: Math.max(10, Math.min(100, Math.round(100 - Math.max(0, employeeUtilization - 80) * 1.8))),
    inventory: Math.max(10, Math.min(100, Math.round(Math.min(100, effectiveDaysOfSupply * 2.3)))),
    production: Math.max(10, Math.min(100, Math.round(100 - Math.max(0, machineUtilization - 80) * 2.0))),
    logistics: Math.max(10, Math.min(100, Math.round(100 - Math.max(0, logisticsUtilization - 80) * 1.7))),
    financial: Math.max(10, Math.min(100, Math.round(Math.min(100, (profitMarginPercent / 25) * 100)))),
  };

  // 11. High-level Bottlenecks & Recommendations
  const bottlenecks: string[] = [];
  const recommendations: string[] = [];

  if (employeeUtilization > 100) {
    bottlenecks.push(`Direct shopfloor staffing is over-utilized at ${employeeUtilization}% (Overtime load: ${Math.round(overtimeHoursUsed)}h).`);
    recommendations.push(`Authorize temporary contract workers (+${Math.ceil((requiredLaborHours - standardLaborCapacityHours) / 160)} headcount) to prevent worker fatigue and defect spikes.`);
  }

  if (machineUtilization > 100) {
    bottlenecks.push(`Factory machine lines exceed 100% capacity threshold (${machineUtilization}% utilized). Machine queue backlog will accumulate.`);
    if (params.shiftCount < 3) {
      recommendations.push('Ramp up Shift 3 (Night Shift) across Assembly Lines to add +40% throughput.');
    } else {
      recommendations.push('Contract overflow production to approved Tier-1 OEM manufacturing partners.');
    }
  }

  if (stockoutRiskDays) {
    bottlenecks.push(`Component inventory safety stock drops to critical ${effectiveDaysOfSupply} days. Stockout risk anticipated in ~${stockoutRiskDays} days.`);
    recommendations.push('Trigger supplier safety buffer reorders immediately and expedite inbound shipments.');
  }

  if (logisticsUtilization > 100) {
    bottlenecks.push(`Order shipping logistics exceeded by ${logisticsUtilization - 100}%. Projected average delivery delay: ${fulfillmentDelayDays} business days.`);
    recommendations.push(`Scale 3PL outsourced carrier allocation from ${params.thirdPartyLogisticsShare}% to ${Math.min(100, params.thirdPartyLogisticsShare + 25)}% to eliminate fulfillment delay.`);
  }

  if (bottlenecks.length === 0) {
    bottlenecks.push('No severe operational bottlenecks identified under current parameters.');
    recommendations.push('Operations are running in optimal sweet spot. Consider increasing sales goals or pre-building inventory for upcoming quarter.');
  }

  return {
    baselineRevenue: baselineMonthlyRevenue,
    simulatedRevenue: simulatedMonthlyRevenue,
    revenueDelta,
    baselineOpex: baselineMonthlyOpex,
    simulatedOpex: simulatedMonthlyOpex,
    baselineProfit: baselineMonthlyProfit,
    simulatedProfit: simulatedMonthlyProfit,
    profitMarginPercent,
    profitMarginDelta,
    employeeUtilization,
    inventoryTurnoverDays: effectiveDaysOfSupply,
    stockoutRiskDays,
    machineUtilization,
    logisticsUtilization,
    fulfillmentDelayDays,
    feasibilityScore,
    bottleneckIndex,
    systemHealthStatus,
    healthColor,
    constraints,
    projections,
    dimensionScores,
    bottlenecks,
    recommendations,
  };
}

export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${amount.toLocaleString()}`;
}
