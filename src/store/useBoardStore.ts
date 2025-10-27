import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BoardState {
  boardTitle: string;
  updateBoardTitle: (newTitle: string) => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      boardTitle: 'Demo Board',
      hasHydrated: false,

      updateBoardTitle: (newTitle: string) => {
        set({ boardTitle: newTitle });
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'trello-board-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
