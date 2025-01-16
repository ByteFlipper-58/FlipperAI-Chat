import React from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200">
      <div 
        className="absolute right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-out shadow-xl"
        style={{ 
          backgroundColor: theme === 'light' ? '#ffffff' : 'var(--tg-theme-bg-color)'
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">{t('settings')}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">{t('theme')}</h4>
              <button
                onClick={toggleTheme}
                className="w-full p-3 rounded-lg flex items-center justify-between transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-white/5"
                style={{ 
                  backgroundColor: theme === 'light' ? '#f8f9fa' : 'var(--tg-theme-secondary-bg-color)'
                }}
              >
                <span>{theme === 'light' ? t('lightTheme') : t('darkTheme')}</span>
                {theme === 'light' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t('language')}</h4>
              <div className="space-y-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                    i18n.language === 'en' 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('ru')}
                  className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                    i18n.language === 'ru' 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  Русский
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};