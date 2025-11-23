/**
 * VC Analysis Framework
 * Provides specialized analysis frameworks used by top-tier VC partners
 */

export interface VCFramework {
  name: string;
  description: string;
  criteria: Array<{
    category: string;
    weight: number;
    questions: string[];
  }>;
  scoringGuidelines: string;
}

/**
 * Collection of VC analysis frameworks
 */
export class VCAnalysisFramework {
  /**
   * Sequoia Capital's framework
   */
  static readonly SEQUOIA_FRAMEWORK: VCFramework = {
    name: 'Sequoia Capital Investment Framework',
    description:
      "Sequoia's time-tested framework focusing on market, product, team, and business model",
    criteria: [
      {
        category: 'Market',
        weight: 0.25,
        questions: [
          'Is the market large and growing?',
          'Is there a clear customer pain point?',
          'What are the market dynamics and competitive landscape?',
          'Is timing right for this solution?',
          'What is the TAM/SAM/SOM breakdown?',
        ],
      },
      {
        category: 'Product',
        weight: 0.25,
        questions: [
          'Does the product solve a critical problem?',
          'Is there clear product-market fit?',
          'What is the competitive differentiation?',
          'Is the technology defensible?',
          'What is the product roadmap?',
        ],
      },
      {
        category: 'Team',
        weight: 0.3,
        questions: [
          'Do founders have domain expertise?',
          'Is the team complete for current stage?',
          'What is the track record of founders?',
          'Can they attract top talent?',
          'Is there complementary skill sets?',
        ],
      },
      {
        category: 'Business Model',
        weight: 0.2,
        questions: [
          'Are unit economics compelling?',
          'What is the customer acquisition strategy?',
          'Is the go-to-market strategy clear?',
          'What are the revenue streams?',
          'Is there a path to profitability?',
        ],
      },
    ],
    scoringGuidelines:
      'Score each criterion 1-10. Multiply by weights. Total score >70 = strong interest, 60-70 = moderate interest, <60 = pass.',
  };

  /**
   * Andreessen Horowitz (a16z) framework
   */
  static readonly A16Z_FRAMEWORK: VCFramework = {
    name: 'Andreessen Horowitz Investment Framework',
    description:
      "a16z's framework emphasizing product-market fit, founder strength, and disruptive potential",
    criteria: [
      {
        category: 'Founder-Market Fit',
        weight: 0.35,
        questions: [
          'Why are these founders uniquely positioned?',
          'Do they have unfair advantages?',
          'Are they "missionaries" not "mercenaries"?',
          'Can they articulate a compelling vision?',
          'Do they have the resilience for the journey?',
        ],
      },
      {
        category: 'Product Vision & Execution',
        weight: 0.25,
        questions: [
          'Is there clear product-market fit evidence?',
          'What is the product velocity?',
          'Are they building something people want?',
          'Is the product 10x better than alternatives?',
          'What is the technology moat?',
        ],
      },
      {
        category: 'Market Disruption Potential',
        weight: 0.25,
        questions: [
          'Is this a zero-to-one or one-to-n opportunity?',
          'What incumbents are vulnerable?',
          'Is timing favorable for disruption?',
          'What is the long-term market size?',
          'Are there network effects?',
        ],
      },
      {
        category: 'Metrics & Traction',
        weight: 0.15,
        questions: [
          'What are the key growth metrics?',
          'Is growth sustainable or fueled by spend?',
          'What is the retention/cohort analysis?',
          'Are unit economics improving?',
          'What is the viral coefficient?',
        ],
      },
    ],
    scoringGuidelines:
      'Emphasize founder quality and market potential over current metrics for early-stage. Look for exceptional founders in large markets.',
  };

  /**
   * Y Combinator's framework
   */
  static readonly YC_FRAMEWORK: VCFramework = {
    name: 'Y Combinator Evaluation Framework',
    description: "YC's framework focusing on founders, idea, product, and growth potential",
    criteria: [
      {
        category: 'Founders',
        weight: 0.4,
        questions: [
          'Are founders determined and resourceful?',
          'Do they communicate clearly?',
          'Are they domain experts?',
          'Can they execute quickly?',
          'Do they work well together?',
        ],
      },
      {
        category: 'Idea',
        weight: 0.25,
        questions: [
          'Is the idea clear and concise?',
          'Is it solving a real problem?',
          'Is the market large enough?',
          "Why now? Why hasn't this been done before?",
          'What is unique about the approach?',
        ],
      },
      {
        category: 'Product',
        weight: 0.2,
        questions: [
          'Do users love the product?',
          'What is the evidence of product-market fit?',
          'How fast are they iterating?',
          'What is the retention rate?',
          'Are there organic growth signals?',
        ],
      },
      {
        category: 'Growth Potential',
        weight: 0.15,
        questions: [
          'What is the growth rate?',
          'Is growth accelerating?',
          'What are the growth drivers?',
          'Can this scale to $100M+ revenue?',
          'What are the expansion opportunities?',
        ],
      },
    ],
    scoringGuidelines:
      'Heavy emphasis on founder quality. Look for "cockroach" founders who won\'t give up. Growth rate is crucial.',
  };

