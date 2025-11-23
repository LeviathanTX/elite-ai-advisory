import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Users,
  Settings,
  Send,
  Paperclip,
  FileText,
  Zap,
  ArrowLeft,
  Star,
  Brain,
  Mic,
  MicOff,
  Download,
  Share2,
  Edit2,
  Plus,
  Folder,
} from 'lucide-react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useDocumentContext } from '../../hooks/useDocumentContext';
import { createAdvisorAI } from '../../services/advisorAI';
import {
  generateDueDiligencePrompt,
  generateStrategicThinkingPrompt,
} from '../../services/DueDiligenceFramework';
import { AdvisorEditModal } from '../Modals/AdvisorEditModal';
import { QuickCreateAdvisorModal } from '../Modals/QuickCreateAdvisorModal';
import { CelebrityAdvisorCustomizationModal } from '../Modals/CelebrityAdvisorCustomizationModal';
import { DocumentSelector } from '../Documents/DocumentSelector';
import { DocumentReference } from '../../services/DocumentContext';
import { saveConversation as saveConversationToDb } from '../../services/conversationService';
import { cn } from '../../utils';

interface ConversationMode {
  id: 'strategic_planning' | 'due_diligence' | 'quick_consultation' | 'general';
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface EnhancedMeetingSettings {
  enableDebate: boolean;
  enableConsensusBuilding: boolean;
  discussionRounds: number;
  includeDocumentAnalysis: boolean;
  autoSummary: boolean;
  enableExpertPanel: boolean; // New: Expert panel mode with cross-document analysis
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'advisor' | 'system' | 'analysis';
  content: string;
  timestamp: Date;
  advisor?: any;
  attachments?: any[];
  metadata?: any;
}

interface AdvisoryConversationProps {
  onBack: () => void;
  initialMode?: ConversationMode['id'];
  conversationId?: string;
}

export function AdvisoryConversation({
  onBack,
  initialMode = 'general',
  conversationId,
}: AdvisoryConversationProps) {
  const { celebrityAdvisors, customAdvisors } = useAdvisor();
  const { user } = useAuth();
  const { settings, isConfigured } = useSettings();
  const {
    getDocumentContext,
    parseDocumentReferences,
    formatDocumentContextForAI,
    isLoading: documentContextLoading,
  } = useDocumentContext();

  const [selectedMode, setSelectedMode] = useState<ConversationMode['id']>(initialMode);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [enhancedSettings, setEnhancedSettings] = useState<EnhancedMeetingSettings>({
    enableDebate: false,
    enableConsensusBuilding: false,
    discussionRounds: 1,
    includeDocumentAnalysis: false,
    autoSummary: false,
    enableExpertPanel: true, // Enable expert panel by default for better document analysis
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(true);

  // Document selection state
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentReference[]>([]);
  // Store extracted document content persistently across entire conversation
  const [conversationDocuments, setConversationDocuments] = useState<
    Array<{ name: string; content: string }>
  >([]);

  // Modal states
  const [showAdvisorEditModal, setShowAdvisorEditModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showCelebrityCustomizationModal, setShowCelebrityCustomizationModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationModes: ConversationMode[] = [
    {
      id: 'strategic_planning',
      name: 'Strategic Planning',
      icon: <Brain className="w-4 h-4" />,
      description: 'Long-term strategy and planning discussions',
      color: 'bg-blue-500',
    },
    {
      id: 'due_diligence',
      name: 'Due Diligence',
      icon: <FileText className="w-4 h-4" />,
      description: 'Investment analysis and document review',
      color: 'bg-green-500',
    },
    {
      id: 'quick_consultation',
      name: 'Quick Consultation',
      icon: <Zap className="w-4 h-4" />,
      description: 'Fast answers and immediate advice',
      color: 'bg-orange-500',
    },
    {
      id: 'general',
      name: 'General Discussion',
      icon: <MessageCircle className="w-4 h-4" />,
      description: 'Open conversation with your advisors',
      color: 'bg-purple-500',
    },
  ];

  const allAdvisors = [...celebrityAdvisors, ...customAdvisors];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('AdvisoryConversation mounted with conversationId:', conversationId);
    // Load existing conversation if conversationId provided
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = (id: string) => {
    console.log('Loading conversation:', id);
    const saved = localStorage.getItem(`conversation-${id}`);
    console.log('Saved conversation data:', saved);

    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('Parsed conversation data:', data);
        setMessages(data.messages || []);
        setSelectedAdvisors(data.advisors || []);
        setSelectedMode(data.mode || 'general');
        setUploadedFiles(data.files || []);
        setSelectedDocuments(data.selectedDocuments || []);
        setConversationDocuments(data.conversationDocuments || []);
        console.log(
          `📚 Loaded ${data.conversationDocuments?.length || 0} persistent documents from saved conversation`
        );
      } catch (error) {
        console.error('Error parsing conversation data:', error);
      }
    } else {
      console.warn('No conversation found with id:', id);
    }
  };

  const saveConversation = async () => {
    if (!user?.id) {
      console.warn('Cannot save conversation: no user logged in');
      return;
    }

    const conversationData = {
      id: conversationId || `conv-${Date.now()}`,
      user_id: user.id,
      mode: selectedMode,
      advisors: selectedAdvisors.map(id => {
        const advisor = allAdvisors.find(a => a.id === id);
        return {
          id,
          type: celebrityAdvisors.some(a => a.id === id)
            ? ('celebrity' as const)
            : ('custom' as const),
          name: advisor?.name,
        };
      }),
      messages: messages.map(m => ({
        id: m.id,
        role: m.type === 'user' || m.type === 'advisor' ? m.type : 'advisor', // Convert type to role
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
      files: uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
      selectedDocuments,
      conversationDocuments: conversationDocuments.map((doc, index) => ({
        id: `doc-${Date.now()}-${index}`,
        filename: doc.name,
        content: doc.content,
        metadata: {},
      })), // Persist document content across sessions
      title: generateConversationTitle(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to database (also caches in localStorage)
    const result = await saveConversationToDb(conversationData);

    if (!result.success) {
      console.error('Failed to save conversation to database:', result.error);
    } else {
      console.log('✅ Conversation saved successfully');
    }

    return conversationData.id;
  };

  const generateConversationTitle = () => {
    const mode = conversationModes.find(m => m.id === selectedMode)?.name || 'General';
    const advisorNames = selectedAdvisors
      .map(id => allAdvisors.find(a => a.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(', ');

    return `${mode} with ${advisorNames}${selectedAdvisors.length > 2 ? ` +${selectedAdvisors.length - 2}` : ''}`;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log('📄 Extracting text from file:', file.name, 'type:', file.type);

    // Safety check for undefined file.type
    if (!file || !file.type) {
      console.warn('File or file.type is undefined, using default handler');
      try {
        return await file.text();
      } catch (error) {
        return `[Unable to extract text from file: ${file?.name || 'unknown'}]`;
      }
    }

    if (file.type === 'text/plain' || file.type === 'text/csv') {
      // Plain text files
      return await file.text();
    } else if (file.type === 'application/json') {
      // JSON files
      const text = await file.text();
      return `JSON Content:\n${text}`;
    } else if (file.type && file.type.includes('text/')) {
      // Other text files
      return await file.text();
    } else if (file.type === 'application/pdf') {
      // Extract text from PDF using PDF.js
      try {
        console.log('📖 Extracting text from PDF using PDF.js...');
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractPDFText(arrayBuffer);
        return text.length > 0 ? text : `[PDF appears to be empty or contains only images]`;
      } catch (error) {
        console.error('PDF extraction error:', error);
        return `PDF Document: ${file.name}\n[Error extracting PDF content: ${error instanceof Error ? error.message : 'Unknown error'}]`;
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      // Word documents (.docx, .doc)
      try {
        console.log('📝 Extracting text from Word document...');
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractWordText(arrayBuffer);
        return text.length > 0 ? text : `[Word document appears to be empty]`;
      } catch (error) {
        console.error('Word extraction error:', error);
        return `Word Document: ${file.name}\n[Error extracting Word content: ${error instanceof Error ? error.message : 'Unknown error'}]`;
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    ) {
      // Excel files (.xlsx, .xls)
      try {
        console.log('📊 Extracting data from Excel spreadsheet...');
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractExcelText(arrayBuffer);
        return text.length > 0 ? text : `[Excel spreadsheet appears to be empty]`;
      } catch (error) {
        console.error('Excel extraction error:', error);
        return `Excel Document: ${file.name}\n[Error extracting Excel content: ${error instanceof Error ? error.message : 'Unknown error'}]`;
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.type === 'application/vnd.ms-powerpoint'
    ) {
      // PowerPoint files (.pptx, .ppt)
      try {
        console.log('🎤 Extracting text from PowerPoint presentation...');
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractPowerPointText(arrayBuffer);
        return text.length > 0 ? text : `[PowerPoint presentation appears to be empty]`;
      } catch (error) {
        console.error('PowerPoint extraction error:', error);
        return `PowerPoint Document: ${file.name}\n[Error extracting PowerPoint content: ${error instanceof Error ? error.message : 'Unknown error'}]\n\nNote: PowerPoint extraction has limited support. Consider exporting slides as PDF for better text extraction.`;
      }
    } else {
      // For other file types, try to read as text
      try {
        const text = await file.text();
        return text.length > 0 ? text : `[Unable to extract text from ${file.type} file]`;
      } catch (error) {
        return `[Unable to extract text from ${file.type} file]`;
      }
    }
  };

  const extractPDFText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Dynamically import PDF.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');

    // Import and use centralized worker setup
    const { configurePDFWorkerAuto, checkPDFWorkerCompatibility } = await import(
      '../../utils/pdfWorkerSetup'
    );

    // Configure worker if not already done
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      configurePDFWorkerAuto();
    }

    checkPDFWorkerCompatibility();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    console.log(`📄 PDF has ${pdf.numPages} pages`);

    // Extract text from all pages with improved text handling
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`📖 Processing page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      console.log(`📝 Page ${pageNum} has ${textContent.items.length} text items`);

      // Improved text extraction with better spacing and formatting
      const pageText = textContent.items
        .map((item: any) => {
          // Add space after each text item to ensure proper word separation
          return item.str || '';
        })
        .filter(text => text.trim()) // Remove empty strings
        .join(' ') // Join with spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces
        .trim();

      console.log(`📄 Page ${pageNum} extracted text length: ${pageText.length}`);
      console.log(`📄 Page ${pageNum} first 100 chars: "${pageText.substring(0, 100)}..."`);

      if (pageText) {
        fullText += `Page ${pageNum}:\n${pageText}\n\n`;
      } else {
        console.log(`⚠️ Page ${pageNum} contains no extractable text`);
      }
    }

    console.log(`📖 TOTAL extracted ${fullText.length} characters from PDF`);
    console.log(`📖 First 200 characters: "${fullText.substring(0, 200)}..."`);

    if (fullText.trim()) {
      return fullText.trim();
    } else {
      console.log('⚠️ PDF appears to contain only images or non-extractable content');
      return '[PDF contains no extractable text - may contain only images or scanned content]';
    }
  };

  const extractWordText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      // Dynamically import mammoth to avoid SSR issues
      const mammoth = await import('mammoth');

      const result = await mammoth.extractRawText({ arrayBuffer });
      console.log(`📝 Extracted ${result.value.length} characters from Word document`);

      if (result.messages.length > 0) {
        console.log('Word extraction messages:', result.messages);
      }

      return result.value || '[Word document contains no extractable text]';
    } catch (error) {
      console.error('Mammoth extraction error:', error);
      throw error;
    }
  };

  const extractExcelText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      // Dynamically import xlsx to avoid SSR issues
      const XLSX = await import('xlsx');

      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let allText = '';

      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);

        if (sheetData.trim()) {
          allText += `Sheet: ${sheetName}\n${sheetData}\n\n`;
        }
      });

      console.log(
        `📊 Extracted ${allText.length} characters from Excel spreadsheet (${workbook.SheetNames.length} sheets)`
      );
      return allText.trim() || '[Excel spreadsheet contains no data]';
    } catch (error) {
      console.error('XLSX extraction error:', error);
      throw error;
    }
  };

  const extractPowerPointText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Note: PowerPoint extraction is complex and requires specialized libraries
    // For now, we'll provide a placeholder with instructions
    console.log('🎤 PowerPoint extraction attempted');

    try {
      // Try to read as a zip file and extract XML content (basic approach)
      const text = await extractPowerPointBasic(arrayBuffer);
      return (
        text ||
        '[PowerPoint extraction not fully supported - consider converting to PDF for better text extraction]'
      );
    } catch (error) {
      console.error('PowerPoint extraction error:', error);
      throw new Error(
        'PowerPoint files require conversion to PDF for optimal text extraction. Please save your presentation as PDF and upload that instead.'
      );
    }
  };

  const extractPowerPointBasic = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // This is a basic implementation - PowerPoint files are complex ZIP archives
    // For production use, consider using libraries like 'pptx2json' or converting to PDF first
    return '[PowerPoint text extraction is limited. For best results, please export your presentation as a PDF and upload that instead.]';
  };

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev =>
      prev.includes(advisorId) ? prev.filter(id => id !== advisorId) : [...prev, advisorId]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);

    // Add system message about file upload
    files.forEach(file => {
      const message: ConversationMessage = {
        id: `file-${Date.now()}-${file.name}`,
        type: 'system',
        content: `📎 Document uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        timestamp: new Date(),
        attachments: [{ name: file.name, size: file.size, type: file.type }],
      };
      setMessages(prev => [...prev, message]);
    });

    // Extract and persist document content for the entire conversation
    console.log('📄 Extracting document content for persistent storage...');
    for (const file of files) {
      try {
        const extractedText = await extractTextFromFile(file);
        setConversationDocuments(prev => [...prev, { name: file.name, content: extractedText }]);
        console.log(
          `✅ Stored ${file.name} content (${extractedText.length} chars) for persistent access`
        );
      } catch (error) {
        console.error(`Failed to extract content from ${file.name}:`, error);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;
    if (selectedAdvisors.length === 0) {
      alert('Please select at least one advisor to start the conversation.');
      return;
    }

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Store uploaded files for this message and clear the state
    const currentFiles = [...uploadedFiles];
    setUploadedFiles([]);

    try {
      // Generate responses from selected advisors
      await generateAdvisorResponses(inputMessage, currentFiles);
    } catch (error) {
      console.error('Error generating advisor responses:', error);
    } finally {
      setIsTyping(false);
      saveConversation();
    }
  };

  const generateAdvisorResponses = async (userInput: string, files: File[]) => {
    const selectedAdvisorObjects = selectedAdvisors
      .map(id => allAdvisors.find(a => a.id === id))
      .filter(Boolean);

    // Enhanced meeting mode - generate debate or consensus
    if (enhancedSettings.enableDebate && selectedAdvisorObjects.length > 1) {
      await generateEnhancedDiscussion(selectedAdvisorObjects, userInput, files);
    } else {
      // Standard individual responses
      await generateIndividualResponses(selectedAdvisorObjects, userInput, files);
    }
  };

  const generateEnhancedDiscussion = async (advisors: any[], userInput: string, files: File[]) => {
    // Add system message about starting enhanced discussion
    const systemMessage: ConversationMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: `🚀 Enhanced Meeting Mode: ${advisors.length} advisors discussing your question with ${enhancedSettings.discussionRounds} rounds of debate`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);

    for (let round = 1; round <= enhancedSettings.discussionRounds; round++) {
      const roundMessage: ConversationMessage = {
        id: `round-${Date.now()}-${round}`,
        type: 'system',
        content: `🔄 Discussion Round ${round}/${enhancedSettings.discussionRounds}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, roundMessage]);

      // Generate responses for each advisor in this round
      for (let i = 0; i < advisors.length; i++) {
        const advisor = advisors[i];
        const response = await generateSingleAdvisorResponse(advisor, userInput, files, {
          round,
          totalRounds: enhancedSettings.discussionRounds,
          otherAdvisors: advisors.filter((_, index) => index !== i),
          previousMessages: messages.slice(-10),
        });

        const advisorMessage: ConversationMessage = {
          id: `advisor-${Date.now()}-${advisor.id}-${round}`,
          type: 'advisor',
          content: response,
          timestamp: new Date(),
          advisor,
          metadata: { round, discussionMode: true },
        };

        setMessages(prev => [...prev, advisorMessage]);

        // Simulate typing delay between advisors
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      }
    }

    // Generate consensus if enabled
    if (enhancedSettings.enableConsensusBuilding) {
      await generateConsensus(advisors, userInput, files);
    }
  };

  const generateIndividualResponses = async (advisors: any[], userInput: string, files: File[]) => {
    for (const advisor of advisors) {
      const response = await generateSingleAdvisorResponse(advisor, userInput, files);

      const advisorMessage: ConversationMessage = {
        id: `advisor-${Date.now()}-${advisor.id}`,
        type: 'advisor',
        content: response,
        timestamp: new Date(),
        advisor,
      };

      setMessages(prev => [...prev, advisorMessage]);

      // Simulate typing delay between advisors
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    }
  };

  const generateSingleAdvisorResponse = async (
    advisor: any,
    userInput: string,
    files: File[],
    context?: any
  ) => {
    // Use mock AI service to generate response
    const mode = conversationModes.find(m => m.id === selectedMode);

    // Get document context from knowledge base
    let documentContextString = '';
    try {
      if (selectedDocuments.length > 0) {
        console.log('📚 Getting document context for advisor:', advisor.id);
        const conversationHistory = messages
          .filter(msg => msg.type === 'user' || msg.type === 'advisor')
          .map(msg => msg.content)
          .slice(-20); // Increased from 5 to 20 messages for better context continuity

        const referencedDocIds = selectedDocuments.map(ref => ref.id);
        const documentContext = await getDocumentContext(
          advisor.id,
          conversationHistory,
          referencedDocIds
        );

        if (documentContext) {
          documentContextString = formatDocumentContextForAI(documentContext);
          console.log('📄 Document context formatted:', documentContextString.length, 'characters');
        }
      }
    } catch (error) {
      console.error('Error getting document context:', error);
    }

    // Extract document content from uploaded files (new uploads in this message)
    let uploadedFileContent = '';
    if (files.length > 0) {
      console.log(
        '📄 Processing uploaded documents:',
        files.map(f => f.name)
      );
      const fileContents = await Promise.all(
        files.map(async file => {
          try {
            console.log(
              `🔍 Starting extraction for file: ${file.name} (${file.size} bytes, type: ${file.type})`
            );
            const text = await extractTextFromFile(file);
            console.log(`✅ Successfully extracted ${text.length} characters from ${file.name}`);
            console.log(`📝 First 200 chars from ${file.name}: "${text.substring(0, 200)}..."`);
            return `Document: ${file.name}\n${text}`;
          } catch (error) {
            console.error('Error reading file:', file.name, error);
            return `Document: ${file.name}\n[Unable to read file content]`;
          }
        })
      );
      uploadedFileContent = fileContents.join('\n\n');
      console.log(`🔥 COMBINED UPLOAD CONTENT LENGTH: ${uploadedFileContent.length} characters`);
    }

    // CRITICAL: Include ALL conversation documents (persistent across all turns)
    // This ensures advisors have access to documents throughout the entire conversation
    let persistentDocumentContent = '';
    if (conversationDocuments.length > 0) {
      console.log(`📚 Including ${conversationDocuments.length} persistent conversation documents`);
      persistentDocumentContent = conversationDocuments
        .map(doc => `Document: ${doc.name}\n${doc.content}`)
        .join('\n\n');
      console.log(
        `💾 PERSISTENT DOCUMENT CONTENT LENGTH: ${persistentDocumentContent.length} characters`
      );
    }

    // Combine persistent documents with any new uploads
    const allDocumentContent = [persistentDocumentContent, uploadedFileContent]
      .filter(Boolean)
      .join('\n\n');
    console.log(`📊 TOTAL DOCUMENT CONTENT: ${allDocumentContent.length} characters`);

    // Parse document references from user input
    const allAdvisors = [...celebrityAdvisors, ...customAdvisors];
    const documentReferences = parseDocumentReferences(userInput, []);

    const contextInfo = [
      conversationDocuments.length > 0
        ? `Conversation documents available: ${conversationDocuments.map(d => d.name).join(', ')}`
        : '',
      files.length > 0 ? `New files uploaded: ${files.map(f => f.name).join(', ')}` : '',
      selectedDocuments.length > 0
        ? `Knowledge base documents: ${selectedDocuments.map(d => d.name).join(', ')}`
        : '',
      documentReferences.length > 0
        ? `Referenced documents: ${documentReferences.map(d => d.name).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are ${advisor.name} in a ${mode?.name || 'general'} conversation.
    ${mode?.description || ''}

    ${contextInfo}

    ${documentContextString}

    ${allDocumentContent ? `\n\nDOCUMENTS AVAILABLE FOR THIS CONVERSATION:\n${allDocumentContent}` : ''}

    ${context ? `This is round ${context.round} of ${context.totalRounds} in an enhanced discussion with: ${context.otherAdvisors.map((a: any) => a.name).join(', ')}` : ''}

    IMPORTANT CONTEXT INSTRUCTIONS:
    - You have access to the full conversation history, including all previous questions and your previous responses
    - Any documents that were uploaded are available for reference throughout this entire conversation
    - When users ask follow-up questions about documents, refer back to the document content and your previous analysis
    - Maintain continuity with your previous responses while providing new insights
    - If a user references "the deck", "the document", or "the materials" without specifying, they are referring to documents that were previously uploaded in this conversation

    Respond as ${advisor.name} would, providing specific, actionable advice based on your expertise. If documents were provided, analyze them thoroughly and reference specific details in your response. You can reference documents using @document-name syntax.`;

    console.log('📋 System prompt with enhanced context:', {
      hasKnowledgeBase: !!documentContextString,
      hasDocumentContent: !!allDocumentContent,
      persistentDocsCount: conversationDocuments.length,
      knowledgeBaseLength: documentContextString.length,
      allDocumentContentLength: allDocumentContent.length,
      selectedDocuments: selectedDocuments.length,
      systemPromptLength: systemPrompt.length,
    });

    try {
      console.log('Advisor response debug:', {
        hasClaudeService: !!settings.aiServices.claude,
      });

      // Always use AI service - it will automatically use server-side proxy in production
      const aiService = settings.aiServices.claude || {
        id: 'claude',
        name: 'Claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: '',
      };
      console.log(
        'Using AI service for',
        advisor.name,
        '(will use server-side proxy if no local key)'
      );
      const advisorAI = createAdvisorAI(aiService);

      // Enhanced prompt generation based on mode and advisor role
      const hasDocumentContext = documentContextString.length > 0 || allDocumentContent.length > 0;
      let enhancedPrompt = systemPrompt;

      // Generate specialized prompts for due diligence and strategic thinking
      if (selectedMode === 'due_diligence' && advisor.role) {
        const contextInfo = hasDocumentContext
          ? `${documentContextString}\n\n${allDocumentContent}`
          : '';
        enhancedPrompt = generateDueDiligencePrompt(
          advisor.role,
          `User Question: ${userInput}`,
          contextInfo || undefined
        );
      } else if (selectedMode === 'strategic_planning') {
        const contextInfo = hasDocumentContext
          ? `${documentContextString}\n\n${allDocumentContent}`
          : '';
        // Determine business stage based on conversation context (default to growth)
        const businessStage = userInput.toLowerCase().includes('startup')
          ? 'startup'
          : userInput.toLowerCase().includes('mature')
            ? 'mature'
            : 'growth';
        enhancedPrompt = generateStrategicThinkingPrompt(
          businessStage,
          userInput,
          contextInfo || undefined
        );
      } else if (hasDocumentContext) {
        // Use document-enhanced system prompt
        enhancedPrompt = `${systemPrompt}

DOCUMENT CONTEXT:
${documentContextString}
${allDocumentContent}

Based on the documents provided and your expertise, please analyze and respond to the user's question or request.`;
      }

      // Build conversation history for multi-turn context
      // This ensures advisors remember previous exchanges and document discussions
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'advisor')
        .filter(msg => !msg.advisor || msg.advisor.id === advisor.id) // Only include this advisor's conversation thread
        .slice(-10) // Last 10 messages (5 exchanges) for context
        .map(msg => ({
          role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        }));

      console.log(
        `📜 Building conversation context for ${advisor.name}: ${conversationHistory.length} previous messages`
      );

      const response = await advisorAI.generateResponseWithCustomPrompt(
        enhancedPrompt,
        userInput, // Always pass user input as the message content
        {
          maxTokens: 2000, // Increased for more detailed analysis
          conversationHistory, // Pass conversation history for persistent context
        }
      );

      if (response && response.trim().length > 0) {
        console.log(
          'Successfully got AI response for',
          advisor.name,
          'Document analysis:',
          hasDocumentContext
        );
        return response;
      } else {
        console.log('AI response was empty or null');
        throw new Error('Empty response from AI service');
      }
    } catch (error) {
      console.error('AI Service error:', error);
      // In production, throw the error so the UI can show it
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      // In development, fall back to mock response
      console.log('Using mock response due to API error (development only)');
      return generateMockAdvisorResponse(advisor, userInput, selectedMode, context);
    }

    // Should never reach here - either return response or throw error
    throw new Error('Unexpected: reached end of getAdvisorResponse without returning');
  };

  const generateMockAdvisorResponse = (
    advisor: any,
    userInput: string,
    mode: string,
    context?: any
  ) => {
    const responses = {
      'Mark Cuban': [
        "Let me be direct - this comes down to execution and numbers. The market won't care about your idea if you can't prove traction.",
        "I've seen this pattern before. The companies that win here focus on customer acquisition costs and lifetime value from day one.",
        'The opportunity is real, but you need to think bigger about scalability. How do you 10x this business model?',
      ],
      'Reid Hoffman': [
        'This has interesting network effects potential. The key is building defensible moats through data and user engagement.',
        "I'm thinking about platform dynamics here. How do you create an ecosystem that becomes more valuable as it grows?",
        'The strategic positioning looks solid, but consider the long-term competitive landscape and potential platform plays.',
      ],
      'Barbara Corcoran': [
        "I love the energy, but let's talk about the practical side. How are you actually going to get customers through the door?",
        'This reminds me of a deal I saw succeed because of brilliant sales execution. Your go-to-market strategy is everything here.',
        "The fundamentals are good, but you need to think like a customer. What's going to make them choose you over the competition?",
      ],
    };

    const advisorResponses = responses[advisor.name as keyof typeof responses] || [
      'Based on my experience, this presents both opportunities and challenges that we should explore further.',
      'I see potential here, but execution will be critical to success in this market.',
      'This is an interesting approach. Let me share some thoughts on how to strengthen your position.',
    ];

    let response = advisorResponses[Math.floor(Math.random() * advisorResponses.length)];

    // Add context-specific elements
    if (context?.round > 1) {
      response = `Building on what others have said, ${response.toLowerCase()}`;
    }

    if (mode === 'due_diligence') {
      response +=
        " From an investment perspective, I'd want to see stronger validation of the market demand.";
    }

    return response;
  };

  const generateConsensus = async (advisors: any[], userInput: string, files: File[] = []) => {
    const consensusMessage: ConversationMessage = {
      id: `consensus-${Date.now()}`,
      type: 'system',
      content: `🤝 Building Consensus: Advisors are working to find common ground and final recommendations...`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, consensusMessage]);

    try {
      // Get the most recent advisor responses from current conversation
      const currentMessages = [...messages]; // Capture current state
      const recentAdvisorMessages = currentMessages
        .filter(msg => msg.type === 'advisor' && advisors.some(a => a.id === msg.advisor?.id))
        .slice(-advisors.length); // Get the last response from each advisor

      if (recentAdvisorMessages.length === 0) {
        console.log('⚠️ No recent advisor messages found for consensus');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const fallbackMessage: ConversationMessage = {
          id: `final-${Date.now()}`,
          type: 'analysis',
          content: `📊 Advisory Committee Consensus:\n\nThe advisors are still formulating their collective recommendations. Please try the consensus feature after getting individual responses from the advisors.`,
          timestamp: new Date(),
          metadata: { type: 'consensus', advisors: advisors.map(a => a.name) },
        };
        setMessages(prev => [...prev, fallbackMessage]);
        return;
      }

      // Compile advisor responses for AI analysis
      const advisorResponseSummary = recentAdvisorMessages
        .map(msg => `**${msg.advisor?.name}**: ${msg.content}`)
        .join('\n\n');

      console.log('🔍 Generating AI consensus from advisor responses...');
      console.log(
        `📝 Advisor responses summary length: ${advisorResponseSummary.length} characters`
      );

      // Create a prompt for AI to generate consensus
      const consensusPrompt = `You are facilitating an advisory committee meeting. Based on the individual responses from these business advisors, synthesize their collective wisdom into a unified consensus.

ORIGINAL QUESTION: ${userInput}

ADVISOR RESPONSES:
${advisorResponseSummary}

Please analyze these responses and create a comprehensive consensus that:
1. Identifies the key areas where advisors agree
2. Synthesizes conflicting viewpoints into balanced recommendations  
3. Highlights the most important action items
4. Provides a clear strategic direction

Format your response as "📊 Advisory Committee Consensus:" followed by:
- Brief summary of collective insights
- 3-5 bullet points with key recommendations
- Final conclusion/next steps

Be concise but comprehensive, focusing on actionable insights that represent the collective wisdom of the advisory panel.`;

      // Use AI service to generate consensus
      const { aiServices } = settings;
      const isConfigured = aiServices?.claude?.apiKey && aiServices.claude.apiKey.trim().length > 0;

      if (isConfigured) {
        console.log('🤖 Using real AI service to generate consensus');
        const advisorAI = createAdvisorAI(aiServices.claude);
        const consensusContent = await advisorAI.generateResponseWithCustomPrompt(
          consensusPrompt,
          '', // Empty user message since prompt contains everything
          { temperature: 0.7, maxTokens: 800 }
        );

        await new Promise(resolve => setTimeout(resolve, 1000));
        const finalMessage: ConversationMessage = {
          id: `final-${Date.now()}`,
          type: 'analysis',
          content: consensusContent,
          timestamp: new Date(),
          metadata: { type: 'consensus', advisors: advisors.map(a => a.name) },
        };
        setMessages(prev => [...prev, finalMessage]);
      } else {
        console.log('⚠️ AI service not configured, using enhanced mock consensus');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create a more dynamic mock consensus based on advisor names
        const advisorNames = advisors.map(a => a.name).join(', ');
        const mockConsensus = `📊 Advisory Committee Consensus:

After thorough discussion, ${advisorNames} have reached agreement on several critical points:

• **Market Validation**: Strong emphasis on customer validation and proof of market demand before scaling
• **Competitive Strategy**: Build defensible advantages through technology, network effects, or exclusive partnerships  
• **Execution Priority**: Sales and go-to-market strategy should be the immediate operational focus
• **Financial Foundation**: Strengthen unit economics and create realistic, data-driven growth projections
• **Risk Management**: Address identified market and execution risks through systematic planning

The committee unanimously recommends proceeding with measured optimism while systematically addressing these strategic priorities. Regular check-ins should be scheduled to monitor progress against these recommendations.`;

        const finalMessage: ConversationMessage = {
          id: `final-${Date.now()}`,
          type: 'analysis',
          content: mockConsensus,
          timestamp: new Date(),
          metadata: { type: 'consensus', advisors: advisors.map(a => a.name) },
        };
        setMessages(prev => [...prev, finalMessage]);
      }
    } catch (error) {
      console.error('Error generating consensus:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const errorMessage: ConversationMessage = {
        id: `final-${Date.now()}`,
        type: 'analysis',
        content: `📊 Advisory Committee Consensus:\n\n⚠️ Unable to generate consensus analysis at this time. Please try again or review the individual advisor responses above for guidance.`,
        timestamp: new Date(),
        metadata: { type: 'consensus', advisors: advisors.map(a => a.name) },
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const currentMode = conversationModes.find(m => m.id === selectedMode);

  // Advisor editing functions
  const handleEditAdvisor = (advisor: any) => {
    setEditingAdvisor(advisor);
    const isCelebrity = celebrityAdvisors.some(ca => ca.id === advisor.id);

    if (isCelebrity) {
      setShowCelebrityCustomizationModal(true);
    } else {
      setShowAdvisorEditModal(true);
    }
  };

  const handleCreateNewAdvisor = () => {
    setEditingAdvisor(null);
    setShowQuickCreateModal(true);
  };

  const handleAdvisorCreated = (newAdvisor: any) => {
    // Automatically add the new advisor to the conversation
    setSelectedAdvisors(prev => [...prev, newAdvisor.id]);

    // Add a system message about the new advisor joining
    const systemMessage: ConversationMessage = {
      id: `advisor-joined-${Date.now()}`,
      type: 'system',
      content: `✨ ${newAdvisor.name} (${newAdvisor.role}) has joined the conversation`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleAdvisorUpdated = (updatedAdvisor: any) => {
    // Real-time update: refresh advisor data in conversation
    // The advisor context will handle the global update

    // Add a system message about the update
    const systemMessage: ConversationMessage = {
      id: `advisor-updated-${Date.now()}`,
      type: 'system',
      content: `🔄 ${updatedAdvisor.name}'s settings have been updated`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const closeAllModals = () => {
    setShowAdvisorEditModal(false);
    setShowQuickCreateModal(false);
    setShowCelebrityCustomizationModal(false);
    setEditingAdvisor(null);
  };

  return (
    <div className={cn('h-screen flex bg-gray-50', !isConfigured && 'pt-10')}>
      {/* Development Mode Banner */}
      {!isConfigured && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
          🔧 DEVELOPMENT MODE - Using simulated AI responses.{' '}
          <button
            onClick={() => setShowSettings(true)}
            className="underline hover:text-orange-100 font-semibold"
          >
            Configure API keys in Settings
          </button>{' '}
          for real AI integration.
        </div>
      )}

      {/* Sidebar - Advisor Selection */}
      {showAdvisorPanel && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Advisory Board</h2>
              </div>
              <button
                onClick={() => setShowAdvisorPanel(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Conversation Type</label>
              <div className="grid grid-cols-2 gap-2">
                {conversationModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      'p-2 rounded-lg text-xs font-medium transition-all flex items-center space-x-1',
                      selectedMode === mode.id
                        ? `${mode.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {mode.icon}
                    <span>{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advisor List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Select Advisors ({selectedAdvisors.length})
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={handleCreateNewAdvisor}
                    className="p-1 rounded hover:bg-gray-100 text-purple-600"
                    title="Create new advisor"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {allAdvisors.map(advisor => {
                const isSelected = selectedAdvisors.includes(advisor.id);
                const isCelebrity = celebrityAdvisors.some(ca => ca.id === advisor.id);

                return (
                  <div
                    key={advisor.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all group',
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="text-2xl cursor-pointer"
                        onClick={() => toggleAdvisor(advisor.id)}
                      >
                        {advisor.avatar_emoji || '👤'}
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => toggleAdvisor(advisor.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 text-sm">{advisor.name}</span>
                          {isCelebrity && (
                            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {advisor.role || advisor.title}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEditAdvisor(advisor);
                          }}
                          className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={isCelebrity ? 'Customize AI settings' : 'Edit advisor'}
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>

                        {isSelected && (
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Settings */}
          {showSettings && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">Enhanced Meeting Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableDebate}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableDebate: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 mr-2"
                  />
                  Enable Advisor Debate
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableConsensusBuilding}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableConsensusBuilding: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 mr-2"
                  />
                  Build Consensus
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={enhancedSettings.enableExpertPanel}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        enableExpertPanel: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 mr-2"
                  />
                  <span>
                    Expert Panel Mode{' '}
                    <span className="text-xs text-gray-500">
                      (Deep document analysis with cross-referencing)
                    </span>
                  </span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discussion Rounds: {enhancedSettings.discussionRounds}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={enhancedSettings.discussionRounds}
                    onChange={e =>
                      setEnhancedSettings(prev => ({
                        ...prev,
                        discussionRounds: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showAdvisorPanel && (
                <button
                  onClick={() => setShowAdvisorPanel(true)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium">
                ← Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={cn('w-3 h-3 rounded-full', currentMode?.color)} />
                <h1 className="text-xl font-bold text-gray-900">{currentMode?.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAdvisors.length} advisor{selectedAdvisors.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  // Share functionality
                  const conversationData = {
                    title: `Advisory Session - ${currentMode?.name}`,
                    advisors: selectedAdvisors
                      .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                      .filter(Boolean)
                      .join(', '),
                    messages: messages,
                    timestamp: new Date().toISOString(),
                  };

                  if (navigator.share) {
                    navigator
                      .share({
                        title: conversationData.title,
                        text: `Conversation with ${conversationData.advisors}\n\n${messages.map(m => `${m.type === 'user' ? 'You' : 'Advisor'}: ${m.content}`).join('\n\n')}`,
                      })
                      .catch(console.error);
                  } else {
                    // Fallback: copy to clipboard
                    const shareText = `${conversationData.title}\nAdvisors: ${conversationData.advisors}\n\n${messages.map(m => `${m.type === 'user' ? 'You' : 'Advisor'}: ${m.content}`).join('\n\n')}`;
                    navigator.clipboard
                      .writeText(shareText)
                      .then(() => {
                        alert('Conversation copied to clipboard!');
                      })
                      .catch(() => {
                        alert('Could not share conversation');
                      });
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Share conversation"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Download functionality
                  const conversationData = {
                    title: `Advisory Session - ${currentMode?.name}`,
                    advisors: selectedAdvisors
                      .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                      .filter(Boolean)
                      .join(', '),
                    messages: messages,
                    timestamp: new Date().toISOString(),
                    mode: currentMode?.name,
                  };

                  const chatText = `${conversationData.title}
Generated: ${new Date(conversationData.timestamp).toLocaleString()}
Mode: ${conversationData.mode}
Advisors: ${conversationData.advisors}

${'='.repeat(50)}

${messages.map(m => `${m.type === 'user' ? 'You' : 'Advisor'}: ${m.content}`).join('\n\n')}`;

                  const blob = new Blob([chatText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `advisory-session-${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Download conversation"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div
                className={cn(
                  'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                  currentMode?.color
                )}
              >
                <div className="text-white text-2xl">{currentMode?.icon}</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Your Advisory Session
              </h3>
              <p className="text-gray-600 mb-4">{currentMode?.description}</p>
              <p className="text-sm text-gray-500">
                {selectedAdvisors.length > 0
                  ? `${selectedAdvisors.length} advisor${selectedAdvisors.length !== 1 ? 's' : ''} ready to help`
                  : 'Select advisors from the sidebar to begin'}
              </p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn('flex', message.type === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs lg:max-w-md px-4 py-3 rounded-lg',
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'system'
                      ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-400'
                      : message.type === 'analysis'
                        ? 'bg-green-50 text-green-800 border-l-4 border-green-400 max-w-2xl'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                )}
              >
                {message.advisor && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{message.advisor.avatar_emoji || '👤'}</span>
                      <span className="font-semibold text-purple-700 text-sm">
                        {message.advisor.name}
                      </span>
                      {celebrityAdvisors.some(ca => ca.id === message.advisor.id) && (
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                      )}
                      {message.metadata?.round && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          Round {message.metadata.round}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditAdvisor(message.advisor)}
                      className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={
                        celebrityAdvisors.some(ca => ca.id === message.advisor.id)
                          ? 'Customize AI settings'
                          : 'Edit advisor'
                      }
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600">Advisors are discussing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Documents Display */}
          {selectedDocuments.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  📚 Knowledge Base ({selectedDocuments.length} documents)
                </span>
                <button
                  onClick={() => setShowDocumentSelector(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.slice(0, 3).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-1 bg-white rounded px-2 py-1"
                  >
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-gray-700">{doc.name}</span>
                  </div>
                ))}
                {selectedDocuments.length > 3 && (
                  <div className="text-xs text-blue-600">+{selectedDocuments.length - 3} more</div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Upload documents"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowDocumentSelector(true)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  selectedDocuments.length > 0
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                )}
                title="Browse and select documents"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isRecording
                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                )}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask your advisory board anything..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || selectedAdvisors.length === 0}
              className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdvisorEditModal
        advisor={editingAdvisor}
        isOpen={showAdvisorEditModal}
        onClose={closeAllModals}
        onSave={handleAdvisorUpdated}
      />

      <QuickCreateAdvisorModal
        isOpen={showQuickCreateModal}
        onClose={closeAllModals}
        onAdvisorCreated={handleAdvisorCreated}
      />

      <CelebrityAdvisorCustomizationModal
        advisor={editingAdvisor}
        isOpen={showCelebrityCustomizationModal}
        onClose={closeAllModals}
        onSave={handleAdvisorUpdated}
      />

      {/* Document Selector */}
      <DocumentSelector
        advisorId={selectedAdvisors.length > 0 ? selectedAdvisors[0] : 'general'} // Use first selected advisor or 'general' for browsing
        onDocumentsSelected={setSelectedDocuments}
        selectedDocuments={selectedDocuments}
        isOpen={showDocumentSelector}
        onClose={() => setShowDocumentSelector(false)}
      />
    </div>
  );
}
