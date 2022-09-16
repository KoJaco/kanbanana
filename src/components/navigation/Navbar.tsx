import React from 'react';
import { MdMenuOpen, MdOutlineSearch } from 'react-icons/md';

type NavbarProps = {
    setSidebarOpen: (value: boolean) => void;
};

const Navbar = ({ setSidebarOpen }: NavbarProps) => {
    return (
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <MdMenuOpen className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4">
                <div className="flex flex-1">
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
                <div className="ml-4 flex items-center md:ml-6">
                    <button
                        type="button"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:drop-shadow-sm transition-shadow duration-300"
                    >
                        <span className="px-1">Why the bananas?</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
