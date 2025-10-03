// Agenda Management Service for Host Advisor
// Provides structured meeting facilitation and behavioral economics-based conversation optimization

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  timeAllocation: number; // minutes
  type: AgendaItemType;
  owner?: string;
  prerequisites?: string[];
  outcomes: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
}

export type AgendaItemType =
  | 'information_sharing'
  | 'discussion'
  | 'decision'
  | 'brainstorming'
  | 'problem_solving'
  | 'planning'
  | 'review'
  | 'check_in';

export interface MeetingAgenda {
  id: string;
  title: string;
  objective: string;
  duration: number; // minutes
  participants: string[];
  items: AgendaItem[];
  facilitationNotes: string;
  behavioralConsiderations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FacilitationInsight {
  type: 'bias_alert' | 'participation_balance' | 'energy_check' | 'time_management' | 'decision_point';
  message: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  timing: 'immediate' | 'next_transition' | 'end_of_item';
}

export class AgendaManager {
  private static instance: AgendaManager;
  private agendas: Map<string, MeetingAgenda> = new Map();
  private activeAgenda: string | null = null;
  private currentItemIndex: number = 0;
  private startTime: Date | null = null;

  static getInstance(): AgendaManager {
    if (!AgendaManager.instance) {
      AgendaManager.instance = new AgendaManager();
    }
    return AgendaManager.instance;
  }

