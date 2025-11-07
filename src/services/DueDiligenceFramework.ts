// Elite Due Diligence and Strategic Thinking Framework
// Based on methodologies from top-tier firms: McKinsey, BCG, Bain, Goldman Sachs, KKR, TPG

import { ApplicationMode, AdvisorRole } from '../types';

export interface DueDiligenceAnalysis {
  overview: string;
  keyFindings: string[];
  riskAssessment: RiskAnalysis;
  recommendedActions: string[];
  confidence: 'High' | 'Medium' | 'Low';
  methodology: string;
}

export interface RiskAnalysis {
  criticalRisks: Risk[];
  mitigationStrategies: string[];
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskCategories: {
    commercial: Risk[];
    financial: Risk[];
    operational: Risk[];
    regulatory: Risk[];
    technology: Risk[];
    strategic: Risk[];
  };
}

export interface Risk {
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string[];
}

export interface StrategicThinking {
  strategicOptions: StrategicOption[];
  recommendations: string[];
  implementation: ImplementationPlan;
  successMetrics: string[];
  riskMitigation: string[];
}

export interface StrategicOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  feasibility: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  timeframe: string;
  resources: string[];
}

export interface ImplementationPlan {
  phases: Phase[];
  timeline: string;
  resources: string[];
  dependencies: string[];
  milestones: string[];
}

export interface Phase {
  name: string;
  duration: string;
  activities: string[];
  deliverables: string[];
  risks: string[];
}

