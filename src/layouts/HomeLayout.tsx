import { useUIControlStore } from '@/stores/UIControlStore';
import Navbar from '@/components/navigation/Navbar';
import { useTheme } from 'next-themes';
import React from 'react';
import { MdMenuOpen } from 'react-icons/md';
import Link from 'next/link';
type BoardLayoutProps = {
    children: JSX.Element;
};

export default function BoardLayout({ children }: BoardLayoutProps) {
    const { theme, setTheme } = useTheme();
    const { currentMode } = useUIControlStore();

    return (
        <>
            <div className="flex flex-1 flex-col dark:bg-slate-900 h-screen">
                {/* Navbar */}
                <div className="sticky top-0 z-[150] flex h-16 flex-shrink-0 bg-white dark:bg-slate-900 dark:border-b dark:border-slate-700/[0.5] dark:shadow-slate-900 shadow dark:shadow-sm">
                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1"></div>
                        <div className="ml-4 flex items-center lg:ml-6 gap-x-6">
                            <Link href="/boards" passHref={true}>
                                <a className="rounded-full bg-transparent p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-slate-500 focus:drop-shadow-sm transition-shadow duration-300 cursor-pointer px-1">
                                    Get creating!
                                </a>
                            </Link>
                            <div className="ml-4 mt-1">
                                <label className="appearance-none">
                                    <input
                                        id={currentMode}
                                        type="checkbox"
                                        className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md invisible checked:invisible"
                                        checked={
                                            theme === 'light' ? false : true
                                        }
                                        onChange={() =>
                                            setTheme(
                                                theme === 'dark'
                                                    ? 'light'
                                                    : 'dark'
                                            )
                                        }
                                        value={
                                            theme === 'light' ? 'dark' : 'light'
                                        }
                                    />
                                    <span className="cursor-pointer w-8 h-5 flex items-center flex-shrink-0 p-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full  duration-300 ease-in-out peer-checked:bg-gradient-to-l peer-checked:from-indigo-900 peer-checked:to-blue-500 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-3 group-hover:scale-105 group-hover:drop-shadow-md transition-color"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="dark:bg-slate-900 touch-pan-y">
                    {children}
                </main>
            </div>
        </>
    );
}