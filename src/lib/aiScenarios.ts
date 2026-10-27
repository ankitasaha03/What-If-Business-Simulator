import { AIChatMessage, SimulationParameters } from './types';
import { runBusinessSimulation, formatCurrency, DEFAULT_PARAMETERS } from './simulationEngine';

export interface QuickPrompt {
  label: string;
  query: string;
  category: 'growth' | 'supply' | 'workforce' | 'pricing';
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Simulate +20% Sales (Zero Hiring)',
    query: 'What happens if we increase sales by 20% next quarter without hiring new staff?',
    category: 'growth',
  },
  {
    label: 'Can logistics handle +30% surge?',
    query: 'Can we handle a 30% surge in inventory demand using our current warehouse logistics fleet?',
    category: 'growth',
  },
  {
    label: 'Supply Chain Shock (-35% Buffer)',
    query: 'Simulate a raw material disruption with 35% cut in inventory buffer and 20% fleet reduction.',
    category: 'supply',
  },
  {
    label: 'Labor Crunch (-20 Headcount)',
    query: 'What is the operational impact if 20 factory workers leave and no overtime is permitted?',
    category: 'workforce',
  },
  {
    label: 'Ramp Up 3 Shifts (+45% Output)',
    query: 'Evaluate moving from 2 shifts to 3 shifts with 45% sales increase and 30% 3PL logistics backup.',
    category: 'growth',
  },
  {
    label: 'Inflation & Margin Defense (+8% Price)',
    query: 'Simulate raising average selling price by 8% with modest 5% sales increase and 40-day inventory.',
    category: 'pricing',
  },
];