// Due Diligence Frameworks by Role
export const DUE_DILIGENCE_FRAMEWORKS = {
  'Due Diligence Director': {
    approach: `
COMPREHENSIVE DUE DILIGENCE METHODOLOGY (McKinsey/Goldman Sachs Model):

1. COMMERCIAL DUE DILIGENCE:
   • Market Analysis: Size, growth, trends, cyclicality, competitive dynamics
   • Customer Analysis: Concentration, loyalty, switching costs, contract terms
   • Competitive Position: Market share, differentiation, barriers to entry
   • Revenue Quality: Sustainability, growth drivers, pricing power

2. FINANCIAL DUE DILIGENCE:
   • Quality of Earnings: Normalize for one-time items, working capital changes
   • Cash Flow Analysis: Free cash flow generation, conversion, predictability
   • Balance Sheet Review: Asset quality, debt structure, off-balance items
   • Financial Projections: Validate assumptions, stress test scenarios

3. OPERATIONAL DUE DILIGENCE:
   • Management Assessment: Track record, depth, succession planning
   • Operational Efficiency: Cost structure, scalability, automation potential
   • Systems & Processes: ERP, reporting, controls, audit findings
   • Human Capital: Key person risk, culture, retention, compensation

4. STRATEGIC DUE DILIGENCE:
   • Strategic Rationale: Synergies, portfolio fit, growth acceleration
   • Integration Planning: Complexity, timeline, execution risk
   • Value Creation: Organic growth, operational improvements, financial engineering
   • Exit Strategy: Strategic buyers, IPO readiness, multiple expansion

5. RISK ASSESSMENT:
   • Regulatory: Compliance, licenses, pending litigation
   • Technology: IP, cybersecurity, digital transformation needs
   • ESG: Environmental liabilities, social license, governance issues
   • Macro: Economic sensitivity, currency exposure, political risk
`,
    keyQuestions: [
      'What are the primary value drivers and how sustainable are they?',
      'What are the 3-5 most critical risks that could impact value?',
      'How does the management team compare to industry best-in-class?',
      'What operational improvements could drive material value creation?',
      'What regulatory, competitive, or technology disruption risks exist?',
      'How defensible is the competitive position over 3-5 years?',
      'What scenarios could cause 25%+ value destruction?',
    ],
    analysisFramework: [
      'SWOT Analysis with quantified impact assessment',
      "Porter's Five Forces for competitive dynamics",
      'BCG Growth-Share Matrix for portfolio analysis',
      'McKinsey 7S Framework for organizational assessment',
      'Real Options Valuation for strategic flexibility',
      'Monte Carlo simulation for risk modeling',
    ],
  },

  'Financial Architecture Advisor': {
    approach: `
FINANCIAL ARCHITECTURE & VALUATION METHODOLOGY:

1. VALUATION ANALYSIS:
   • DCF Modeling: Build detailed 3-statement model with multiple scenarios
   • Comparable Analysis: Trading and transaction multiples with adjustments
   • Precedent Transactions: Recent deals with strategic/financial premiums
   • Asset-Based Approach: NAV, liquidation value for asset-heavy businesses
   • Real Options: Value flexibility, growth options, abandonment options

2. CAPITAL STRUCTURE OPTIMIZATION:
   • Debt Capacity: Cash flow coverage, leverage ratios, covenant analysis
   • Cost of Capital: WACC optimization across capital structure scenarios
   • Refinancing Analysis: Term sheets, pricing, covenant terms
   • Equity Structure: Liquidation preferences, participation rights, anti-dilution

3. FINANCIAL RISK ASSESSMENT:
   • Credit Analysis: Rating methodology, probability of default
   • Liquidity Analysis: Cash flow timing, covenant headroom, refinancing risk
   • Interest Rate Risk: Sensitivity to rate changes, hedging strategies
   • Currency Risk: Exposure analysis, natural hedges, derivative instruments

4. SCENARIO & STRESS TESTING:
   • Base/Upside/Downside cases with probability-weighted outcomes
   • Stress scenarios: Recession, competitive pressure, technology disruption
   • Monte Carlo simulation: Key variable distributions and correlations
   • Sensitivity analysis: Tornado charts for value drivers
`,
    keyQuestions: [
      'What is the appropriate discount rate given business risk profile?',
      'How sensitive is valuation to key operating assumptions?',
      'What is the optimal capital structure for this business model?',
      'What financing alternatives exist and at what cost?',
      'How does leverage impact returns under different scenarios?',
      'What financial risks require active management or hedging?',
      'What are the key financial covenants and headroom?',
    ],
    analysisFramework: [
      'DCF with Monte Carlo simulation for uncertainty',
      'LBO analysis with multiple exit scenarios',
      'Credit rating methodology and covenant analysis',
      'Capital structure optimization models',
      'Real options valuation for strategic flexibility',
      'Sensitivity and scenario analysis',
    ],
  },

  'Executive Meeting Facilitator & Behavioral Economics Expert': {
    approach: `
BEHAVIORAL ECONOMICS MEETING FACILITATION FRAMEWORK (Based on Kahneman, Thaler, & Sunstein Research):

1. PRE-MEETING SETUP:
   • Cognitive Bias Assessment: Identify potential biases likely to affect this specific discussion
   • Agenda Design: Structure using "choice architecture" principles to optimize decision flow
   • Stakeholder Analysis: Map influence patterns, communication styles, and potential conflict points
   • Environmental Design: Set physical/virtual environment to promote psychological safety

2. OPENING FACILITATION:
   • Establish Psychological Safety: Use inclusive check-ins and ground rule setting
   • Frame the Problem Space: Apply "prospect theory" to present challenges and opportunities objectively
   • Set Decision Criteria: Establish clear success metrics and evaluation frameworks upfront
   • Bias Inoculation: Briefly educate on cognitive traps relevant to today's discussion

3. DISCUSSION FACILITATION:
   • Structured Information Sharing: Use "Red Team/Blue Team" approaches to surface all perspectives
   • Devil's Advocate Protocols: Systematically challenge assumptions and groupthink
   • Silent Start Technique: Begin with individual reflection to prevent anchoring bias
   • Round-Robin Participation: Ensure equal airtime using structured contribution protocols

4. DECISION ARCHITECTURE:
   • Option Generation: Use "divergent-convergent" thinking cycles to expand then focus choices
   • Scenario Planning: Apply "prospective hindsight" to imagine future success/failure scenarios
   • Stakeholder Impact Analysis: Systematically consider all affected parties
   • Implementation Feasibility: Reality-test decisions using "planning fallacy" countermeasures

5. CONFLICT RESOLUTION & CONSENSUS BUILDING:
   • Interest-Based Problem Solving: Move from positions to underlying interests and needs
   • Principled Negotiation: Apply Harvard Negotiation Project methodologies
   • Collaborative Exploration: Transform disagreement into joint problem-solving
   • Win-Win Architecture: Design solutions that create value for all parties

6. CLOSING & COMMITMENT:
   • Decision Crystallization: Ensure clear, specific, measurable outcomes
   • Commitment Devices: Apply behavioral psychology to strengthen follow-through
   • Next Steps Protocol: Assign ownership, timelines, and accountability mechanisms
   • Success Metrics: Establish how progress will be measured and reviewed
`,
    keyQuestions: [
      'What cognitive biases might be affecting our thinking about this issue?',
      'How can we structure this conversation to hear from all perspectives?',
      'What would our future selves want us to consider that we might be overlooking?',
      'How can we design this decision process to lead to the best long-term outcomes?',
      'What would need to be true for this solution to succeed beyond our expectations?',
      'How might we be unconsciously limiting our options or thinking too narrowly?',
      'What systematic approach would help us make the most informed decision?',
    ],
    analysisFramework: [
      'Behavioral Economics Decision Architecture',
      'Cognitive Bias Identification and Mitigation',
      "Structured Facilitation Techniques (Robert's Rules + Modern Methods)",
      'Psychological Safety and Inclusion Assessment',
      'Group Dynamics and Participation Optimization',
      'Interest-Based Conflict Resolution',
      'Commitment Psychology and Follow-Through Design',
    ],
  },

  'Chief Strategy Advisor': {
    approach: `
STRATEGIC THINKING & PLANNING METHODOLOGY (Porter/BCG Model):

1. STRATEGIC SITUATION ANALYSIS:
   • Industry Structure: Five Forces analysis with profit pool mapping
   • Competitive Dynamics: Strategic groups, mobility barriers, game theory
   • Value Chain Analysis: Activity mapping, cost/differentiation drivers
   • Core Competency Assessment: Resource-based view, dynamic capabilities

2. STRATEGIC OPTIONS GENERATION:
   • Growth Strategies: Organic, acquisition, partnership, international
   • Competitive Strategies: Cost leadership, differentiation, focus
   • Portfolio Strategy: Core/adjacent/transformational opportunities
   • Innovation Strategy: R&D, technology platforms, business model innovation

3. STRATEGIC OPTION EVALUATION:
   • Strategic Fit: Alignment with capabilities and culture
   • Market Attractiveness: Size, growth, profitability, structure
   • Competitive Advantage: Sustainability, defensibility, scalability
   • Financial Attractiveness: IRR, NPV, payback, option value

4. IMPLEMENTATION PLANNING:
   • Strategic Roadmap: Sequencing, dependencies, milestones
   • Capability Building: Skills, systems, processes, culture
   • Resource Allocation: Capital, talent, management attention
   • Performance Management: KPIs, dashboards, governance
`,
    keyQuestions: [
      'What sustainable competitive advantages exist or can be built?',
      'Where will this industry compete and win in the next 5 years?',
      'What strategic options create the most stakeholder value?',
      'How do we build dynamic capabilities for future competition?',
      'What ecosystem partnerships could accelerate growth?',
      'How do we balance core business optimization with transformation?',
      'What strategic uncertainties require real options thinking?',
    ],
    analysisFramework: [
      "Porter's Five Forces with profit pool analysis",
      'BCG Growth-Share Matrix with strategic options',
      'Blue Ocean Strategy canvas for differentiation',
      'Real Options framework for uncertainty',
      'Dynamic capabilities assessment',
      'Strategic group mapping and mobility analysis',
    ],
  },
};

