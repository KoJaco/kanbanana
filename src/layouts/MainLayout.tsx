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

const Sidebar = dynamic(() => import('@/components/navigation/Sidebar'), {
    ssr: false,
});
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
                {/* <Modal open={modalOpen} setOpen={setModalOpen}>
                    <CreateBoardForm setOpen={setModalOpen} />
                </Modal> */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Sidebar Ends */}
                <div className="flex flex-1 flex-col md:pl-64">
                    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                        <button
                            type="button"
                            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MdMenuOpen
                                className="h-6 w-6"
                                aria-hidden="true"
                            />
                        </button>
                        <div className="flex flex-1 justify-between px-4">
                            <div className="flex flex-1">
                                <form
                                    className="flex w-full md:ml-0"
                                    action="#"
                                    method="GET"
                                >
                                    <label
                                        htmlFor="search-field"
                                        className="sr-only"
                                    >
                                        Search
                                    </label>
                                    {/* <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                                            <BsCloudsFill
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <input
                                            id="search-field"
                                            className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                                            placeholder="Search"
                                            type="search"
                                            name="search"
                                        />
                                    </div> */}
                                </form>
                            </div>
                            <div className="ml-4 flex items-center md:ml-6">
                                <button
                                    type="button"
                                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:drop-shadow-sm transition-shadow duration-300"
                                >
                                    <span className="px-1">
                                        Why the bananas?
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

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