  /**
   * First Round Capital's framework
   */
  static readonly FIRST_ROUND_FRAMEWORK: VCFramework = {
    name: 'First Round Capital Seed Framework',
    description: "First Round's seed-stage framework focusing on early signals",
    criteria: [
      {
        category: 'Founding Team DNA',
        weight: 0.35,
        questions: [
          'Do founders have unique insights?',
          'Are they customer-obsessed?',
          'Do they have technical depth?',
          'Can they recruit A-players?',
          'Are they coachable?',
        ],
      },
      {
        category: 'Market Opportunity',
        weight: 0.25,
        questions: [
          'Is the market underserved?',
          'Are there changing market dynamics?',
          'Is entry timing advantageous?',
          'What is the wedge strategy?',
          'Can they own a category?',
        ],
      },
      {
        category: 'Early Product Evidence',
        weight: 0.25,
        questions: [
          'Are there passionate early users?',
          'What is the NPS score?',
          'Is there organic word-of-mouth?',
          'What is the retention curve?',
          'Are there "aha moments"?',
        ],
      },
      {
        category: 'Capital Efficiency',
        weight: 0.15,
        questions: [
          'What is the burn rate?',
          'How far does capital take them?',
          'What are the key milestones?',
          'Is there a lean startup approach?',
          'What is CAC payback period?',
        ],
      },
    ],
    scoringGuidelines:
      'At seed stage, bet on exceptional founders with strong early signals. Capital efficiency is key.',
  };

  /**
   * Framework for due diligence scorecards
   */
  static readonly DUE_DILIGENCE_SCORECARD: VCFramework = {
    name: 'Comprehensive Due Diligence Scorecard',
    description: 'Detailed scorecard for systematic evaluation across all key dimensions',
    criteria: [
      {
        category: 'Team Assessment',
        weight: 0.25,
        questions: [
          'Founder backgrounds and relevant experience?',
          'Completeness of current team?',
          'Advisory board strength?',
          'Previous startup experience?',
          'Technical capabilities?',
          'Sales and go-to-market expertise?',
          'Cultural fit and values alignment?',
        ],
      },
      {
        category: 'Market Analysis',
        weight: 0.2,
        questions: [
          'TAM size and growth rate?',
          'SAM/SOM realistic and achievable?',
          'Market structure and dynamics?',
          'Customer segmentation clarity?',
          'Regulatory environment?',
          'Market timing and tailwinds?',
        ],
      },
      {
        category: 'Product & Technology',
        weight: 0.2,
        questions: [
          'Product differentiation and uniqueness?',
          'Technology stack and scalability?',
          'IP and defensibility?',
          'Product roadmap clarity?',
          'Technical debt assessment?',
          'Platform vs. point solution?',
        ],
      },
      {
        category: 'Traction & Metrics',
        weight: 0.15,
        questions: [
          'Revenue growth rate?',
          'Customer acquisition metrics?',
          'Retention and churn rates?',
          'NPS and customer satisfaction?',
          'Gross margin trajectory?',
          'Key milestone achievements?',
        ],
      },
      {
        category: 'Business Model & Economics',
        weight: 0.1,
        questions: [
          'Unit economics (LTV/CAC)?',
          'Pricing strategy and power?',
          'Revenue model sustainability?',
          'Gross margin structure?',
          'Path to profitability?',
        ],
      },
      {
        category: 'Competitive Position',
        weight: 0.1,
        questions: [
          'Competitive landscape mapping?',
          'Sustainable competitive advantages?',
          'Switching costs for customers?',
          'Network effects presence?',
          'Barriers to entry for competitors?',
        ],
      },
    ],
    scoringGuidelines:
      'Score each question 1-5. Calculate weighted average. >4.0 = strong investment, 3.5-4.0 = proceed with diligence, <3.5 = pass.',
  };

  /**
   * Get framework by name
   */
  static getFramework(name: string): VCFramework | undefined {
    const frameworks: Record<string, VCFramework> = {
      sequoia: this.SEQUOIA_FRAMEWORK,
      a16z: this.A16Z_FRAMEWORK,
      yc: this.YC_FRAMEWORK,
      'first-round': this.FIRST_ROUND_FRAMEWORK,
      'due-diligence': this.DUE_DILIGENCE_SCORECARD,
    };

    return frameworks[name.toLowerCase()];
  }