// Strategic Thinking Prompts by Business Context
export const STRATEGIC_THINKING_PROMPTS = {
  startup: {
    keyQuestions: [
      'What is the minimum viable product and path to product-market fit?',
      'How do we achieve sustainable unit economics and scalability?',
      'What defensible moats can we build before competitors respond?',
      'How do we sequence market expansion and capital raising?',
      'What strategic partnerships could accelerate growth?',
    ],
    frameworks: [
      'Lean Startup',
      'Product-Market Fit',
      'Unit Economics',
      'Network Effects',
      'Platform Strategy',
    ],
  },

  growth: {
    keyQuestions: [
      'How do we scale operations while maintaining quality and culture?',
      'What new markets/segments offer the highest growth potential?',
      'How do we balance organic growth with strategic acquisitions?',
      'What operational leverage can we create through technology?',
      'How do we build sustainable competitive advantages?',
    ],
    frameworks: [
      'Scale-Up Framework',
      'Market Expansion',
      'Operational Excellence',
      'Technology Scaling',
      'M&A Strategy',
    ],
  },

  mature: {
    keyQuestions: [
      'How do we drive growth in mature/declining markets?',
      'What adjacent markets or business models should we explore?',
      'How do we optimize costs while investing in transformation?',
      'What disruptive threats require strategic response?',
      'How do we unlock value through portfolio optimization?',
    ],
    frameworks: [
      'Portfolio Strategy',
      'Core/Adjacent/Transformational',
      'Digital Transformation',
      'Cost Optimization',
      'Business Model Innovation',
    ],
  },
};

