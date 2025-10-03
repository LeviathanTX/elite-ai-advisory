import React, { useState } from 'react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { createAdvisorAI } from '../../services/advisorAI';
import { cn } from '../../utils';

interface QuickConsultationModeProps {
  onBack: () => void;
}

export const QuickConsultationMode: React.FC<QuickConsultationModeProps> = ({ onBack }) => {
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);
  const { celebrityAdvisors, getCelebrityAdvisor } = useAdvisor();
  const { settings, getAIService, isConfigured } = useSettings();

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev => 
      prev.includes(advisorId) 
        ? prev.filter(id => id !== advisorId)
        : [...prev, advisorId]
    );
  };

  const consultationCategories = [
    { id: 'strategic', name: 'Strategic Decision', description: 'High-level business strategy and direction' },
    { id: 'operational', name: 'Operational Issue', description: 'Day-to-day business operations and processes' },
    { id: 'financial', name: 'Financial Decision', description: 'Investment, funding, and financial planning' },
    { id: 'marketing', name: 'Marketing & Sales', description: 'Customer acquisition and growth strategies' },
    { id: 'product', name: 'Product Decision', description: 'Product development and feature prioritization' },
    { id: 'team', name: 'Team & Leadership', description: 'Hiring, management, and organizational issues' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('');

  const generateConsultation = async () => {
    if (selectedAdvisors.length === 0 || !question.trim() || !selectedCategory) return;
    
    setIsGenerating(true);
    
    try {
      const selectedAdvisorObjects = selectedAdvisors.map(id => getCelebrityAdvisor(id)).filter(Boolean);
      const category = consultationCategories.find(c => c.id === selectedCategory);
      
      // Use real AI if configured, fallback to mock responses
      if (isConfigured) {
        const advisorResponses = await Promise.all(
          selectedAdvisorObjects.map(async (advisor) => {
            try {
              const aiService = getAIService(advisor?.aiService || settings.defaultAIService!);
              if (aiService) {
                const advisorAI = createAdvisorAI(aiService);
                const response = await advisorAI.generateQuickConsultation(
                  advisor!,
                  selectedCategory,
                  question
                );
                return {
                  advisor: advisor?.name,
                  response: response
                };
              }
            } catch (error) {
              console.error(`Error generating response for ${advisor?.name}:`, error);
            }
            
            // Fallback to mock response if AI fails
            return {
              advisor: advisor?.name,
              response: generateAdvisorSpecificResponses([advisor!], selectedCategory, question)[0].response
            };
          })
        );

        const aiConsultation = {
          advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
          advisorCount: selectedAdvisors.length,
          category: category?.name,
          question: question,
          urgency: Math.random() > 0.5 ? 'High' : 'Medium',
          timeToImplement: Math.random() > 0.5 ? '1-2 weeks' : '2-4 weeks',
          confidence: Math.floor(Math.random() * 20) + 80,
          recommendation: generateMultiAdvisorRecommendation(selectedCategory, selectedAdvisorObjects),
          keyPoints: generateKeyPoints(selectedCategory),
          actionItems: generateActionItems(selectedCategory),
          risks: generateRisks(selectedCategory),
          followUpQuestions: generateFollowUpQuestions(selectedCategory),
          advisorResponses: advisorResponses,
          isAIGenerated: true
        };
        
        setConsultation(aiConsultation);
      } else {
        // Fallback to mock responses
        const mockConsultation = {
          advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
          advisorCount: selectedAdvisors.length,
          category: category?.name,
          question: question,
          urgency: Math.random() > 0.5 ? 'High' : 'Medium',
          timeToImplement: Math.random() > 0.5 ? '1-2 weeks' : '2-4 weeks',
          confidence: Math.floor(Math.random() * 20) + 80,
          recommendation: generateMultiAdvisorRecommendation(selectedCategory, selectedAdvisorObjects),
          keyPoints: generateKeyPoints(selectedCategory),
          actionItems: generateActionItems(selectedCategory),
          risks: generateRisks(selectedCategory),
          followUpQuestions: generateFollowUpQuestions(selectedCategory),
          advisorResponses: generateAdvisorSpecificResponses(selectedAdvisorObjects, selectedCategory, question),
          isAIGenerated: false
        };
        
        setConsultation(mockConsultation);
      }
    } catch (error) {
      console.error('Error generating consultation:', error);
      // Fallback to mock on error
      const selectedAdvisorObjects = selectedAdvisors.map(id => getCelebrityAdvisor(id)).filter(Boolean);
      const category = consultationCategories.find(c => c.id === selectedCategory);
      
      const mockConsultation = {
        advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
        advisorCount: selectedAdvisors.length,
        category: category?.name,
        question: question,
        urgency: 'Medium',
        timeToImplement: '1-2 weeks',
        confidence: 80,
        recommendation: generateMultiAdvisorRecommendation(selectedCategory, selectedAdvisorObjects),
        keyPoints: generateKeyPoints(selectedCategory),
        actionItems: generateActionItems(selectedCategory),
        risks: generateRisks(selectedCategory),
        followUpQuestions: generateFollowUpQuestions(selectedCategory),
        advisorResponses: generateAdvisorSpecificResponses(selectedAdvisorObjects, selectedCategory, question),
        isAIGenerated: false,
        error: 'AI service temporarily unavailable. Showing fallback response.'
      };
      
      setConsultation(mockConsultation);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultiAdvisorRecommendation = (category: string, advisors: any[]) => {
    const baseRecommendation = generateRecommendation(category);
    const advisorPerspectives = advisors.map(advisor => {
      const perspectives = {
        'mark-cuban': ` Mark Cuban emphasizes: "Focus on the numbers and customer validation before anything else."`,
        'reid-hoffman': ` Reid Hoffman adds: "Think about the network effects and long-term platform strategy."`,
        'barbara-corcoran': ` Barbara Corcoran notes: "Success comes down to execution and building the right team."`,
        'jason-calacanis': ` Jason Calacanis suggests: "Prioritize product-market fit and customer feedback loops."`,
        'daymond-john': ` Daymond John advises: "Brand positioning and community building are crucial for long-term success."`,
        'sheryl-sandberg': ` Sheryl Sandberg recommends: "Data-driven decision making and scalable growth strategies."`
      };
      return perspectives[advisor?.id as keyof typeof perspectives] || '';
    }).join('');
    
    return baseRecommendation + advisorPerspectives;
  };

  const generateAdvisorSpecificResponses = (advisors: any[], category: string, question: string) => {
    return advisors.map(advisor => {
      const responses = {
        'mark-cuban': {
          strategic: "Before making any strategic moves, show me the data. What are your customers telling you? What do the numbers say about market demand?",
          operational: "Operations are about efficiency and results. What processes are slowing you down? Where are you wasting money or time?",
          financial: "Cash flow is everything. I need to see your burn rate, runway, and path to profitability. Don't spend money you don't have.",
          marketing: "Marketing without measurement is just spending money. What's your customer acquisition cost? What's working and what isn't?",
          product: "Build what customers actually want, not what you think they want. Have you validated this with real users?",
          team: "Your team is your biggest asset or liability. Are you hiring A-players? Are you setting clear expectations?"
        },
        'reid-hoffman': {
          strategic: "Think about the ecosystem you're building. How does this decision create network effects and platform value?",
          operational: "Scale requires systems that work without you. How can you build operational leverage into everything you do?",
          financial: "Consider the long-term implications. How does this financial decision support your path to becoming a category-defining company?",
          marketing: "Focus on building something people love so much they tell others. What's your organic growth strategy?",
          product: "Product strategy should create increasing returns to scale. How does each feature make your product more valuable?",
          team: "Hire people who are better than you at their specific skills. How are you building a team that can scale with your vision?"
        },
        'barbara-corcoran': {
          strategic: "Strategy without execution is just a dream. Who's going to make this happen and how will you hold them accountable?",
          operational: "I've built businesses by focusing on what matters most. What are the 3 most important things you need to get right?",
          financial: "Money follows results. Instead of just looking at the numbers, tell me how you're going to improve them.",
          marketing: "Sales is about relationships and trust. How are you building genuine connections with your customers?",
          product: "Your product needs to solve a real problem people will pay for. Have you talked to enough customers to know this is true?",
          team: "Culture eats strategy for breakfast. What kind of culture are you building and how are you reinforcing it every day?"
        }
      };
      
      const advisorResponses = responses[advisor?.id as keyof typeof responses];
      const response = advisorResponses ? advisorResponses[category as keyof typeof advisorResponses] : "That's a great question. Let me share my perspective on this important decision.";
      
      return {
        advisor: advisor?.name,
        response: response
      };
    });
  };

  const generateRecommendation = (category: string, advisorName?: string) => {
    const recommendations = {
      strategic: `Based on your situation, I'd recommend taking a phased approach. Start by validating your core assumptions with real customer data, then move forward with confidence. The market opportunity is there, but execution will determine success.`,
      operational: `The key here is to systematize what's working and eliminate what's not. Focus on building repeatable processes that can scale without requiring your constant attention. Automate the routine, optimize the critical.`,
      financial: `Numbers don't lie, and neither should your strategy. Before making any major financial decisions, ensure you have at least 6 months of runway and a clear path to profitability. Cash flow is king - everything else is vanity metrics.`,
      marketing: `Customer acquisition is only half the battle - retention is where you make real money. Focus on identifying your most valuable customer segments and double down on channels that deliver quality, not just quantity.`,
      product: `Ship fast, learn faster. Your customers will tell you what they really want if you listen. Don't build features in a vacuum - build solutions to real problems your users are actually experiencing.`,
      team: `Hire slow, fire fast. Culture is built one person at a time, and a single bad hire can derail months of progress. Invest in people who are smarter than you and aren't afraid to challenge your assumptions.`
    };
    
    return recommendations[category as keyof typeof recommendations] || recommendations.strategic;
  };

  const generateKeyPoints = (category: string) => {
    const keyPoints = {
      strategic: [
        'Market validation should drive all strategic decisions',
        'Focus on competitive advantages that are difficult to replicate',
        'Timing is crucial - being too early can be as bad as being too late',
        'Build for scale from day one, but start with a focused niche'
      ],
      operational: [
        'Document all critical processes to reduce dependency on key individuals',
        'Implement metrics and KPIs to track operational efficiency',
        'Regular process reviews help identify bottlenecks before they become problems',
        'Technology should enhance operations, not complicate them'
      ],
      financial: [
        'Maintain clear visibility into cash flow and burn rate',
        'Diversify revenue streams to reduce single points of failure',
        'Plan for multiple scenarios, not just the best-case outcome',
        'Unit economics must work at scale, not just in theory'
      ],
      marketing: [
        'Know your customer acquisition cost and lifetime value intimately',
        'Content marketing builds trust, paid advertising drives immediate results',
        'Word-of-mouth remains the most powerful marketing channel',
        'Test everything, assume nothing about customer behavior'
      ],
      product: [
        'Feature requests don\'t always reflect actual user needs',
        'Technical debt will slow you down if not addressed proactively',
        'User experience design is not optional for B2B products',
        'Build what users need today, not what they might need tomorrow'
      ],
      team: [
        'Clear communication prevents most team conflicts',
        'Remote work requires different management approaches',
        'Equity compensation aligns team incentives with company success',
        'Regular feedback prevents small issues from becoming big problems'
      ]
    };
    
    return keyPoints[category as keyof typeof keyPoints] || keyPoints.strategic;
  };

  const generateActionItems = (category: string) => {
    const actions = {
      strategic: [
        'Conduct customer interviews to validate strategic assumptions',
        'Analyze competitor strategies and identify differentiation opportunities',
        'Create a 90-day strategic roadmap with measurable milestones',
        'Establish key performance indicators for strategic success'
      ],
      operational: [
        'Map out current operational processes and identify inefficiencies',
        'Implement project management tools for better visibility',
        'Create standard operating procedures for repetitive tasks',
        'Schedule monthly operational reviews with your team'
      ],
      financial: [
        'Create detailed financial projections for the next 12 months',
        'Establish cash flow monitoring with weekly updates',
        'Review all major expenses and identify cost optimization opportunities',
        'Set up automated financial reporting and alerts'
      ],
      marketing: [
        'Define ideal customer profiles with specific demographics and behaviors',
        'Test three different customer acquisition channels over the next 30 days',
        'Implement customer feedback loops to improve product-market fit',
        'Create a content calendar focusing on customer pain points'
      ],
      product: [
        'Prioritize product features based on customer impact and development effort',
        'Implement user analytics to understand actual product usage patterns',
        'Create a product feedback loop with regular user interviews',
        'Establish technical roadmap aligned with business objectives'
      ],
      team: [
        'Define clear roles and responsibilities for each team member',
        'Implement regular one-on-one meetings with direct reports',
        'Create a hiring plan based on immediate and future needs',
        'Establish team performance metrics and review processes'
      ]
    };
    
    return actions[category as keyof typeof actions] || actions.strategic;
  };

  const generateRisks = (category: string) => {
    const risks = {
      strategic: [
        'Market conditions could change faster than strategy can adapt',
        'Competitors may have more resources for rapid scaling',
        'Regulatory changes could impact business model viability'
      ],
      operational: [
        'Over-optimization might reduce flexibility for future changes',
        'Key team members leaving could disrupt operations',
        'Technology dependencies could create single points of failure'
      ],
      financial: [
        'Economic downturn could impact revenue and funding availability',
        'Customer concentration risk if too dependent on few large accounts',
        'Currency fluctuations could affect international operations'
      ],
      marketing: [
        'Customer acquisition costs may increase with competition',
        'Brand reputation risks from rapid scaling without quality control',
        'Marketing channels may become saturated or less effective over time'
      ],
      product: [
        'Technical debt could slow future development significantly',
        'User needs may evolve faster than product development cycles',
        'Security vulnerabilities could damage customer trust'
      ],
      team: [
        'Cultural misalignment could emerge as team grows rapidly',
        'Skill gaps may become apparent as business requirements evolve',
        'Remote team coordination challenges could impact productivity'
      ]
    };
    
    return risks[category as keyof typeof risks] || risks.strategic;
  };

  const generateFollowUpQuestions = (category: string) => {
    const questions = {
      strategic: [
        'What metrics will you use to measure strategic success?',
        'How will you adapt strategy if market conditions change?',
        'What resources do you need to execute this strategy effectively?'
      ],
      operational: [
        'Which operational processes are causing the most bottlenecks?',
        'How will you maintain quality while scaling operations?',
        'What tools or systems need to be implemented first?'
      ],
      financial: [
        'What is your target timeline to reach profitability?',
        'How much runway do you need for your next major milestone?',
        'What financial metrics matter most to your stakeholders?'
      ],
      marketing: [
        'Which customer segments are most profitable for your business?',
        'How will you measure marketing ROI across different channels?',
        'What is your plan for customer retention and expansion?'
      ],
      product: [
        'What customer problems are you uniquely positioned to solve?',
        'How will you prioritize features as your user base grows?',
        'What technical infrastructure needs to be in place for scaling?'
      ],
      team: [
        'What key roles need to be filled in the next 6 months?',
        'How will you maintain company culture as you scale?',
        'What systems will you use for performance management?'
      ]
    };
    
    return questions[category as keyof typeof questions] || questions.strategic;
  };

  if (consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setConsultation(null)}
            className="mb-6 text-orange-600 hover:text-orange-700 font-medium"
          >
            ← New Consultation
          </button>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Consultation Results</h1>
              <p className="text-gray-600">Expert advice from {consultation.advisorCount} advisor{consultation.advisorCount > 1 ? 's' : ''}: {consultation.advisors}</p>
              {consultation.isAIGenerated && (
                <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Real AI Analysis Active
                </div>
              )}
              {consultation.error && (
                <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {consultation.error}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{consultation.confidence}%</div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{consultation.urgency}</div>
                <div className="text-sm text-gray-600">Priority</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{consultation.timeToImplement}</div>
                <div className="text-sm text-gray-600">Timeline</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{consultation.category}</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
            </div>

            {/* Your Question */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Question</h3>
              <p className="text-gray-700 italic">"{consultation.question}"</p>
            </div>

            {/* Recommendation */}
            <div className="mb-8 p-6 bg-orange-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Expert Recommendation</h3>
              <p className="text-gray-700">{consultation.recommendation}</p>
            </div>

            {/* Key Points */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Key Points to Consider</h3>
              <ul className="space-y-2">
                {consultation.keyPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items & Risks */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Immediate Action Items</h3>
                <ul className="space-y-2">
                  {consultation.actionItems.map((action: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">→</span>
                      <span className="text-gray-700 text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Potential Risks</h3>
                <ul className="space-y-2">
                  {consultation.risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">!</span>
                      <span className="text-gray-700 text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Advisor-Specific Responses */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Individual Advisor Responses</h3>
              <div className="space-y-4">
                {consultation.advisorResponses.map((response: any, index: number) => (
                  <div key={index} className="p-4 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm">
                    <h4 className="font-semibold text-orange-700 mb-2">{response.advisor}</h4>
                    <p className="text-gray-700 text-sm">{response.response}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Questions */}
            <div className="p-6 bg-blue-50 rounded-xl mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤔 Follow-up Questions to Consider</h3>
              <ul className="space-y-2">
                {consultation.followUpQuestions.map((question: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">?</span>
                    <span className="text-gray-700 text-sm">{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={onBack}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors mr-4"
              >
                Back to Dashboard
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Quick Consultation</h1>
            <p className="text-gray-600">Get instant expert advice for immediate business decisions</p>
            {isConfigured ? (
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Real AI Analysis Ready
              </div>
            ) : (
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                Demo Mode - Configure AI in Settings for real analysis
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What type of decision do you need help with?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {consultationCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "p-4 border-2 rounded-xl text-left transition-all",
                    selectedCategory === category.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  )}
                >
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advisor Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Advisory Panel ({selectedAdvisors.length} selected)</h2>
            <p className="text-sm text-gray-600 mb-4">Select multiple advisors to get diverse perspectives on your decision</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {celebrityAdvisors.map((advisor) => {
                const isSelected = selectedAdvisors.includes(advisor.id);
                const isHost = advisor.id === 'the-host';
                return (
                  <button
                    key={advisor.id}
                    onClick={() => toggleAdvisor(advisor.id)}
                    className={cn(
                      "p-4 border-2 rounded-xl text-left transition-all relative",
                      isHost && !isSelected
                        ? "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg ring-2 ring-amber-200"
                        : isHost && isSelected
                        ? "border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-lg ring-2 ring-amber-300"
                        : isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    )}
                  >
                    {isHost && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        HOST
                      </div>
                    )}
                    {isSelected && (
                      <div className={cn(
                        "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
                        isHost ? "bg-amber-500" : "bg-orange-500"
                      )}>
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                    <div className={cn(
                      "font-semibold",
                      isHost ? "text-amber-900 mt-6" : "text-gray-900"
                    )}>{advisor.name}</div>
                    <div className={cn(
                      "text-sm",
                      isHost ? "text-amber-700" : "text-gray-600"
                    )}>{advisor.title}</div>
                    <div className={cn(
                      "text-sm mt-1",
                      isHost ? "text-amber-600" : "text-gray-500"
                    )}>{advisor.company}</div>
                    {isHost && (
                      <div className="text-xs text-amber-700 mt-2 font-medium">
                        🎯 Meeting Facilitation • Behavioral Economics
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedAdvisors.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">
                  Selected advisory panel: {selectedAdvisors.map(id => celebrityAdvisors.find(a => a.id === id)?.name).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Question Input */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Situation</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe the decision you need to make, the context, and any constraints or considerations. Be specific about your situation and what kind of advice would be most helpful."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-500 mt-2">
              {question.length} characters • Be specific for the best advice
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={generateConsultation}
              disabled={selectedAdvisors.length === 0 || !question.trim() || !selectedCategory || isGenerating}
              className={cn(
                "px-8 py-4 rounded-xl font-semibold text-white transition-all",
                (selectedAdvisors.length === 0 || !question.trim() || !selectedCategory) 
                  ? "bg-gray-400 cursor-not-allowed"
                  : isGenerating
                  ? "bg-orange-400 cursor-wait"
                  : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              )}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Expert Advice...
                </span>
              ) : (
                'Get Instant Advice'
              )}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-orange-600 text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900">Instant Results</h3>
              <p className="text-sm text-gray-600">Get expert advice in under 30 seconds</p>
            </div>
            <div className="p-4">
              <div className="text-orange-600 text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900">Actionable Insights</h3>
              <p className="text-sm text-gray-600">Specific steps you can implement today</p>
            </div>
            <div className="p-4">
              <div className="text-orange-600 text-2xl mb-2">🧠</div>
              <h3 className="font-semibold text-gray-900">Expert Perspective</h3>
              <p className="text-sm text-gray-600">Insights from proven business leaders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};