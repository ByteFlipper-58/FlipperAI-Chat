import React from 'react';
import { Chat } from './components/Chat';
import { useTelegram } from './hooks/useTelegram';
import './i18n';

function App() {
  const { user } = useTelegram();

  return (
    <div className="h-screen bg-gray-100">
      <Chat />
    </div>
  );
}

export default App;