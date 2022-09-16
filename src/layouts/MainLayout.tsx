import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';

import clsx from 'clsx';
import { BsCloudsFill } from 'react-icons/bs';
import { MdMenuOpen, MdClose } from 'react-icons/md';
import Link from 'next/link';

import { useRouter } from 'next/router';
import { BsKanban } from 'react-icons/bs';
import {
    IoList,
    IoColorPaletteOutline,
    IoCreateOutline,
} from 'react-icons/io5';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { SiKibana } from 'react-icons/si';

// import ThemeSettings from '@/components/themeSettings/ThemeSettings';
import BaseModal from '@/components/modals/BaseModal';
// import CreateBoardForm from '@/components/kanbanBoard/CreateBoardForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useUIContext } from '@/stores/UIContextProvider';
import { useKanbanStore } from '@/stores/KanbanStore';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';

const navigation = [
    { name: 'New Board', href: '#', icon: IoCreateOutline, current: true },
    { name: 'Boards', href: '#', icon: BsKanban, current: false },
    {
        name: 'Theme and Settings',
        href: '#',
        icon: IoColorPaletteOutline,
        current: false,
    },
];
const userNavigation = [
    { name: 'Your Profile', href: '#' },
    { name: 'Settings', href: '#' },
    { name: 'Sign out', href: '#' },
];

type MainLayoutProps = {
    children: JSX.Element;
};

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);

    const { activeMenu, setActiveMenu, screenSize, currentColor } =
        useUIContext();

    function handleCloseSidebar() {
        if (activeMenu && screenSize != undefined && screenSize <= 900) {
            setActiveMenu(false);
        }
    }

    function handleOpenModal() {
        setSidebarOpen(false);
        setModalOpen(true);
    }

    return (
        <>
            {/* Main Layout */}
            <div>
                {/* Sidebar, static on desktop, responsive/closed on mobile */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex flex-1 flex-col md:pl-64">
                    {/* Navbar */}
                    <Navbar setSidebarOpen={setSidebarOpen} />

                    <main>
                        <div className="py-6">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Board Title
                                </h1>
                            </div>
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                content
                                {children}
                                {/* /End replace */}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