export function parseNaturalLanguageQuery(
  query: string,
  currentParams: SimulationParameters
): {
  parsedParams: SimulationParameters;
  responseText: string;
  analysis: AIChatMessage['analysis'];
} {
  const lower = query.toLowerCase();
  const nextParams: SimulationParameters = { ...currentParams };

  // 1. Sales Growth parsing
  const salesMatch = lower.match(/(?:sales|demand|revenue|growth)\s*(?:by|of)?\s*([+-]?\d+)\s*%/i) ||
                     lower.match(/([+-]?\d+)\s*%\s*(?:sales|growth|demand|surge|increase)/i);
  if (salesMatch) {
    const val = parseInt(salesMatch[1], 10);
    if (!isNaN(val)) nextParams.salesGrowth = Math.max(-20, Math.min(100, val));
  } else if (lower.includes('+20%') || lower.includes('20% sales') || lower.includes('increase sales by 20%')) {
    nextParams.salesGrowth = 20;
  } else if (lower.includes('+30%') || lower.includes('30% surge')) {
    nextParams.salesGrowth = 30;
  } else if (lower.includes('+45%') || lower.includes('45% sales')) {
    nextParams.salesGrowth = 45;
  } else if (lower.includes('+50%') || lower.includes('50% surge')) {
    nextParams.salesGrowth = 50;
  }

  // 2. Headcount parsing
  if (lower.includes('without hiring') || lower.includes('zero hiring') || lower.includes('no new staff') || lower.includes('current staff')) {
    nextParams.headcountDelta = 0;
  } else {
    const staffMatch = lower.match(/([+-]?\d+)\s*(?:staff|workers|employees|headcount|people|technicians)/i);
    if (staffMatch) {
      const val = parseInt(staffMatch[1], 10);
      if (!isNaN(val)) nextParams.headcountDelta = Math.max(-50, Math.min(100, val));
    } else if (lower.includes('hiring 15') || lower.includes('add 15 staff')) {
      nextParams.headcountDelta = 15;
    } else if (lower.includes('20 factory workers leave') || lower.includes('lose 20')) {
      nextParams.headcountDelta = -20;
    }
  }

  // 3. Shift adjustments
  if (lower.includes('3 shift') || lower.includes('three shift') || lower.includes('3-shift') || lower.includes('graveyard')) {
    nextParams.shiftCount = 3;
  } else if (lower.includes('1 shift') || lower.includes('single shift') || lower.includes('one shift')) {
    nextParams.shiftCount = 1;
  } else if (lower.includes('2 shift') || lower.includes('two shift')) {
    nextParams.shiftCount = 2;
  }

  // 4. Overtime rules
  if (lower.includes('no overtime') || lower.includes('overtime is prohibited') || lower.includes('without overtime')) {
    nextParams.overtimeAllowed = false;
  } else if (lower.includes('allow overtime') || lower.includes('with overtime') || lower.includes('weekend overtime')) {
    nextParams.overtimeAllowed = true;
  }

  // 5. Inventory & Supply Chain
  if (lower.includes('supply chain shock') || lower.includes('raw material disruption') || lower.includes('buffer disruption')) {
    nextParams.inventoryBufferDays = 14;
    nextParams.fleetCapacityDelta = -15;
  } else {
    const bufferMatch = lower.match(/(\d+)\s*(?:days|day)\s*(?:buffer|inventory|stock)/i);
    if (bufferMatch) {
      const val = parseInt(bufferMatch[1], 10);
      if (!isNaN(val)) nextParams.inventoryBufferDays = Math.max(5, Math.min(90, val));
    }
  }

  // 6. Logistics & 3PL
  if (lower.includes('3pl') || lower.includes('third party') || lower.includes('carrier')) {
    const threePlMatch = lower.match(/(\d+)\s*%\s*(?:3pl|third party|outsourc)/i);
    if (threePlMatch) {
      const val = parseInt(threePlMatch[1], 10);
      if (!isNaN(val)) nextParams.thirdPartyLogisticsShare = Math.max(0, Math.min(100, val));
    } else if (lower.includes('increase 3pl') || lower.includes('3pl backup')) {
      nextParams.thirdPartyLogisticsShare = 35;
    }
  }

  if (lower.includes('expedited') || lower.includes('air freight') || lower.includes('rush delivery')) {
    nextParams.expeditedShipping = true;
  }

  // 7. Pricing
  const priceMatch = lower.match(/([+-]?\d+)\s*%\s*(?:price|pricing|asp)/i);
  if (priceMatch) {
    const val = parseInt(priceMatch[1], 10);
    if (!isNaN(val)) nextParams.priceAdjustment = Math.max(-20, Math.min(30, val));
  }

  // Run calculation with updated parameters
  const result = runBusinessSimulation(nextParams);

  // Synthesize AI structured report
  const feasibility = result.feasibilityScore;
  const healthTag: 'Optimal' | 'Strained' | 'Critical' =
    feasibility >= 80 ? 'Optimal' : feasibility >= 60 ? 'Strained' : 'Critical';

  const financialSummary = `Projected Revenue: ${formatCurrency(result.simulatedRevenue)} (${result.revenueDelta >= 0 ? '+' : ''}${formatCurrency(result.revenueDelta)}), Operating Profit: ${formatCurrency(result.simulatedProfit)} with ${result.profitMarginPercent}% Margin (${result.profitMarginDelta >= 0 ? '+' : ''}${result.profitMarginDelta}% delta).`;

  const responseText = `I have parsed your scenario and simulated the strategic impact across our workforce, machinery, safety stock, and freight logistics.

### 📊 Simulation Verdict: **${feasibility}% Feasibility (${healthTag})**
${healthTag === 'Optimal' 
  ? 'The business infrastructure can comfortably absorb this scenario with nominal strain.' 
  : healthTag === 'Strained'
  ? 'The organization can absorb this demand but will experience notable overtime burn and logistics delays without proactive mitigation.'
  : '⚠️ High Risk of operational failure: Capacity thresholds breached across multiple departments resulting in backlog accumulation and unfulfilled customer orders.'}

You can apply these exact scenario parameters directly to your live dashboard using the button below.`;

  return {
    parsedParams: nextParams,
    responseText,
    analysis: {
      feasibilityScore: feasibility,
      healthTag,
      bottlenecks: result.bottlenecks,
      financialSummary,
      recommendations: result.recommendations,
    },
  };
}

export const INITIAL_CHAT_HISTORY: AIChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    timestamp: '10:00 AM',
    text: `Hello, I am your **OmniSim Strategic Scenario Analyst**. 

Ask me any "what-if" operational scenario in plain English, and I will test it against our workforce capacity, factory machine shifts, inventory buffers, and freight fleet.

**Try asking:**
- *"What happens if we increase sales by 20% next quarter without hiring new staff?"*
- *"Can we handle a 30% surge in inventory demand using our current warehouse logistics?"*
- *"Simulate a raw material disruption with 35% cut in safety stock buffer."*`,
  },
];
