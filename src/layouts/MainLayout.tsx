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
// import Modal from '@/components/modal/Modal';
// import CreateBoardForm from '@/components/kanbanBoard/CreateBoardForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useUIContext } from '@/stores/UIContextProvider';
import { useKanbanStore } from '@/stores/KanbanStore';

// const BoardMenu = dynamic(() => import('@/components/boardMenu/BoardMenu'), {
//     ssr: false,
// });
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
                {/* Mobile Sidebar starts, boards menu can be a separate component dynamically imported */}
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-40 md:hidden"
                        onClose={setSidebarOpen}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-400 bg-opacity-75" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-40 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700 pt-5 pb-4">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                                            <button
                                                type="button"
                                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white text-gray-50"
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                            >
                                                <MdClose className="w-7 h-7" />
                                                <span className="sr-only">
                                                    Close sidebar
                                                </span>
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    <div className="flex flex-shrink-0 items-center px-4">
                                        <Link href="/">
                                            <div
                                                className="cursor-pointer items-center gap-3 flex text-xl font-medium tracking-tight dark:text-white text-gray-100"
                                                onClick={() =>
                                                    handleCloseSidebar
                                                }
                                            >
                                                <SiKibana />
                                                <span>Kan-banana</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="mt-5 h-0 flex-1 overflow-y-auto">
                                        <nav className="space-y-10 px-2">
                                            <div>
                                                {/* New Board Button */}
                                                <button
                                                    className="text-indigo-100 hover:bg-indigo-600
                                                        group flex items-center px-2 py-2 text-base font-medium rounded-md my-6 w-full"
                                                    onClick={handleOpenModal}
                                                >
                                                    <span className="h-full text-gray-400 group-hover:text-gray-800">
                                                        <IoCreateOutline
                                                            className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <p className=" text-indigo-100 font-regular uppercase cursor-pointer">
                                                        New Board
                                                    </p>
                                                </button>
                                            </div>
                                            {/* Boards menu */}
                                            <a
                                                className="text-indigo-100 hover:bg-indigo-600
                                                        group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                            >
                                                <span className="h-full text-gray-400">
                                                    <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300" />
                                                </span>
                                                <p className=" text-indigo-100 font-regular uppercase cursor-pointer">
                                                    Boards
                                                </p>
                                            </a>
                                            <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                                {/* <BoardMenu /> */}
                                            </div>
                                            {/* Theme settings */}

                                            <div className="flex ml-2">
                                                <span className="h-full text-indigo-100 mr-4">
                                                    <IoColorPaletteOutline className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                                                </span>
                                                <p className="text-indigo-100 mr-4 font-regular uppercase">
                                                    Theme and Settings
                                                </p>
                                            </div>
                                            {/* <div>
                                                <ThemeSettings />
                                            </div> */}
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                            <div
                                className="w-14 flex-shrink-0"
                                aria-hidden="true"
                            >
                                {/* Dummy element to force sidebar to shrink to fit close icon */}
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-grow flex-col overflow-y-auto bg-primary-bg pt-5">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <Link href="/">
                                <div
                                    className="cursor-pointer items-center gap-3 mt-4 flex text-xl font-medium tracking-tight dark:text-white text-gray-50"
                                    onClick={() => handleCloseSidebar}
                                >
                                    <SiKibana />
                                    <span>Kan-banana</span>
                                </div>
                            </Link>
                        </div>
                        <div className="mt-5 flex flex-1 flex-col">
                            <nav className="space-y-10 px-2">
                                <div>
                                    {/* New Board Button */}
                                    <button
                                        className="text-indigo-100 hover:bg-offset-bg hover:text-slate-600
                                                        group flex items-center px-2 py-2 text-base font-medium rounded-md mt-6 w-full"
                                        onClick={handleOpenModal}
                                    >
                                        <span className="h-full text-gray-400 group-hover:text-slate-600">
                                            <IoCreateOutline
                                                className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 group-hover:text-slate-600"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <p className=" text-indigo-100 font-regular uppercase cursor-pointer group-hover:text-slate-600">
                                            New Board
                                        </p>
                                    </button>
                                </div>
                                {/* Boards menu */}
                                <a
                                    className="text-indigo-100 hover:bg-offset-bg
                                                        group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                >
                                    <span className="h-full text-gray-400">
                                        <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 group-hover:text-slate-600" />
                                    </span>
                                    <p className=" text-indigo-100 font-regular uppercase cursor-pointer group-hover:text-slate-600">
                                        Boards
                                    </p>
                                </a>
                                {/* <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                                <ol>
                                                    {boards?.map(
                                                        (board, index) => (
                                                            <li key={index}>
 
                                                                <Link
                                                                    href={{
                                                                        pathname: `/boards/[slug]`,
                                                                        query: {
                                                                            slug: encodeURIComponent(
                                                                                board.slug
                                                                            ),
                                                                        },
                                                                    }}
                                                                    passHref={
                                                                        true
                                                                    }
                                                                    key={index}
                                                                >
                                                                    <a
                                                                        // Hydration error with null value
                                                                        style={{
                                                                            backgroundColor:
                                                                                currentRoute ===
                                                                                `/boards/${board.slug}`
                                                                                    ? currentColor
                                                                                    : '',
                                                                        }}
                                                                        className={
                                                                            currentRoute ===
                                                                            `/boards/${board.slug}`
                                                                                ? 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md m-2 text-gray-50 drop-shadow-md'
                                                                                : 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 bg-transparent dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2'
                                                                            //   `bg-[${currentColor.toLowerCase()}]`
                                                                        }
                                                                        onClick={
                                                                            handleCloseSidebar
                                                                        }
                                                                    >
                                                                        <div className="flex justify-between items-end">
                                                                            <span className="capitalize">
                                                                                {
                                                                                    board.title
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </a>
                                                                </Link>
                                                            </li>
                                                        )
                                                    )}
                                                </ol>
                                            </div> */}
                                {/* Theme settings */}

                                <div className="flex ml-2">
                                    <span className="h-full text-indigo-100 mr-4">
                                        <IoColorPaletteOutline className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                                    </span>
                                    <p className="text-indigo-100 mr-4 font-regular uppercase">
                                        Theme and Settings
                                    </p>
                                </div>
                                <div>{/* <ThemeSettings /> */}</div>
                            </nav>
                        </div>
                    </div>
                </div>
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
                                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span>Why the bananas?</span>
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
