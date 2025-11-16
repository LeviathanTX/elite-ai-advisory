/**
 * Financial Metrics Extractor
 * Extracts and analyzes financial metrics from documents using AI
 */

import { createClient } from '@supabase/supabase-js';
import { SecureAIServiceClient } from './secureAIService';

export interface FinancialMetric {
  metricType: MetricType;
  metricName: string;
  value?: number;
  valueString?: string;
  unit?: string;
  timePeriod?: string;
  periodStart?: Date;
  periodEnd?: Date;
  currency?: string;
  confidenceScore?: number;
  extractionMethod?: 'ai' | 'regex' | 'manual';
  context?: string;
}

export type MetricType =
  | 'revenue'
  | 'expenses'
  | 'gross-margin'
  | 'net-margin'
  | 'burn-rate'
  | 'runway'
  | 'arr'
  | 'mrr'
  | 'cac'
  | 'ltv'
  | 'ltv-cac-ratio'
  | 'growth-rate'
  | 'valuation'
  | 'headcount'
  | 'customers'
  | 'conversion-rate'
  | 'churn-rate'
  | 'market-size'
  | 'market-share'
  | 'other';

export interface FinancialSummary {
  documentId: string;
  companyName?: string;
  metrics: FinancialMetric[];
  keyInsights: string[];
  redFlags: string[];
  strengths: string[];
  overallAssessment: string;
}

export interface MetricComparison {
  metricType: MetricType;
  metricName: string;
  values: Array<{
    documentId: string;
    documentName: string;
    value: number;
    unit?: string;
    timePeriod?: string;
    periodStart?: Date;
  }>;
  trend?: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate?: number;
  insights: string[];
}

