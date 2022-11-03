import { Fragment, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { SiKibana } from 'react-icons/si';
import { TbDatabaseExport } from 'react-icons/tb';
import { VscExport } from 'react-icons/vsc';
import { useOnClickOutside } from '@/core/hooks/index';
import CreateBoardForm from '@/components/forms/CreateBoardForm';
import BaseModal from '@/components/modals/BaseModal';

const ImportExport = dynamic(() => import('@/components/files/ImportExport'), {
    ssr: false,
});

const BoardMenu = dynamic(() => import('@/components/menus/BoardMenu'), {
    ssr: false,
});

type SidebarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const [showCreateBoardForm, setShowCreateBoardForm] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const modalContentRef = useRef(null);
    useOnClickOutside(modalContentRef, () => setShowModal(false));

    function handleShowCreateBoardForm() {
        setSidebarOpen(false);
        setShowCreateBoardForm(true);
    }

    return (
        <>
            <BaseModal open={showModal} setOpen={setShowModal}>
                <div
                    id="modalWrapper"
                    className="flex w-full h-full items-center justify-center"
                >
                    <div
                        ref={modalContentRef}
                        className="flex w-3/5 max-w-3/4 max-h-1/2 bg-white dark:bg-slate-900 p-10 rounded-md gap-x-6 shadow-lg"
                    >
                        <ImportExport handleCloseModal={setShowModal} />
                    </div>
                </div>
            </BaseModal>
            <CreateBoardForm
                showBoardForm={showCreateBoardForm}
                setShowBoardForm={setShowCreateBoardForm}
            />
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-400 dark:bg-slate-500/50 bg-opacity-75 z-[150]" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-[170] flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col  pt-5 pb-4 bg-gradient-to-b from-primary to-primary-dark-alt dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900">
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
                                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white text-gray-50 dark:text-slate-50 dark:focus:ring-slate-50"
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
                                        <div className="cursor-pointer items-center gap-3 flex text-xl font-medium tracking-tight text-gray-100 dark:text-slate-50">
                                            <SiKibana className="text-offset" />
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
                                                className="text-indigo-100 hover:bg-primary-bg-darker dark:hover:bg-slate-700 dark:text-slate-50
                                             flex items-center px-2 py-2 text-base font-medium rounded-md my-6 w-full"
                                                onClick={
                                                    handleShowCreateBoardForm
                                                }
                                            >
                                                <span className="h-full text-gray-400">
                                                    <AiOutlineAppstoreAdd
                                                        className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 dark:text-slate-50"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <p className="text-indigo-100 dark:text-slate-50 font-regular uppercase cursor-pointer">
                                                    New Board
                                                </p>
                                            </button>
                                        </div>
                                        <BoardMenu />
                                    </nav>
                                </div>
                                {/* Sidebar Footer Desktop */}

                                <div className="flex flex-shrink-0 bg-transparent py-4 px-2">
                                    <div className="group block w-full flex-shrink-0">
                                        <div className="flex items-center">
                                            <div></div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-indigo-100/[0.8]">
                                                    Database Info
                                                </p>
                                                <div className="flex gap-5 text-xs font-medium text-indigo-200">
                                                    <span className="group-hover:text-gray-50">
                                                        12 boards
                                                    </span>
                                                    <span className="group-hover:text-gray-50">
                                                        1mb / 50gb used
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="w-14 flex-shrink-0" aria-hidden="true">
                            {/* Dummy element to force sidebar to shrink to fit close icon */}
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* DESKTOP: static sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col dark:border-r dark:border-slate-700/[0.5] dark:shadow-slate-800/[0.5] dark:shadow-md">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="pt-5 flex flex-grow flex-col overflow-y-auto bg-gradient-to-b from-primary to-primary-dark-alt dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900">
                    <div className="flex flex-shrink-0 items-center px-4">
                        <Link href="/">
                            <div className="cursor-pointer items-center gap-3 mt-4 flex text-xl font-medium tracking-tight text-gray-50">
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
                                    className="text-indigo-100 hover:bg-primary-bg-darker dark:hover:bg-slate-700 group flex items-center px-2 py-2 text-base font-medium rounded-md mt-6 w-full"
                                    onClick={handleShowCreateBoardForm}
                                >
                                    <span className="h-full">
                                        <AiOutlineAppstoreAdd
                                            className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 dark:text-slate-50"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <p className=" text-indigo-100 dark:text-slate-50 font-regular uppercase cursor-pointer ">
                                        New Board
                                    </p>
                                </button>
                            </div>

                            <BoardMenu />
                        </nav>
                    </div>
                    {/* Sidebar Footer Desktop */}
                    <div className="flex flex-shrink-0 bg-transparent py-4 px-2 group hover:bg-offset-bg transition-color duration-300">
                        <div className="group block w-full flex-shrink-0">
                            <div className="flex items-center py-2">
                                <button
                                    className="mx-3 flex w-full justify-between"
                                    onClick={() => {
                                        setShowModal(!showModal);
                                    }}
                                >
                                    <p className="text-sm font-medium text-indigo-100 dark:text-slate-50 group-hover:text-slate-900 transition-color duration-300">
                                        Database Import/Export
                                    </p>

                                    <TbDatabaseExport className="w-5 h-5 flex gap-5 text-xs font-medium text-indigo-200 dark:text-slate-50 group-hover:text-slate-900 transition-color duration-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
