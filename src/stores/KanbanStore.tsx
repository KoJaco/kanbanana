import create from 'zustand';

// *** Store is simply for keeping track of import values relating to server-client state, use Dexie to maintain pseudo server-client board state.

export type State = {
    // global notification state, use in base layout.
    showNotification: boolean;
    notification: { status: string; message: string };

    // global board count, used in sidebar for displaying board list info.
    boardCount: number | undefined;
    // local state for a board detail page.
    // counts
    columnCount: number;
    taskCount: number;
    // current board info tracking
    currentBoardSlug: string;
    currentTaskSlug: string;
    currentColumnSlug: string;
    currentColumnId: string;
    // keep track of how the highest task id, used in creating a new task to avoid conflicts in task deletion.
    maxTaskId: number;
    currentTaskId: string;

    setShowNotification: (show: boolean) => void;

    toggleShowNotification: () => void;

    setNotification: (status: string, message: string) => void;

    setBoardCount: (count: number) => void;

    increaseBoardCount: () => void;
    decreaseBoardCount: () => void;
    setColumnCount: (count: number) => void;
    setTaskCount: (count: number) => void;
    resetCounts: () => void;

    increaseColumnCount: () => void;
    decreaseColumnCount: () => void;
    increaseTaskCount: () => void;
    decreaseTaskCount: () => void;

    increaseMaxTaskId: () => void;

    // current task/col/board
    setCurrentBoardSlug: (slug: string) => void;
    setCurrentColumnSlug: (slug: string) => void;
    setCurrentTaskSlug: (slug: string) => void;
    setCurrentColumnId: (columnId: string) => void;
    setMaxTaskId: (maxTaskId: number) => void;
    setCurrentTaskId: (taskId: string) => void;
};

export const useKanbanStore = create<State>((set) => ({
    // init notification state, show.false notification.empty
    showNotification: false,
    notification: { status: '', message: '' },
    // on board creation there should always be 1 column and 1 task
    // deleting this last task/column is not allowed, however, a user can delete their last board.
    boardCount: undefined,
    columnCount: 0,
    taskCount: 0,
    // must be set!
    currentBoardSlug: '',
    currentColumnSlug: '',
    currentTaskSlug: '',
    currentColumnId: 'column-1',
    maxTaskId: 1,
    currentTaskId: 'task-1',

    setShowNotification: (show: boolean) => {
        set(() => ({ showNotification: show }));
    },

    toggleShowNotification: () =>
        set((state) => ({ showNotification: !state.showNotification })),

    setNotification: (status: string, message: string) => {
        set(() => ({ notification: { status: status, message: message } }));
    },

    setBoardCount: (count: number) => {
        set(() => ({ boardCount: count }));
    },
    increaseBoardCount: () =>
        set((state) => ({
            boardCount:
                state.boardCount !== undefined ? state.boardCount + 1 : 1,
        })),
    decreaseBoardCount: () =>
        set((state) => ({
            boardCount:
                state.boardCount !== undefined
                    ? state.boardCount - 1
                    : state.boardCount,
        })),
    setColumnCount: (count: number) => {
        set(() => ({ columnCount: count }));
    },
    setTaskCount: (count: number) => {
        set(() => ({ taskCount: count }));
    },
    resetCounts: () => set({ columnCount: 1, taskCount: 1 }),

    increaseColumnCount: () =>
        set((state) => ({ columnCount: state.columnCount + 1 })),
    decreaseColumnCount: () =>
        set((state) => ({ columnCount: state.columnCount - 1 })),
    increaseTaskCount: () =>
        set((state) => ({ taskCount: state.taskCount + 1 })),
    decreaseTaskCount: () =>
        set((state) => ({ taskCount: state.taskCount - 1 })),

    increaseMaxTaskId: () =>
        set((state) => ({ maxTaskId: state.maxTaskId + 1 })),

    // current task/col/board
    setCurrentBoardSlug: (slug: string) =>
        set(() => ({ currentBoardSlug: slug })),
    setCurrentColumnSlug: (slug: string) =>
        set(() => ({ currentColumnSlug: slug })),
    setCurrentTaskSlug: (slug: string) =>
        set(() => ({ currentTaskSlug: slug })),
    setCurrentColumnId: (columnId: string) =>
        set(() => ({ currentColumnId: columnId })),
    setMaxTaskId: (maxTaskId: number) => set(() => ({ maxTaskId: maxTaskId })),
    setCurrentTaskId: (taskId: string) =>
        set(() => ({ currentTaskId: taskId })),
}));