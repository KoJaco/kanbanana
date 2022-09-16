import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';

import clsx from 'clsx';
import { BsCloudsFill } from 'react-icons/bs';
import { MdMenuOpen, MdClose } from 'react-icons/md';
import Link from 'next/link';

import { useRouter } from 'next/router';
import {
    IoList,
    IoColorPaletteOutline,
    IoCreateOutline,
} from 'react-icons/io5';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { SiKibana } from 'react-icons/si';

import ThemeSettings from '@/components/menus/ThemeSettings';
import BaseModal from '@/components/modals/BaseModal';
import CreateBoardForm from '@/components/kanban/CreateBoardForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useUIContext } from '@/stores/UIContextProvider';
import { useKanbanStore } from '@/stores/KanbanStore';

const BoardMenu = dynamic(() => import('@/components/menus/BoardMenu'), {
    ssr: false,
});

type SidebarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    // const [sidebarOpen, setSidebarOpen] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);

    // const { activeMenu, setActiveMenu, screenSize, currentColor } =
    //     useUIContext();

    // function handleCloseSidebar() {
    //     if (activeMenu && screenSize != undefined && screenSize <= 900) {
    //         setActiveMenu(false);
    //     }
    // }

    function handleOpenModal() {
        setSidebarOpen(false);
        setModalOpen(true);
    }
    return (
        <>
            <BaseModal open={modalOpen} setOpen={setModalOpen}>
                <CreateBoardForm setOpen={setModalOpen} />
            </BaseModal>
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
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-primary-bg pt-5 pb-4">
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
                                        <div className="cursor-pointer items-center gap-3 flex text-xl font-medium tracking-tight dark:text-white text-gray-100">
                                            <SiKibana />
                                            <span className="ml-1">
                                                Kan-banana
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                                    <nav className="space-y-10 px-2">
                                        <div>
                                            {/* New Board Button */}
                                            <button
                                                className="text-indigo-100 hover:bg-primary-bg-darker
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md my-6 w-full"
                                                onClick={handleOpenModal}
                                            >
                                                <span className="h-full text-gray-400 group-hover:text-slate-900">
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
                                        <div>
                                            <Link href="/" passHref={true}>
                                                <a
                                                    className="text-indigo-100 hover:bg-primary-bg-darker
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer"
                                                >
                                                    <span className="h-full text-gray-400 cursor-pointer">
                                                        <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 " />
                                                    </span>
                                                    <p className=" text-indigo-100 font-regular uppercase cursor-pointer">
                                                        Boards
                                                    </p>
                                                </a>
                                            </Link>

                                            <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                                {/* Dynamic component, client-side only */}
                                                <BoardMenu />
                                            </div>
                                        </div>

                                        <div className="flex ml-2">
                                            <span className="h-full text-indigo-100 mr-4">
                                                <IoColorPaletteOutline className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                                            </span>
                                            <p className="text-indigo-100 mr-4 font-regular uppercase">
                                                Theme and Settings
                                            </p>
                                            <div>
                                                <ThemeSettings />
                                            </div>
                                        </div>
                                        {/* <div>
                                    <ThemeSettings />
                                </div> */}
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="w-14 flex-shrink-0" aria-hidden="true">
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
                            <div className="cursor-pointer items-center gap-3 mt-4 flex text-xl font-medium tracking-tight dark:text-white text-gray-50">
                                <SiKibana className="text-offset" />
                                <span className="ml-1">Kan-banana</span>
                            </div>
                        </Link>
                    </div>
                    <div className="mt-5 flex flex-1 flex-col">
                        <nav className="space-y-10 px-2">
                            <div>
                                {/* New Board Button */}
                                <button
                                    className="text-indigo-100 hover:bg-primary-bg-darker hover:text-slate-600
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md mt-6 w-full"
                                    onClick={handleOpenModal}
                                >
                                    <span className="h-full">
                                        <IoCreateOutline
                                            className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <p className=" text-indigo-100 font-regular uppercase cursor-pointer ">
                                        New Board
                                    </p>
                                </button>
                            </div>
                            <div>
                                <a
                                    className="text-indigo-100 hover:bg-primary-bg-darker
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                >
                                    <span className="h-full ">
                                        <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 " />
                                    </span>
                                    <p className=" text-indigo-100 font-regular uppercase cursor-pointer ">
                                        Boards
                                    </p>
                                </a>
                                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                    {/* Dynamic component, client-side only */}
                                    <BoardMenu />
                                </div>
                            </div>

                            <div className="flex ml-2">
                                <span className="h-full text-indigo-100 mr-4">
                                    <IoColorPaletteOutline className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                                </span>
                                <p className="text-indigo-100 mr-4 font-regular uppercase">
                                    Theme and Settings
                                </p>
                            </div>
                            <div>
                                <ThemeSettings />
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
