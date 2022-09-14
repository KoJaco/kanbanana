// UI Context and Provider, for theming, sidebar, etc.

import React, { createContext, useContext, useState } from 'react';

type UIContextType = {
    activeMenu: boolean;
    setActiveMenu: (isActive: boolean) => void;
    screenSize: undefined | number;
    setScreenSize: (screenSize: undefined | number) => void;
    currentColor: string;
    setColor: (color: string) => void;
    setCurrentColor: (color: string) => void;
    currentMode: string;
    setMode: (e: React.FormEvent<HTMLInputElement>) => void;
    setCurrentMode: (mode: string) => void;
    themeSettingsOpen: boolean;
    setThemeSettingsOpen: (themeSettingsOpen: boolean) => void;
};

const UIContextDefaultValues: UIContextType = {
    activeMenu: false,
    setActiveMenu: (activeMenu) => {},
    screenSize: undefined,
    setScreenSize: (screenSize) => {},
    currentColor: '#03C9D7',
    setCurrentColor: (color) => {},
    setColor: (color) => {},
    currentMode: 'light',
    setMode: (e) => {},
    setCurrentMode: (mode) => {},
    themeSettingsOpen: false,
    setThemeSettingsOpen: (themeSettingsOpen) => {},
};

const UIContext = createContext<UIContextType>(UIContextDefaultValues);

type ContextProps = {
    children: React.ReactNode;
};

export function UIContextProvider(props: ContextProps) {
    const [activeMenu, setActiveMenu] = useState<boolean>(true);
    const [screenSize, setScreenSize] = useState<undefined | number>(undefined);
    const [currentColor, setCurrentColor] = useState<string>('#BD1E51');
    const [currentMode, setCurrentMode] = useState<string>('light');
    const [themeSettingsOpen, setThemeSettingsOpen] = useState<boolean>(false);

    // Event after input element clicked or toggled, use currentTarget for form event
    const setMode = (e: React.FormEvent<HTMLInputElement>) => {
        // catch null case, reset mode to default
        e.target === null
            ? setCurrentMode('light')
            : setCurrentMode(e.currentTarget.value);

        const isSSR = typeof window !== 'undefined' ? true : false;

        if (!isSSR) {
            // use local storage to store mode
            localStorage.setItem('themeMode', e.currentTarget.value);
        }
        setThemeSettingsOpen(false);
    };

    const setColor = (color: string) => {
        color === null ? setCurrentColor('#BD1E51') : setCurrentColor(color);

        const isSSR = typeof window !== 'undefined' ? true : false;
        if (!isSSR) {
            // use local storage to store mode
            localStorage.setItem('colorMode', color);
        }
        // close theme settings after choosing theme color
        setThemeSettingsOpen(false);
    };

    const value = {
        activeMenu,
        setActiveMenu,
        screenSize,
        setScreenSize,
        currentColor,
        setCurrentColor,
        currentMode,
        setCurrentMode,
        setMode,
        setColor,
        themeSettingsOpen,
        setThemeSettingsOpen,
    };
    return (
        <>
            <UIContext.Provider value={value}>
                {props.children}
            </UIContext.Provider>
        </>
    );
}

export const useUIContext = () => useContext(UIContext);
