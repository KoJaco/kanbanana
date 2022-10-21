import { useUIControlStore } from '@/stores/UIControlStore';
import React from 'react';
import { MdMenuOpen } from 'react-icons/md';

type NavbarProps = {
    setSidebarOpen: (value: boolean) => void;
};

const Navbar = ({ setSidebarOpen }: NavbarProps) => {
    const { currentMode, setCurrentMode } = useUIControlStore();
    return (
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-transparent shadow">
            <button
                type="button"
                className="border-r  px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <MdMenuOpen className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4">
                <div className="flex flex-1">
                    {/* What should go here? */}
                    {/* <form
                        className="flex w-full md:ml-0"
                        action="#"
                        method="GET"
                    >
                        <label htmlFor="search-field" className="sr-only">
                            Search
                        </label>
                        <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                                <MdOutlineSearch
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
                        </div>
                    </form> */}
                </div>
                <div className="ml-4 flex items-center md:ml-6 gap-x-6">
                    <button
                        type="button"
                        className="rounded-full bg-transparent p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:drop-shadow-sm transition-shadow duration-300"
                    >
                        <span className="px-1">Why the bananas?</span>
                    </button>
                    <div className="ml-4 mt-1">
                        <label className="appearance-none">
                            <input
                                id={currentMode}
                                type="checkbox"
                                className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md invisible checked:invisible"
                                checked={currentMode === 'light' ? false : true}
                                onChange={setCurrentMode}
                                value={
                                    currentMode === 'light' ? 'dark' : 'light'
                                }
                            />
                            <span className="cursor-pointer w-8 h-5 flex items-center flex-shrink-0 p-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full  duration-300 ease-in-out peer-checked:bg-gradient-to-l peer-checked:from-indigo-900 peer-checked:to-blue-500 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-3 group-hover:scale-105 group-hover:drop-shadow-md transition-color"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
