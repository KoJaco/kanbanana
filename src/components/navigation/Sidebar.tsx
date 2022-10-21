import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { IoCreateOutline } from 'react-icons/io5';
import { SiKibana } from 'react-icons/si';

import CreateBoardForm from '@/components/forms/CreateBoardForm';
import { useRouter } from 'next/router';
import { useUIControlStore } from '@/stores/UIControlStore';

const BoardMenu = dynamic(() => import('@/components/menus/BoardMenu'), {
    ssr: false,
});

type SidebarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const [showCreateBoardForm, setShowCreateBoardForm] = useState(false);

    const { screenSize, currentColor } = useUIControlStore();

    const router = useRouter();
    const currentRoute = router.asPath;

    function handleShowCreateBoardForm() {
        setShowCreateBoardForm(true);
    }

    return (
        <>
            <CreateBoardForm
                showBoardForm={showCreateBoardForm}
                setShowBoardForm={setShowCreateBoardForm}
            />
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
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-primary to-primary-dark-alt  pt-5 pb-4">
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
                                        <div className="cursor-pointer items-center gap-3 flex text-xl font-medium tracking-tight text-gray-100">
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
                                             flex items-center px-2 py-2 text-base font-medium rounded-md my-6 w-full"
                                                onClick={
                                                    handleShowCreateBoardForm
                                                }
                                            >
                                                <span className="h-full text-gray-400">
                                                    <IoCreateOutline
                                                        className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <p className="text-indigo-100 font-regular uppercase cursor-pointer">
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
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex flex-grow flex-col overflow-y-auto bg-gradient-to-b from-primary to-primary-dark-alt pt-5">
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
                                    className="text-indigo-100 hover:bg-primary-bg-darker hover:text-slate-600 group flex items-center px-2 py-2 text-base font-medium rounded-md mt-6 w-full"
                                    onClick={handleShowCreateBoardForm}
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

                            <BoardMenu />

                            {/* <div className="">
                                <div
                                    className="text-indigo-100 
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                >
                                    <span className="h-full ">
                                        <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 " />
                                    </span>
                                    <p className=" text-indigo-100 font-regular uppercase">
                                        Boards
                                    </p>
                                </div>
                                <div className="py-2 border-b border-indigo-500 text-indigo-200">
                                    <Link
                                        href={{
                                            pathname: '/boards',
                                        }}
                                        passHref={true}
                                    >
                                        <a
                                            style={{
                                                backgroundColor:
                                                    currentRoute === '/boards'
                                                        ? currentColor
                                                        : '',
                                            }}
                                            className={
                                                currentRoute === '/boards'
                                                    ? 'flex items-center gap-5 py-2 px-3 rounded-lg text-md text-indigo-200 drop-shadow-md mt-2 font-light'
                                                    : 'flex items-center gap-5 py-2 px-3 mt-2 rounded-lg text-md text-indigo-200 font-light hover:bg-primary-bg-darker'
                                            }
                                            // onClick={handleCloseSidebar}
                                        >
                                            <div className="flex justify-between items-end">
                                                <span className="capitalize">
                                                    All Boards
                                                </span>
                                            </div>
                                        </a>
                                    </Link>
                                </div>

                                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                    <BoardMenu />
                                </div>
                            </div>
                            <div>
                                <div
                                    className="text-indigo-100 
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                >
                                    <span className="h-full text-indigo-100 mr-4">
                                        <HiOutlineTag className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                                    </span>
                                    <p className="text-indigo-100 font-regular uppercase">
                                        Tags
                                    </p>
                                </div>
                                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                                    <TagMenu />
                                </div>
                            </div> */}
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
                </div>
            </div>
        </>
    );
};

export default Sidebar;
