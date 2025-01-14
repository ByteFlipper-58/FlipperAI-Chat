import { useEffect, useCallback } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const useTelegram = () => {
  const tg = window.Telegram.WebApp;

  useEffect(() => {
    tg.ready();
    tg.expand();
  }, []);

  const onClose = useCallback(() => {
    tg.close();
  }, []);

  const showPopup = useCallback((message: string) => {
    // Check if showPopup is supported, otherwise use alert
    if (tg.isVersionAtLeast('6.1')) {
      tg.showPopup({
        message,
      });
    } else {
      alert(message);
    }
  }, []);

  const user: TelegramUser | undefined = tg.initDataUnsafe?.user;

  // Set theme colors based on Telegram theme
  useEffect(() => {
    if (tg.themeParams) {
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        tg.themeParams.bg_color || '#ffffff'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-text-color',
        tg.themeParams.text_color || '#000000'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-hint-color',
        tg.themeParams.hint_color || '#999999'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-link-color',
        tg.themeParams.link_color || '#2481cc'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-button-color',
        tg.themeParams.button_color || '#2481cc'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-button-text-color',
        tg.themeParams.button_text_color || '#ffffff'
      );
    }
  }, [tg.themeParams]);

  return {
    tg,
    user,
    onClose,
    showPopup,
  };
};