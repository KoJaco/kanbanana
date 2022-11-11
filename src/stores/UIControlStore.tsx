import create from 'zustand';

// *** Store for allowing users to update UI context with defined inputs.

export type State = {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
};

export const useUIControlStore = create<State>()((set) => ({
    sidebarOpen: false,
    setSidebarOpen: (value) => {
        set(() => ({ sidebarOpen: value }));
    },
}));
