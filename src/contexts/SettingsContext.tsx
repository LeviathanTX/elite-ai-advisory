import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIService, AIServiceConfig, AppSettings } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  addAIService: (service: AIServiceConfig) => void;
  removeAIService: (serviceId: AIService) => void;
  updateAIService: (serviceId: AIService, updates: Partial<AIServiceConfig>) => void;
  getAIService: (serviceId: AIService) => AIServiceConfig | undefined;
  isConfigured: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  aiServices: {
    claude: {
      id: 'claude',
      name: 'Claude (Anthropic)',
      apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
      baseUrl: 'https://api.anthropic.com',
      model: 'claude-sonnet-4-20250514',
    },
    gemini: {
      id: 'gemini',
      name: 'Gemini (Google)',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: 'gemini-pro',
    },
    chatgpt: {
      id: 'chatgpt',
      name: 'ChatGPT (OpenAI)',
      apiKey: '',
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4',
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    },
    groq: {
      id: 'groq',
      name: 'Groq',
      apiKey: '',
      baseUrl: 'https://api.groq.com',
      model: 'llama3-70b-8192',
    },
  },
  defaultAIService: 'claude',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('bearable-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bearable-settings', JSON.stringify(newSettings));
  };

  const updateSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
  };

  const addAIService = (service: AIServiceConfig) => {
    const newSettings = {
      ...settings,
      aiServices: {
        ...settings.aiServices,
        [service.id]: service,
      },
      defaultAIService:
        Object.keys(settings.aiServices).length === 0 ? service.id : settings.defaultAIService,
    };
    saveSettings(newSettings);
  };

  const removeAIService = (serviceId: AIService) => {
    const { [serviceId]: removed, ...newServices } = settings.aiServices;
    const remainingServices = Object.keys(newServices) as AIService[];
    const newSettings: AppSettings = {
      ...settings,
      aiServices: newServices as Record<AIService, AIServiceConfig>,
      defaultAIService:
        settings.defaultAIService === serviceId
          ? remainingServices.length > 0
            ? remainingServices[0]
            : undefined
          : settings.defaultAIService,
    };
    saveSettings(newSettings);
  };

  const updateAIService = (serviceId: AIService, updates: Partial<AIServiceConfig>) => {
    const newSettings = {
      ...settings,
      aiServices: {
        ...settings.aiServices,
        [serviceId]: {
          ...settings.aiServices[serviceId],
          ...updates,
        },
      },
    };
    saveSettings(newSettings);
  };

  const getAIService = (serviceId: AIService): AIServiceConfig | undefined => {
    return settings.aiServices[serviceId];
  };

  // Check if AI is configured:
  // - User has entered their own API keys, OR
  // - We're in production (platform keys available on backend)
  const hasUserKeys =
    Object.keys(settings.aiServices).length > 0 &&
    Object.values(settings.aiServices).some(service => service.apiKey.trim().length > 0);

  // Assume platform keys are configured in production
  const hasPlatformKeys =
    process.env.NODE_ENV === 'production' || process.env.REACT_APP_USE_PLATFORM_KEYS === 'true';

  const isConfigured = hasUserKeys || hasPlatformKeys;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        addAIService,
        removeAIService,
        updateAIService,
        getAIService,
        isConfigured,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