export class FinancialMetricsExtractor {
  private supabaseUrl: string;
  private supabaseKey: string;
  private aiClient: SecureAIServiceClient;

  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    aiClient: SecureAIServiceClient;
  }) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.aiClient = config.aiClient;
  }

  /**
   * Extract financial metrics from document text using AI
   */
  async extractMetrics(documentId: string, documentText: string): Promise<FinancialSummary> {
    try {
      const systemPrompt = `You are a financial analyst expert at extracting financial metrics from business documents, pitch decks, and financial reports.

Extract all financial metrics from the provided document and return them in the following JSON format:

{
  "companyName": "Company name if mentioned",
  "metrics": [
    {
      "metricType": "revenue|expenses|arr|mrr|cac|ltv|burn-rate|runway|growth-rate|etc",
      "metricName": "Descriptive name",
      "value": numeric value,
      "valueString": "Original text representation",
      "unit": "per month|per year|percentage|count",
      "timePeriod": "Q1 2024|2023|FY2024",
      "periodStart": "2024-01-01",
      "periodEnd": "2024-03-31",
      "currency": "USD",
      "confidenceScore": 0.95,
      "context": "Surrounding text that provides context"
    }
  ],
  "keyInsights": ["Key financial insight 1", "Key financial insight 2"],
  "redFlags": ["Potential concern 1", "Potential concern 2"],
  "strengths": ["Financial strength 1", "Financial strength 2"],
  "overallAssessment": "Brief overall financial assessment"
}

Focus on extracting:
- Revenue metrics (ARR, MRR, total revenue, revenue growth)
- Profitability metrics (gross margin, net margin, EBITDA)
- Customer metrics (CAC, LTV, LTV/CAC ratio, customer count)
- Cash metrics (burn rate, runway, cash balance)
- Growth metrics (MoM growth, YoY growth, CAGR)
- Market metrics (market size, TAM, SAM, SOM, market share)
- Operational metrics (headcount, conversion rates, churn rate)
- Valuation metrics (pre-money, post-money, valuation)

Be precise with numbers, units, and time periods. Provide confidence scores based on clarity of the source data.`;

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Extract financial metrics from this document:\n\n${documentText}`,
          },
        ],
        { temperature: 0.1, maxTokens: 2000 }
      );

      const extracted = JSON.parse(response.content);

      // Store metrics in database
      await this.storeMetrics(documentId, extracted.metrics);

      return {
        documentId,
        companyName: extracted.companyName,
        metrics: extracted.metrics,
        keyInsights: extracted.keyInsights || [],
        redFlags: extracted.redFlags || [],
        strengths: extracted.strengths || [],
        overallAssessment: extracted.overallAssessment || '',
      };
    } catch (error) {
      console.error('Error extracting financial metrics:', error);
      // Fallback to regex-based extraction
      return this.extractMetricsWithRegex(documentId, documentText);
    }
  }

  /**
   * Fallback: Extract metrics using regex patterns
   */
  private async extractMetricsWithRegex(
    documentId: string,
    documentText: string
  ): Promise<FinancialSummary> {
    const metrics: FinancialMetric[] = [];

    // Common patterns for financial metrics
    const patterns = [
      // Revenue patterns
      {
        regex: /(?:ARR|annual recurring revenue)[:\s]+\$?([\d,.]+)\s*(million|M|billion|B|k|K)?/gi,
        type: 'arr' as MetricType,
        name: 'Annual Recurring Revenue',
      },
      {
        regex: /(?:MRR|monthly recurring revenue)[:\s]+\$?([\d,.]+)\s*(million|M|billion|B|k|K)?/gi,
        type: 'mrr' as MetricType,
        name: 'Monthly Recurring Revenue',
      },
      {
        regex: /revenue[:\s]+\$?([\d,.]+)\s*(million|M|billion|B|k|K)?/gi,
        type: 'revenue' as MetricType,
        name: 'Revenue',
      },

      // Growth patterns
      {
        regex: /(\d+)%\s+(?:growth|increase|yoy|year[- ]over[- ]year)/gi,
        type: 'growth-rate' as MetricType,
        name: 'Growth Rate',
      },

      // Customer metrics
      {
        regex: /(?:CAC|customer acquisition cost)[:\s]+\$?([\d,.]+)/gi,
        type: 'cac' as MetricType,
        name: 'Customer Acquisition Cost',
      },
      {
        regex: /(?:LTV|lifetime value)[:\s]+\$?([\d,.]+)/gi,
        type: 'ltv' as MetricType,
        name: 'Customer Lifetime Value',
      },
      {
        regex: /([\d,.]+)\s+customers?/gi,
        type: 'customers' as MetricType,
        name: 'Customer Count',
      },

      // Valuation
      {
        regex: /valuation[:\s]+\$?([\d,.]+)\s*(million|M|billion|B)?/gi,
        type: 'valuation' as MetricType,
        name: 'Valuation',
      },

      // Burn and runway
      {
        regex: /(?:burn rate|monthly burn)[:\s]+\$?([\d,.]+)\s*(million|M|k|K)?/gi,
        type: 'burn-rate' as MetricType,
        name: 'Burn Rate',
      },
      {
        regex: /runway[:\s]+([\d,.]+)\s+months?/gi,
        type: 'runway' as MetricType,
        name: 'Runway',
      },
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(documentText)) !== null) {
        const valueStr = match[1].replace(/,/g, '');
        let value = parseFloat(valueStr);

        // Apply multipliers
        const multiplier = match[2]?.toLowerCase();
        if (multiplier === 'k') value *= 1000;
        else if (multiplier === 'm' || multiplier === 'million') value *= 1000000;
        else if (multiplier === 'b' || multiplier === 'billion') value *= 1000000000;

        metrics.push({
          metricType: pattern.type,
          metricName: pattern.name,
          value,
          valueString: match[0],
          extractionMethod: 'regex',
          confidenceScore: 0.7,
          context: this.getContext(documentText, match.index, 100),
        });
      }
    }

    await this.storeMetrics(documentId, metrics);

    return {
      documentId,
      metrics,
      keyInsights: [],
      redFlags: [],
      strengths: [],
      overallAssessment: `Extracted ${metrics.length} metrics using pattern matching.`,
    };
  }

  /**
   * Get surrounding context for a match
   */
  private getContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length);
    const end = Math.min(text.length, index + length);
    return text.substring(start, end);
  }

  /**
   * Store metrics in database
   */
  private async storeMetrics(documentId: string, metrics: FinancialMetric[]): Promise<void> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const records = metrics.map(metric => ({
        document_id: documentId,
        metric_type: metric.metricType,
        metric_name: metric.metricName,
        value: metric.value,
        value_string: metric.valueString,
        unit: metric.unit,
        time_period: metric.timePeriod,
        period_start: metric.periodStart,
        period_end: metric.periodEnd,
        currency: metric.currency || 'USD',
        confidence_score: metric.confidenceScore,
        extraction_method: metric.extractionMethod || 'ai',
        context: metric.context,
      }));

      const { error } = await supabase.from('financial_metrics').insert(records);

      if (error) {
        throw new Error(`Error storing metrics: ${error.message}`);
      }
    } catch (error) {
      console.error('Error storing financial metrics:', error);
      throw error;
    }
  }

  /**
   * Compare metrics across multiple documents
   */
  async compareMetrics(
    documentIds: string[],
    metricTypes?: MetricType[]
  ): Promise<MetricComparison[]> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      const { data, error } = await supabase.rpc('compare_financial_metrics', {
        document_ids_array: documentIds,
        metric_types_filter: metricTypes || null,
      });

      if (error) {
        throw new Error(`Error comparing metrics: ${error.message}`);
      }

      // Group metrics by type and name
      const grouped = new Map<string, MetricComparison>();

      for (const row of data) {
        const key = `${row.metric_type}:${row.metric_name}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            metricType: row.metric_type,
            metricName: row.metric_name,
            values: [],
            insights: [],
          });
        }

        grouped.get(key)!.values.push({
          documentId: row.document_id,
          documentName: row.filename,
          value: row.value,
          unit: row.unit,
          timePeriod: row.time_period,
          periodStart: row.period_start,
        });
      }

      // Analyze trends and generate insights
      const comparisons = Array.from(grouped.values());

      for (const comparison of comparisons) {
        // Sort by period
        comparison.values.sort((a, b) => {
          if (!a.periodStart || !b.periodStart) return 0;
          return a.periodStart.getTime() - b.periodStart.getTime();
        });

        // Calculate trend
        if (comparison.values.length >= 2) {
          const first = comparison.values[0].value;
          const last = comparison.values[comparison.values.length - 1].value;

          if (last > first * 1.1) {
            comparison.trend = 'increasing';
            comparison.growthRate = ((last - first) / first) * 100;
          } else if (last < first * 0.9) {
            comparison.trend = 'decreasing';
            comparison.growthRate = ((last - first) / first) * 100;
          } else {
            comparison.trend = 'stable';
          }

          // Generate insights
          comparison.insights = this.generateMetricInsights(comparison);
        }
      }

      return comparisons;
    } catch (error) {
      console.error('Error comparing metrics:', error);
      throw error;
    }
  }

  /**
   * Generate insights for metric comparison
   */
  private generateMetricInsights(comparison: MetricComparison): string[] {
    const insights: string[] = [];

    if (comparison.trend === 'increasing' && comparison.growthRate) {
      insights.push(
        `${comparison.metricName} shows strong growth of ${comparison.growthRate.toFixed(1)}%`
      );
    } else if (comparison.trend === 'decreasing' && comparison.growthRate) {
      insights.push(
        `⚠️ ${comparison.metricName} declined by ${Math.abs(comparison.growthRate).toFixed(1)}%`
      );
    }

    // Check for concerning patterns
    if (comparison.metricType === 'burn-rate' && comparison.trend === 'increasing') {
      insights.push('⚠️ Increasing burn rate may indicate efficiency challenges');
    }

    if (comparison.metricType === 'revenue' && comparison.trend === 'decreasing') {
      insights.push('🚨 Revenue decline requires immediate attention');
    }

    if (comparison.metricType === 'churn-rate' && comparison.trend === 'increasing') {
      insights.push('⚠️ Rising churn rate suggests product-market fit issues');
    }

    return insights;
  }

  /**
   * Generate comprehensive financial analysis across documents
   */
  async generateFinancialAnalysis(documentIds: string[]): Promise<{
    summary: string;
    metricComparisons: MetricComparison[];
    keyInsights: string[];
    recommendations: string[];
    riskAssessment: string;
  }> {
    try {
      // Get metric comparisons
      const metricComparisons = await this.compareMetrics(documentIds);

      // Build analysis prompt
      const metricsJson = JSON.stringify(metricComparisons, null, 2);

      const systemPrompt = `You are a senior venture capital analyst with expertise in financial due diligence and company evaluation.

Analyze the financial metrics extracted from multiple documents and provide a comprehensive investment analysis.

Return your analysis in the following JSON format:
{
  "summary": "Executive summary of financial position",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskAssessment": "Overall risk assessment with specific concerns"
}

Focus on:
- Revenue growth trajectory and sustainability
- Unit economics (CAC, LTV, LTV/CAC ratio)
- Burn rate and runway implications
- Market opportunity vs. current traction
- Competitive positioning and differentiation
- Financial efficiency and capital efficiency
- Red flags or areas of concern`;

      const response = await this.aiClient.generateResponse(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze these financial metrics across multiple documents:\n\n${metricsJson}`,
          },
        ],
        { temperature: 0.3, maxTokens: 1500 }
      );

      const analysis = JSON.parse(response.content);

      return {
        summary: analysis.summary,
        metricComparisons,
        keyInsights: analysis.keyInsights,
        recommendations: analysis.recommendations,
        riskAssessment: analysis.riskAssessment,
      };
    } catch (error) {
      console.error('Error generating financial analysis:', error);
      throw error;
    }
  }
}

/**
 * Create financial metrics extractor instance
 */
export const createFinancialMetricsExtractor = (config: {
  supabaseUrl: string;
  supabaseKey: string;
  aiClient: SecureAIServiceClient;
}): FinancialMetricsExtractor => {
  return new FinancialMetricsExtractor(config);
};
