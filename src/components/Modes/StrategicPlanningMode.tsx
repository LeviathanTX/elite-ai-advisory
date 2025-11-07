import React, { useState } from 'react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { cn } from '../../utils';

interface StrategicPlanningModeProps {
  onBack: () => void;
}

export const StrategicPlanningMode: React.FC<StrategicPlanningModeProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { celebrityAdvisors, getCelebrityAdvisor } = useAdvisor();

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev =>
      prev.includes(advisorId) ? prev.filter(id => id !== advisorId) : [...prev, advisorId]
    );
  };

  const topics = [
    {
      id: 'growth',
      name: 'Growth Strategy',
      description: 'Scaling your business and market expansion',
    },
    {
      id: 'funding',
      name: 'Fundraising',
      description: 'Preparing for investment rounds and investor relations',
    },
    { id: 'product', name: 'Product Strategy', description: 'Product development and market fit' },
    {
      id: 'competition',
      name: 'Competitive Strategy',
      description: 'Market positioning and competitive advantage',
    },
    {
      id: 'team',
      name: 'Team Building',
      description: 'Hiring, culture, and organizational development',
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Efficiency, processes, and scaling operations',
    },
  ];

  const initializeDiscussion = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || selectedAdvisors.length === 0) return;

    const selectedAdvisorObjects = selectedAdvisors
      .map(id => getCelebrityAdvisor(id))
      .filter(Boolean);

    const initialMessages = [
      {
        id: 'intro',
        type: 'system',
        content: `Welcome to the Strategic Planning session on ${topic.name}. Your advisory board (${selectedAdvisorObjects.map(a => a?.name).join(', ')}) is ready to help you make critical decisions.`,
      },
    ];

    // Add intro messages from selected advisors
    selectedAdvisorObjects.forEach((advisor, index) => {
      const introMessages = getAdvisorIntroMessage(advisor?.id || '', topic.name);
      initialMessages.push({
        id: `${advisor?.id}-intro`,
        type: 'advisor',
        content: introMessages,
      } as any);
    });

    setMessages(initialMessages);
  };

  const getAdvisorIntroMessage = (advisorId: string, topicName: string) => {
    const introMessages = {
      'mark-cuban': `Alright, let's talk ${topicName.toLowerCase()}. I want to see the numbers first - what's your current situation and where do you want to be in 12 months?`,
      'reid-hoffman': `I'm interested in the strategic framework here. How does this ${topicName.toLowerCase()} decision connect to your long-term vision and competitive moat?`,
      'barbara-corcoran': `${topicName} is all about execution. Tell me about your team and how you plan to make this happen.`,
      'jason-calacanis': `Great topic! I love seeing founders think strategically about ${topicName.toLowerCase()}. What's your biggest challenge right now?`,
      'daymond-john': `${topicName} success comes down to brand and community. How are you positioning yourself in the market?`,
      'sheryl-sandberg': `Let's dive into the data behind your ${topicName.toLowerCase()} strategy. What metrics are you tracking?`,
    };
    return introMessages[advisorId as keyof typeof introMessages] || introMessages['mark-cuban'];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate advisor responses
    setTimeout(() => {
      const advisorResponses = generateAdvisorResponses(inputMessage, selectedTopic);
      setMessages(prev => [...prev, ...advisorResponses]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAdvisorResponses = (userInput: string, topic: string) => {
    const responses = [];
    const selectedAdvisorObjects = selectedAdvisors
      .map(id => getCelebrityAdvisor(id))
      .filter(Boolean);

    // Generate responses from selected advisors
    selectedAdvisorObjects.forEach((advisor, index) => {
      // Randomly decide if this advisor should respond (70% chance for first advisor, decreasing for others)
      const responseChance = Math.max(0.3, 0.7 - index * 0.2);
      if (Math.random() < responseChance) {
        responses.push({
          id: `${advisor?.id}-${Date.now() + index}`,
          advisor: advisor?.name,
          content: getAdvisorResponse(advisor?.id || '', userInput, topic),
        });
      }
    });

    // Ensure at least one response if advisors are selected
    if (responses.length === 0 && selectedAdvisorObjects.length > 0) {
      const firstAdvisor = selectedAdvisorObjects[0];
      responses.push({
        id: `${firstAdvisor?.id}-${Date.now()}`,
        advisor: firstAdvisor?.name,
        content: getAdvisorResponse(firstAdvisor?.id || '', userInput, topic),
      });
    }

    return responses;
  };

  const getAdvisorResponse = (advisorId: string, userInput: string, topic: string) => {
    const advisorResponses = {
      'mark-cuban': {
        growth: [
          'Growth without profitability is just expensive. Show me your unit economics first.',
          "What's your customer acquisition cost versus lifetime value? Those numbers tell the real story.",
          "Don't scale until you've perfected the model. Fix the fundamentals first.",
        ],
        funding: [
          'Investors want to see traction, not potential. What are your actual results?',
          "Valuation is meaningless if you can't execute. Focus on building value, not raising money.",
          "Be ready to justify every dollar you're asking for with concrete milestones.",
        ],
      },
      'reid-hoffman': {
        growth: [
          'Think about network effects - how does each new customer make your product more valuable for existing ones?',
          "Consider the ecosystem you're building. Growth isn't just about users, it's about creating platform value.",
          "What's your defensible moat? As you grow, competitors will notice. How do you stay ahead?",
        ],
        funding: [
          "Frame your narrative around the future you're building, not just the present metrics.",
          'Connect with investors who understand your market. Strategic investors can be more valuable than just capital.',
          "Think about funding as buying time to reach the next major milestone. What's that milestone?",
        ],
      },
      'barbara-corcoran': {
        growth: [
          'Sales drive growth, period. How are you building a repeatable sales process?',
          'Your team is your biggest asset for growth. Are you hiring A-players?',
          "Customer success is the foundation of sustainable growth. What's your retention rate?",
        ],
        funding: [
          "Investors invest in people first, ideas second. Tell me about your team's track record.",
          'Passion and persistence matter more than perfect numbers. Show them your determination.',
          "What makes you different from every other pitch they'll hear today?",
        ],
      },
    };

    const responses = advisorResponses[advisorId as keyof typeof advisorResponses];
    if (!responses)
      return "That's an interesting perspective. Let me think about the implications...";

    const topicResponses = responses[topic as keyof typeof responses] ||
      responses.growth || ["That's a great question. Let me share my thoughts..."];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  const getMarkCubanResponse = (input: string, topic: string) => {
    const responses = {
      growth: [
        'Growth without profitability is just expensive. Show me your unit economics first.',
        "What's your customer acquisition cost versus lifetime value? Those numbers tell the real story.",
        "Don't scale until you've perfected the model. Fix the fundamentals first.",
      ],
      funding: [
        'Investors want to see traction, not potential. What are your actual results?',
        "Valuation is meaningless if you can't execute. Focus on building value, not raising money.",
        "Be ready to justify every dollar you're asking for with concrete milestones.",
      ],
      product: [
        'Your customers will tell you what they want if you listen. Are you listening?',
        "Perfect is the enemy of good. Ship, learn, iterate. That's how you build products people love.",
        "Features don't sell products, solutions to problems do. What problem are you really solving?",
      ],
    };

    const topicResponses = responses[topic as keyof typeof responses] || responses.growth;
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  const getReidHoffmanResponse = (input: string, topic: string) => {
    const responses = {
      growth: [
        'Think about network effects - how does each new customer make your product more valuable for existing ones?',
        "Consider the ecosystem you're building. Growth isn't just about users, it's about creating platform value.",
        "What's your defensible moat? As you grow, competitors will notice. How do you stay ahead?",
      ],
      funding: [
        "Frame your narrative around the future you're building, not just the present metrics.",
        'Connect with investors who understand your market. Strategic investors can be more valuable than just capital.',
        "Think about funding as buying time to reach the next major milestone. What's that milestone?",
      ],
    };

    const topicResponses = responses[topic as keyof typeof responses] || responses.growth;
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  const getBarbaraCorcoran = (input: string, topic: string) => {
    const responses = [
      'Trust your gut instinct here. What does your intuition tell you?',
      'This comes down to people. Are you surrounding yourself with the right team?',
      "Sometimes the best strategy is the simplest one. What's the straightforward approach?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🧠 Strategic Planning</h1>
              <p className="text-gray-600">
                Get insights from your advisory board on critical business decisions
              </p>
            </div>

            {/* Advisor Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Your Advisory Board ({selectedAdvisors.length} selected)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select advisors who will participate in your strategic planning discussion
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {celebrityAdvisors.map(advisor => {
                  const isSelected = selectedAdvisors.includes(advisor.id);
                  return (
                    <button
                      key={advisor.id}
                      onClick={() => toggleAdvisor(advisor.id)}
                      className={cn(
                        'p-4 border-2 rounded-xl text-left transition-all relative',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                      <div className="font-semibold text-gray-900">{advisor.name}</div>
                      <div className="text-sm text-gray-600">{advisor.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{advisor.company}</div>
                    </button>
                  );
                })}
              </div>
              {selectedAdvisors.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Selected advisors:{' '}
                    {selectedAdvisors
                      .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Topic Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Discussion Topic</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      if (selectedAdvisors.length === 0) {
                        alert('Please select at least one advisor first');
                        return;
                      }
                      setSelectedTopic(topic.id);
                      initializeDiscussion(topic.id);
                    }}
                    disabled={selectedAdvisors.length === 0}
                    className={cn(
                      'p-6 border-2 rounded-xl text-left transition-all',
                      selectedAdvisors.length === 0
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.name}</h3>
                    <p className="text-gray-600">{topic.description}</p>
                  </button>
                ))}
              </div>
              {selectedAdvisors.length === 0 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Select advisors above to start a strategic planning discussion
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedTopic('')}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Choose Different Topic
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <h1 className="text-2xl font-bold">Strategic Planning Session</h1>
            <p>Topic: {topics.find(t => t.id === selectedTopic)?.name}</p>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn('flex', message.type === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'system'
                        ? 'bg-gray-100 text-gray-800 w-full text-center'
                        : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {message.advisor && (
                    <div className="font-semibold text-blue-600 text-xs mb-1">
                      {message.advisor}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Advisors are thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your advisory board a question..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
