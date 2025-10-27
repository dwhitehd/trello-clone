import { ColumnType } from '@/types/store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BoardState {
  boardTitle: string;
  updateBoardTitle: (newTitle: string) => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  columns: ColumnType[];
  addCard: (columnId: number, title: string) => void;
  moveCard: (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => void;
  addColumn: (title: string) => void;
  deleteColumn: (columnId: number) => void;
  updateColumnTitle: (columnId: number, newTitle: string) => void;
  reorderCardsInColumn: (columnId: number, cardIds: number[]) => void;
  reorderColumns: (columnIds: number[]) => void;
  addComment: (cardId: number, commentText: string) => void;
  updateCardTitle: (cardId: number, newTitle: string) => void;
  updateCardDescription: (cardId: number, description: string) => void;
}

const initialColumns: ColumnType[] = [
  {
    id: 3453453434,
    title: 'Todo',
    items: [
      { id: 123134, title: 'Create interview', comments: [] },
      { id: 12423423434, title: 'Review Drag & Drop', comments: [] },
    ]
  },
  {
    id: 2,
    title: 'In Progress',
    items: [
      { id: 345345243534, title: 'Set up Next.js project', comments: [] },
    ]
  },
  { id: 3, title: 'Done', items: [] }
];

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      boardTitle: 'Demo Board',
      columns: initialColumns,
      hasHydrated: false,

      // Actions
      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      updateBoardTitle: (newTitle: string) => {
        set({ boardTitle: newTitle });
      },

      addCard: (columnId: number, title: string) => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  items: [
                    ...column.items,
                    { id: Date.now(), title, comments: [] }
                  ]
                }
              : column
          )
        }));
      },

      moveCard: (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => {
        set((state) => {
          const fromColumn = state.columns.find((col) => col.id === fromColumnId);
          const cardToMove = fromColumn?.items.find((item) => item.id === cardId);

          if (!cardToMove) return state;

          // Remove card from source column
          const columnsWithoutCard = state.columns.map((column) =>
            column.id === fromColumnId
              ? { ...column, items: column.items.filter((item) => item.id !== cardId) }
              : column
          );

          // Add card to destination column at specified index
          const updatedColumns = columnsWithoutCard.map((column) => {
            if (column.id === toColumnId) {
              const newItems = [...column.items];
              newItems.splice(newIndex, 0, cardToMove);
              return { ...column, items: newItems };
            }
            return column;
          });

          return { columns: updatedColumns };
        });
      },

      reorderCardsInColumn: (columnId: number, cardIds: number[]) => {
        set((state) => ({
          columns: state.columns.map((column) => {
            if (column.id === columnId) {
              // Reorder items based on the cardIds array
              const reorderedItems = cardIds
                .map((cardId) => column.items.find((item) => item.id === cardId))
                .filter((item): item is NonNullable<typeof item> => item !== undefined);

              return { ...column, items: reorderedItems };
            }
            return column;
          })
        }));
      },

      addColumn: (title: string) => {
        set((state) => ({
          columns: [
            ...state.columns,
            { id: Date.now(), title, items: [] }
          ]
        }));
      },

      deleteColumn: (columnId: number) => {
        set((state) => ({
          columns: state.columns.filter((column) => column.id !== columnId)
        }));
      },

      updateColumnTitle: (columnId: number, newTitle: string) => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? { ...column, title: newTitle }
              : column
          )
        }));
      },

      reorderColumns: (columnIds: number[]) => {
        set((state) => {
          // Reorder columns based on the provided columnIds array
          const reorderedColumns = columnIds
            .map((id) => state.columns.find((col) => col.id === id))
            .filter((col): col is ColumnType => col !== undefined);
          return { columns: reorderedColumns };
        });
      },

      addComment: (cardId: number, commentText: string) => {
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            items: column.items.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    comments: [
                      ...card.comments,
                      {
                        id: Date.now().toString(),
                        text: commentText,
                        author: 'User',
                        createdAt: Date.now(),
                      },
                    ],
                  }
                : card
            ),
          })),
        }));
      },

      updateCardTitle: (cardId: number, newTitle: string) => {
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            items: column.items.map((card) =>
              card.id === cardId ? { ...card, title: newTitle } : card
            ),
          })),
        }));
      },

      updateCardDescription: (cardId: number, description: string) => {
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            items: column.items.map((card) =>
              card.id === cardId ? { ...card, description } : card
            ),
          })),
        }));
      }
    }),
    {
      name: 'trello-board-storage',
      version: 2,
       onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
       },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persistedState: any, version: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let state = persistedState as any;

        // Migration for version 0 -> 1: Convert comment objects to arrays
        if (version === 0) {
          state = {
            ...state,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            columns: state.columns.map((column: any) => ({
              ...column,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items: column.items.map((card: any) => ({
                ...card,
                // Convert old object format {} to new array format []
                comments: Array.isArray(card.comments)
                  ? card.comments
                  : [],
              })),
            })),
          };
        }

        // Migration for version 1 -> 2: Add boardTitle if it doesn't exist
        if (version <= 1) {
          state = {
            ...state,
            boardTitle: state.boardTitle || 'Demo Board',
          };
        }

        return state;
      },
    }
  )
);