// Enhanced prompt generation for due diligence and strategic thinking
export function generateDueDiligencePrompt(
  advisorRole: AdvisorRole,
  businessContext: string,
  documentContext?: string
): string {
  const framework = DUE_DILIGENCE_FRAMEWORKS[advisorRole as keyof typeof DUE_DILIGENCE_FRAMEWORKS];

  if (!framework) {
    return generateGenericDueDiligencePrompt(advisorRole, businessContext, documentContext);
  }

  return `
You are conducting world-class due diligence analysis. Use the following systematic approach:

${framework.approach}

KEY ANALYTICAL QUESTIONS:
${framework.keyQuestions.map(q => `• ${q}`).join('\n')}

ANALYTICAL FRAMEWORKS TO APPLY:
${framework.analysisFramework.map(f => `• ${f}`).join('\n')}

BUSINESS CONTEXT:
${businessContext}

${
  documentContext
    ? `
DOCUMENT ANALYSIS:
Analyze the following documents/information systematically:
${documentContext}

For each piece of information, assess:
1. Reliability and quality of the data
2. Implications for investment thesis
3. Red flags or areas requiring deeper investigation
4. Supporting evidence needed for validation
`
    : ''
}

DELIVERABLE FORMAT:
Provide your analysis in this structure:
1. Executive Summary (2-3 key takeaways)
2. Critical Findings (prioritized by importance)
3. Risk Assessment (with probability and impact)
4. Recommendations (specific and actionable)
5. Information Gaps (what additional data is needed)

Maintain the analytical rigor and skeptical mindset of a top-tier due diligence professional.
`;
}

export function generateStrategicThinkingPrompt(
  businessStage: 'startup' | 'growth' | 'mature',
  challenge: string,
  documentContext?: string
): string {
  const prompt = STRATEGIC_THINKING_PROMPTS[businessStage];

  return `
You are providing world-class strategic thinking and planning advice.

BUSINESS STAGE: ${businessStage.toUpperCase()}

STRATEGIC CHALLENGE:
${challenge}

KEY STRATEGIC QUESTIONS FOR THIS STAGE:
${prompt.keyQuestions.map(q => `• ${q}`).join('\n')}

RELEVANT FRAMEWORKS:
${prompt.frameworks.map(f => `• ${f}`).join('\n')}

${
  documentContext
    ? `
CONTEXT ANALYSIS:
Analyze the following information to inform strategic recommendations:
${documentContext}
`
    : ''
}

STRATEGIC ANALYSIS APPROACH:
1. Situation Analysis: Current position, competitive dynamics, market trends
2. Option Generation: Multiple strategic alternatives with clear trade-offs
3. Option Evaluation: Feasibility, attractiveness, strategic fit assessment
4. Recommendation: Preferred strategy with implementation roadmap
5. Risk Management: Key risks and mitigation strategies

DELIVERABLE FORMAT:
1. Strategic Assessment (current situation and key insights)
2. Strategic Options (3-5 alternatives with pros/cons)
3. Recommended Strategy (clear rationale and expected outcomes)
4. Implementation Plan (phases, timeline, resources, milestones)
5. Success Metrics (KPIs to track progress and adjust strategy)

Think like a top-tier strategy consultant combining analytical rigor with practical implementation insights.
`;
}

function generateGenericDueDiligencePrompt(
  advisorRole: AdvisorRole,
  businessContext: string,
  documentContext?: string
): string {
  return `
You are providing expert due diligence analysis from the perspective of a ${advisorRole}.

BUSINESS CONTEXT:
${businessContext}

${
  documentContext
    ? `
DOCUMENT ANALYSIS:
${documentContext}
`
    : ''
}

Apply systematic due diligence methodology relevant to your expertise:
1. Identify key value drivers and risks
2. Assess quality and sustainability of business model
3. Evaluate competitive position and market dynamics
4. Analyze management team and execution capability
5. Provide risk-adjusted recommendations

Maintain professional skepticism and analytical rigor throughout your analysis.
`;
}

export function getDueDiligenceQuestions(advisorRole: AdvisorRole): string[] {
  const framework = DUE_DILIGENCE_FRAMEWORKS[advisorRole as keyof typeof DUE_DILIGENCE_FRAMEWORKS];
  return (
    framework?.keyQuestions || [
      'What are the key value drivers for this business?',
      'What are the most significant risks to consider?',
      'How does this opportunity compare to similar investments?',
      'What additional information is needed for decision-making?',
    ]
  );
}

export function getStrategicFrameworks(businessStage: 'startup' | 'growth' | 'mature'): string[] {
  return STRATEGIC_THINKING_PROMPTS[businessStage].frameworks;
}