  /**
   * Get all frameworks
   */
  static getAllFrameworks(): VCFramework[] {
    return [
      this.SEQUOIA_FRAMEWORK,
      this.A16Z_FRAMEWORK,
      this.YC_FRAMEWORK,
      this.FIRST_ROUND_FRAMEWORK,
      this.DUE_DILIGENCE_SCORECARD,
    ];
  }

  /**
   * Generate framework-based analysis prompt
   */
  static generateAnalysisPrompt(framework: VCFramework, documentContext: string): string {
    let prompt = `You are a senior VC partner conducting investment analysis using the ${framework.name}.

${framework.description}

Analyze the provided documents and evaluate them across these criteria:

`;

    for (const criterion of framework.criteria) {
      prompt += `\n## ${criterion.category} (Weight: ${(criterion.weight * 100).toFixed(0)}%)\n`;
      for (const question of criterion.questions) {
        prompt += `- ${question}\n`;
      }
    }

    prompt += `\n\n${framework.scoringGuidelines}

Return your analysis in JSON format:
{
  "overallScore": 75,
  "categoryScores": {
    "Market": 80,
    "Product": 75,
    ...
  },
  "categoryAssessments": {
    "Market": "Detailed assessment of market...",
    ...
  },
  "strengths": ["Key strength 1", "Key strength 2"],
  "weaknesses": ["Key weakness 1", "Key weakness 2"],
  "keyQuestions": ["Critical question 1", "Critical question 2"],
  "recommendation": "strong-yes|yes|maybe|no|pass",
  "reasoning": "Detailed reasoning for recommendation",
  "nextSteps": ["Next step 1", "Next step 2"]
}

Documents to analyze:
${documentContext}
`;

    return prompt;
  }

  /**
   * Common VC red flags to check
   */
  static readonly RED_FLAGS = {
    financial: [
      'Declining revenue or negative growth',
      'Unsustainable unit economics (LTV < CAC)',
      'Excessive burn rate with no path to profitability',
      'Poor gross margins (<50% for SaaS)',
      'Very short runway (<6 months)',
      'Inconsistent financial reporting',
      'Large accounts receivable aging',
    ],
    team: [
      'Incomplete founding team',
      'High employee turnover',
      'Lack of domain expertise',
      'Poor communication skills',
      'Unwillingness to take feedback',
      'Founder conflicts or unclear roles',
      'Lack of technical depth',
    ],
    market: [
      'Shrinking market size',
      'Unclear customer segmentation',
      'Multiple pivots without traction',
      'Extremely fragmented market',
      'Regulatory headwinds',
      'Commoditized offering',
      'No clear wedge strategy',
    ],
    product: [
      'No product-market fit evidence',
      'High churn rate (>5% monthly for SaaS)',
      'Slow product iteration',
      'Technical debt concerns',
      'Heavy reliance on services revenue',
      'Easily replicable product',
      'Poor user engagement metrics',
    ],
    traction: [
      'Paid user acquisition with poor retention',
      'Revenue concentration (>50% from one customer)',
      'Declining engagement metrics',
      'No organic growth',
      'Fake or inflated metrics',
      'No repeat purchases or expansion',
    ],
  };

  /**
   * VC investment thesis templates
   */
  static readonly THESIS_TEMPLATES = {
    'enterprise-saas': {
      keyMetrics: ['ARR', 'NRR', 'CAC Payback', 'Magic Number', 'Rule of 40'],
      idealProfile: {
        arrGrowth: '>100% YoY',
        nrr: '>110%',
        cacPayback: '<12 months',
        magicNumber: '>0.75',
        ruleOf40: '>40',
      },
    },
    'consumer-marketplace': {
      keyMetrics: ['GMV', 'Take Rate', 'Liquidity', 'CAC/LTV', 'Frequency'],
      idealProfile: {
        gmvGrowth: '>200% YoY',
        takeRate: '15-25%',
        liquidityScore: '>70%',
        ltvCacRatio: '>3',
        monthlyFrequency: '>2',
      },
    },
    fintech: {
      keyMetrics: ['Transaction Volume', 'Revenue per Customer', 'Compliance', 'CAC', 'Fraud Rate'],
      idealProfile: {
        volumeGrowth: '>150% YoY',
        revenuePerCustomer: 'Increasing',
        regulatoryCompliance: 'Full',
        cac: 'Decreasing',
        fraudRate: '<0.1%',
      },
    },
  };
}