  /**
   * Create a new meeting agenda
   */
  createAgenda(
    title: string,
    objective: string,
    duration: number,
    participants: string[] = []
  ): MeetingAgenda {
    const agenda: MeetingAgenda = {
      id: `agenda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      objective,
      duration,
      participants,
      items: [],
      facilitationNotes: this.generateFacilitationNotes(objective, participants.length),
      behavioralConsiderations: this.generateBehavioralConsiderations(participants.length),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.agendas.set(agenda.id, agenda);
    return agenda;
  }

  /**
   * Parse agenda from natural language description
   */
  parseAgendaFromText(text: string, defaultDuration: number = 60): MeetingAgenda {
    const lines = text.split('\n').filter(line => line.trim());

    // Extract title and objective
    const title = lines[0]?.trim() || 'Meeting Agenda';
    const objective = lines.find(line =>
      line.toLowerCase().includes('objective') ||
      line.toLowerCase().includes('purpose')
    )?.replace(/^.*?(objective|purpose):\s*/i, '') || 'Productive discussion and decision-making';

    const agenda = this.createAgenda(title, objective, defaultDuration);

    // Parse agenda items
    lines.forEach((line, index) => {
      if (this.isAgendaItemLine(line)) {
        const item = this.parseAgendaItem(line, index);
        if (item) {
          agenda.items.push(item);
        }
      }
    });

    // If no items found, create a basic discussion structure
    if (agenda.items.length === 0) {
      agenda.items = this.createDefaultAgendaStructure(title);
    }

    agenda.updatedAt = new Date();
    this.agendas.set(agenda.id, agenda);
    return agenda;
  }

  /**
   * Set active agenda for the conversation
   */
  setActiveAgenda(agendaId: string): boolean {
    if (this.agendas.has(agendaId)) {
      this.activeAgenda = agendaId;
      this.currentItemIndex = 0;
      this.startTime = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get current agenda item
   */
  getCurrentItem(): AgendaItem | null {
    const agenda = this.getActiveAgenda();
    if (!agenda || this.currentItemIndex >= agenda.items.length) {
      return null;
    }
    return agenda.items[this.currentItemIndex];
  }

  /**
   * Advance to next agenda item
   */
  advanceToNextItem(): AgendaItem | null {
    const agenda = this.getActiveAgenda();
    if (!agenda) return null;

    // Mark current item as completed
    if (this.currentItemIndex < agenda.items.length) {
      agenda.items[this.currentItemIndex].status = 'completed';
    }

    this.currentItemIndex++;

    if (this.currentItemIndex < agenda.items.length) {
      agenda.items[this.currentItemIndex].status = 'in_progress';
      return agenda.items[this.currentItemIndex];
    }

    return null;
  }

  /**
   * Generate facilitation insights based on current context
   */
  generateFacilitationInsights(
    messageCount: number,
    lastMessageTime: Date,
    participantCount: number
  ): FacilitationInsight[] {
    const insights: FacilitationInsight[] = [];
    const currentItem = this.getCurrentItem();
    const agenda = this.getActiveAgenda();

    if (!currentItem || !agenda) return insights;

    // Time management insights
    const elapsedTime = this.getElapsedTime();
    const plannedTime = this.getPlannedTimeToCurrentItem();

    if (elapsedTime > plannedTime * 1.2) {
      insights.push({
        type: 'time_management',
        message: 'We\'re running behind schedule',
        suggestion: 'Consider summarizing key points and moving to decision or next item',
        priority: 'high',
        timing: 'immediate'
      });
    }

    // Participation balance insights
    if (messageCount > 10 && participantCount > 2) {
      insights.push({
        type: 'participation_balance',
        message: 'Let\'s ensure we\'re hearing from everyone',
        suggestion: 'Use round-robin or direct invitation to less active participants',
        priority: 'medium',
        timing: 'next_transition'
      });
    }

    // Decision point detection
    if (currentItem.type === 'decision' && messageCount > 5) {
      insights.push({
        type: 'decision_point',
        message: 'This seems like a good time to crystallize our decision',
        suggestion: 'Summarize options discussed and guide toward specific commitment',
        priority: 'high',
        timing: 'immediate'
      });
    }

    // Cognitive bias alerts
    if (messageCount > 3) {
      insights.push({
        type: 'bias_alert',
        message: 'Watch for anchoring bias in this discussion',
        suggestion: 'Consider alternatives to first ideas presented, use devil\'s advocate',
        priority: 'medium',
        timing: 'immediate'
      });
    }

    return insights;
  }

  /**
   * Generate Host facilitation response
   */
  generateHostResponse(
    currentContext: string,
    insights: FacilitationInsight[]
  ): string {
    const currentItem = this.getCurrentItem();
    const agenda = this.getActiveAgenda();

    if (!currentItem || !agenda) {
      return "I'm here to help facilitate our discussion. Would you like me to create an agenda structure for our conversation?";
    }

    const responses = [];

    // Current item context
    responses.push(`We're currently focused on: "${currentItem.title}"`);

    if (currentItem.description) {
      responses.push(`Our goal for this item: ${currentItem.description}`);
    }

    // High priority insights
    const highPriorityInsights = insights.filter(i => i.priority === 'high');
    if (highPriorityInsights.length > 0) {
      responses.push(highPriorityInsights[0].suggestion);
    }

    // Behavioral economics guidance
    const behavioralGuidance = this.getBehavioralGuidance(currentItem.type);
    if (behavioralGuidance) {
      responses.push(behavioralGuidance);
    }

    // Progress and next steps
    const progress = this.getAgendaProgress();
    responses.push(`Progress: ${progress.completed}/${progress.total} items completed`);

    return responses.join('\n\n');
  }

  private getActiveAgenda(): MeetingAgenda | null {
    return this.activeAgenda ? this.agendas.get(this.activeAgenda) || null : null;
  }

  private isAgendaItemLine(line: string): boolean {
    return /^\s*[\d\-*•]\s*/.test(line) ||
           line.toLowerCase().includes('discuss') ||
           line.toLowerCase().includes('review') ||
           line.toLowerCase().includes('decide');
  }

  private parseAgendaItem(line: string, index: number): AgendaItem | null {
    const cleanLine = line.replace(/^\s*[\d\-*•]\s*/, '').trim();
    if (!cleanLine) return null;

    // Extract time allocation if specified
    const timeMatch = cleanLine.match(/\((\d+)\s*min\w*\)/i);
    const timeAllocation = timeMatch ? parseInt(timeMatch[1]) : 10;

    // Determine item type based on keywords
    let type: AgendaItemType = 'discussion';
    if (cleanLine.toLowerCase().includes('decision') || cleanLine.toLowerCase().includes('decide')) {
      type = 'decision';
    } else if (cleanLine.toLowerCase().includes('brainstorm')) {
      type = 'brainstorming';
    } else if (cleanLine.toLowerCase().includes('review')) {
      type = 'review';
    } else if (cleanLine.toLowerCase().includes('plan')) {
      type = 'planning';
    }

    return {
      id: `item_${index}_${Math.random().toString(36).substr(2, 9)}`,
      title: cleanLine.replace(/\s*\(\d+\s*min\w*\)/i, '').trim(),
      description: '',
      timeAllocation,
      type,
      outcomes: [],
      status: index === 0 ? 'in_progress' : 'pending'
    };
  }

  private createDefaultAgendaStructure(title: string): AgendaItem[] {
    return [
      {
        id: 'check_in',
        title: 'Opening & Objectives',
        description: 'Welcome, introductions, and agenda review',
        timeAllocation: 5,
        type: 'check_in',
        outcomes: ['Aligned expectations', 'Psychological safety established'],
        status: 'in_progress'
      },
      {
        id: 'main_discussion',
        title: title,
        description: 'Main discussion topic',
        timeAllocation: 40,
        type: 'discussion',
        outcomes: ['Shared understanding', 'Key insights identified'],
        status: 'pending'
      },
      {
        id: 'action_items',
        title: 'Next Steps & Actions',
        description: 'Identify specific commitments and follow-up actions',
        timeAllocation: 10,
        type: 'planning',
        outcomes: ['Clear action items', 'Accountability established'],
        status: 'pending'
      },
      {
        id: 'closing',
        title: 'Closing & Check-out',
        description: 'Summary and final thoughts',
        timeAllocation: 5,
        type: 'review',
        outcomes: ['Meeting summary', 'Feedback gathered'],
        status: 'pending'
      }
    ];
  }

  private generateFacilitationNotes(objective: string, participantCount: number): string {
    const notes = [
      'FACILITATION APPROACH:',
      '• Start with psychological safety check-in',
      '• Use structured turn-taking for balanced participation',
      '• Apply devil\'s advocate technique to test assumptions',
      '• Watch for groupthink and anchoring bias'
    ];

    if (participantCount > 5) {
      notes.push('• Consider breakout discussions for large group');
    }

    if (objective.toLowerCase().includes('decision')) {
      notes.push('• Use decision architecture principles');
      notes.push('• Establish clear criteria before evaluating options');
    }

    return notes.join('\n');
  }

  private generateBehavioralConsiderations(participantCount: number): string[] {
    const considerations = [
      'Monitor for confirmation bias - actively seek disconfirming evidence',
      'Use pre-mortem analysis: "What could go wrong with this decision?"',
      'Apply prospect theory: frame gains and losses appropriately',
      'Watch for social proof cascades in group agreement'
    ];

    if (participantCount > 3) {
      considerations.push('Prevent groupthink with structured dissent');
      considerations.push('Use anonymous input methods for sensitive topics');
    }

    return considerations;
  }

  private getBehavioralGuidance(itemType: AgendaItemType): string | null {
    const guidance: Record<AgendaItemType, string> = {
      'decision': 'Use structured decision-making: 1) Define criteria, 2) Generate options, 3) Evaluate systematically, 4) Test with pre-mortem analysis',
      'brainstorming': 'Divergent thinking first (no judgment), then convergent (evaluation). Use "Yes, and..." rather than "Yes, but..." language',
      'discussion': 'Encourage diverse perspectives. Use the "steel man" approach - strengthen others\' arguments before responding',
      'problem_solving': 'Define problem clearly before jumping to solutions. Use root cause analysis and systems thinking',
      'information_sharing': 'Structure information to avoid cognitive overload. Chunk complex information and check for understanding',
      'planning': 'Use backward planning from desired outcomes. Consider multiple scenarios and contingency plans',
      'review': 'Focus on learning rather than blame. What worked well? What could be improved? What should we do differently?',
      'check_in': 'Create psychological safety. Use inclusive language and ensure everyone feels heard'
    };

    return guidance[itemType] || null;
  }

  private getElapsedTime(): number {
    if (!this.startTime) return 0;
    return Math.round((new Date().getTime() - this.startTime.getTime()) / (1000 * 60));
  }

  private getPlannedTimeToCurrentItem(): number {
    const agenda = this.getActiveAgenda();
    if (!agenda) return 0;

    return agenda.items
      .slice(0, this.currentItemIndex + 1)
      .reduce((total, item) => total + item.timeAllocation, 0);
  }

  private getAgendaProgress(): { completed: number; total: number; current: string } {
    const agenda = this.getActiveAgenda();
    if (!agenda) return { completed: 0, total: 0, current: '' };

    const completed = agenda.items.filter(item => item.status === 'completed').length;
    const currentItem = this.getCurrentItem();

    return {
      completed,
      total: agenda.items.length,
      current: currentItem?.title || ''
    };
  }
}