import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface Dialog {
  id: string;
  messages: Message[];
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  dialogHistory: Dialog[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  saveDialog: (messages: Message[]) => void;
  deleteDialog: (dialogId: string) => void;
  clearDialogHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      dialogHistory: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Math.random().toString(36).substring(7),
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      saveDialog: (messages) =>
        set((state) => ({
          dialogHistory: [
            {
              id: Math.random().toString(36).substring(7),
              messages,
              timestamp: Date.now(),
            },
            ...state.dialogHistory,
          ],
        })),
      deleteDialog: (dialogId) =>
        set((state) => ({
          dialogHistory: state.dialogHistory.filter((dialog) => dialog.id !== dialogId),
        })),
      clearDialogHistory: () => set({ dialogHistory: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);