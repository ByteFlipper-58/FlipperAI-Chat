import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Plus, Settings, History, X, ArrowRight, Copy, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { getGeminiResponse } from '../services/geminiAPI';
import { useTelegram } from '../hooks/useTelegram';
import { MessageContent } from './MessageContent';
import { SettingsPanel } from './SettingsPanel';
import { useTheme } from '../hooks/useTheme';

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { messages, addMessage, clearMessages, dialogHistory, saveDialog, deleteDialog, clearDialogHistory, startNewDialog } = useChatStore();
  const { tg } = useTelegram();
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypingMessage]);

  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    let currentText = '';
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + ' ';
      setCurrentTypingMessage(currentText);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsTyping(false);
    setCurrentTypingMessage('');
    addMessage({
      text,
      sender: 'bot',
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    addMessage({
      text: userMessage,
      sender: 'user',
    });

    setIsLoading(true);
    try {
      const response = await getGeminiResponse(userMessage);
      await simulateTyping(response);
    } catch (error) {
      addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDialog = () => {
    if (messages.length > 0) {
      saveDialog(messages);
      startNewDialog();
    }
  };

  const handleLoadDialog = (dialogId: string) => {
    const dialog = dialogHistory.find(d => d.id === dialogId);
    if (dialog) {
      clearMessages();
      dialog.messages.forEach(msg => addMessage(msg));
      setShowHistory(false);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex flex-col h-screen ${theme}`} style={{
      backgroundColor: theme === 'light' ? '#f8f9fa' : 'var(--tg-theme-bg-color)',
      color: theme === 'light' ? '#1a1a1a' : 'var(--tg-theme-text-color)'
    }}>
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 transform hover:scale-105"
            aria-label={t('clearContext')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleNewDialog}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 transform hover:scale-105"
            aria-label={t('newDialog')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 transform hover:scale-105"
            aria-label={t('history')}
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 transform hover:scale-105"
            aria-label={t('settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200">
          <div 
            className="absolute right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-out shadow-xl"
            style={{ 
              backgroundColor: theme === 'light' ? '#ffffff' : 'var(--tg-theme-bg-color)'
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t('history')}</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {dialogHistory.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {dialogHistory.map((dialog) => (
                      <div
                        key={dialog.id}
                        className="p-4 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                        style={{ 
                          backgroundColor: theme === 'light' ? '#f8f9fa' : 'var(--tg-theme-secondary-bg-color)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm opacity-70">
                            {new Date(dialog.timestamp).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDialog(dialog.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div
                          className="text-sm line-clamp-2 cursor-pointer"
                          onClick={() => handleLoadDialog(dialog.id)}
                        >
                          {dialog.messages[0]?.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={clearDialogHistory}
                    className="mt-4 w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors duration-200"
                  >
                    {t('clearHistory')}
                  </button>
                </>
              ) : (
                <p className="text-center opacity-70">{t('noHistory')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-[70%] mx-auto space-y-6 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`group relative max-w-[90%] ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-lg'
                    : ''
                }`}
              >
                <div className={`p-4 ${message.sender === 'bot' ? 'pr-12' : ''}`}>
                  <MessageContent 
                    content={message.text} 
                    isUser={message.sender === 'user'} 
                  />
                </div>
                {message.sender === 'bot' && (
                  <button
                    onClick={() => handleCopyMessage(message.text)}
                    className="absolute right-2 top-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Copy message"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="max-w-[90%] p-4">
                <MessageContent 
                  content={currentTypingMessage} 
                  isUser={false} 
                />
              </div>
            </div>
          )}
          {isLoading && !isTyping && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="max-w-[90%] p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-[70%] mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              className="w-full pl-4 pr-16 py-4 rounded-full transition-all duration-200 shadow-lg"
              style={{
                backgroundColor: theme === 'light' ? '#f1f3f5' : 'var(--tg-theme-secondary-bg-color)',
                color: theme === 'light' ? '#1a1a1a' : 'var(--tg-theme-text-color)',
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: theme === 'light' ? '#228be6' : 'var(--tg-theme-button-color)',
                color: '#ffffff',
              }}
              disabled={isLoading || !input.trim()}
              aria-label={t('send')}
            >
              {input.trim() ? (
                <Send className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};