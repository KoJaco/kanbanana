import create from 'zustand';
import { persist } from 'zustand/middleware';

// *** Store for allowing users to update UI context with defined inputs.

export type State = {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
    screenSize: undefined | number;
    setScreenSize: (screenSize: undefined | number) => void;
    currentColor: string;
    setCurrentColor: (color: string) => void;
    currentMode: string;
    setCurrentMode: (e: React.FormEvent<HTMLInputElement>) => void;
};

export const useUIControlStore = create<State>()(
    persist(
        (set, get) => ({
            sidebarOpen: false,
            setSidebarOpen: (value) => {
                set(() => ({ sidebarOpen: value }));
            },
            screenSize: undefined,
            setScreenSize: (screenSize) => {
                set(() => ({ screenSize: screenSize }));
            },
            currentColor: '#00176D',

            setCurrentColor: (color) => {
                set(() => ({
                    currentColor: color === null ? '#00176D' : color,
                }));
            },
            currentMode: 'light',
            setCurrentMode: (event) => {
                set(() => ({
                    currentMode:
                        event.target === null
                            ? 'light'
                            : event.currentTarget.value,
                }));
            },
        }),
        {
            name: 'ui-control-storage',
            getStorage: () => localStorage,
            partialize: (state) => ({
                currentColor: state.currentColor,
                currentMode: state.currentMode,
            }),
        }
    )
);
