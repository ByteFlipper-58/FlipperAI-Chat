import React, { useState } from 'react';
import { Send, Trash2, Plus, Settings, History, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { getGeminiResponse } from '../services/geminiAPI';
import { useTelegram } from '../hooks/useTelegram';

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useTranslation();
  const { messages, addMessage, clearMessages, dialogHistory, saveDialog, deleteDialog, clearDialogHistory } = useChatStore();
  const { user, showPopup } = useTelegram();

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
      addMessage({
        text: response,
        sender: 'bot',
      });
    } catch (error) {
      addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
      });
      showPopup('Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDialog = () => {
    if (messages.length > 0) {
      saveDialog(messages);
      showPopup('Dialog saved successfully');
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

  return (
    <div className="flex flex-col h-screen" style={{
      backgroundColor: 'var(--tg-theme-bg-color)',
      color: 'var(--tg-theme-text-color)'
    }}>
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm shadow">
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={t('clearContext')}
          >
            <Trash2 className="w-5 h-5" style={{ color: 'var(--tg-theme-text-color)' }} />
          </button>
          <button
            onClick={handleSaveDialog}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={t('saveDialog')}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--tg-theme-text-color)' }} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={t('history')}
          >
            <History className="w-5 h-5" style={{ color: 'var(--tg-theme-text-color)' }} />
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={t('settings')}
          >
            <Settings className="w-5 h-5" style={{ color: 'var(--tg-theme-text-color)' }} />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="absolute right-0 top-16 w-64 bg-white/95 dark:bg-gray-800/95 shadow-lg rounded-l-lg max-h-[80vh] overflow-y-auto z-50"
             style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t('history')}</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {dialogHistory.length > 0 ? (
              <>
                <div className="space-y-2">
                  {dialogHistory.map((dialog) => (
                    <div
                      key={dialog.id}
                      className="p-2 rounded hover:bg-white/10 cursor-pointer flex justify-between items-center"
                      onClick={() => handleLoadDialog(dialog.id)}
                    >
                      <span className="truncate">
                        {dialog.messages[0]?.text.substring(0, 30)}...
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDialog(dialog.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={clearDialogHistory}
                  className="mt-4 w-full p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                >
                  {t('clearHistory')}
                </button>
              </>
            ) : (
              <p className="text-center text-gray-500">{t('noHistory')}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-button'
                  : 'bg-white/10'
              }`}
              style={{
                backgroundColor: message.sender === 'user' 
                  ? 'var(--tg-theme-button-color)' 
                  : 'var(--tg-theme-secondary-bg-color)',
                color: message.sender === 'user'
                  ? 'var(--tg-theme-button-text-color)'
                  : 'var(--tg-theme-text-color)'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white/10">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 p-2 rounded-lg bg-white/10 border-0 focus:ring-2 focus:ring-opacity-50"
            style={{
              color: 'var(--tg-theme-text-color)',
              borderColor: 'var(--tg-theme-button-color)',
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--tg-theme-button-color)',
              color: 'var(--tg-theme-button-text-color)'
            }}
            disabled={isLoading}
            aria-label={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};