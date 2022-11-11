import type { NextPage } from 'next';
import { useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import { BsArrowRight } from 'react-icons/bs';
import clsx from 'clsx';

const navigationLinks = [
    { id: 0, name: 'what?', href: '/#what' },
    { id: 1, name: 'why?', href: '/#why' },
    { id: 2, name: 'how?', href: '/#how' },
    { id: 3, name: 'who?', href: '/#who' },
];

const Home: NextPage = () => {
    const [currentLink, setCurrentLink] = useState('what?');

    function handleChangeSection(linkName: string) {
        const contentWrapper = document.getElementById('contentWrapper');
        const currentSection = document.getElementById(linkName);

        if (contentWrapper && currentSection) {
            contentWrapper.scrollTop = currentSection.offsetTop;
        }

        setCurrentLink(linkName);
    }

    const conditionalColoring = () => {
        switch (currentLink) {
            case 'what?':
                return '#6967CE';
            case 'why?':
                return '#FFC414';
            case 'how?':
                return '#0ea5e9';
            case 'who?':
                return '#f97316';
            default:
                return '#6967CE';
        }
    };

    return (
        <HomeLayout>
            <div className="flex flex-col md:flex-row w-[88vw] h-[88vh]">
                <div className="flex flex-col h-1/2 self-center justify-center">
                    {/* desktop styling */}
                    <nav
                        className="hidden md:block border-l-2 transition-color duration-500"
                        style={{ borderColor: conditionalColoring() }}
                    >
                        <ul className="my-8">
                            {navigationLinks.map((link) => (
                                <li className="mb-2 group" key={link.id}>
                                    <a
                                        type="button"
                                        className="ml-10 flex items-center cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            handleChangeSection(link.name);
                                        }}
                                    >
                                        {link.name === currentLink ? (
                                            <span className="block text-slate-800 dark:text-slate-100">
                                                <BsArrowRight className="w-5 h-4 mr-2" />
                                            </span>
                                        ) : (
                                            <span className="text-slate-800 dark:text-slate-100">
                                                <BsArrowRight className="w-0 opacity-0 h-4 group-hover:w-5 group-hover:opacity-100 transition-translate duration-300 mr-2" />
                                            </span>
                                        )}
                                        <span
                                            className={clsx(
                                                'text-slate-700 dark:text-slate-200 ',
                                                link.name === currentLink
                                                    ? 'tracking-wider'
                                                    : 'group-hover:text-slate-800 dark:group-hover:text-slate-100 group-hover:tracking-wider'
                                            )}
                                        >
                                            {link.name}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* mobile / ipad mini nav styling */}
                    <nav className="md:hidden block w-[88vw] items-center justify-center">
                        <ul
                            className="flex flex-row self-center place-self-center border-b-2"
                            style={{ borderColor: conditionalColoring() }}
                        >
                            {navigationLinks.map((link) => (
                                <li
                                    className="group flex flex-col"
                                    key={link.id}
                                >
                                    <a
                                        type="button"
                                        className="ml-10 flex items-center cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            handleChangeSection(link.name);
                                        }}
                                    >
                                        <span className="text-slate-700 dark:text-slate-200">
                                            {link.name}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div
                    id="contentWrapper"
                    className="grid grid-flow-col md:grid-flow-row w-[88vw] md:w-2/3 md:ml-auto md:mr-1 h-[88vh] md:h-[75vh] self-center transition-color duration-300 overflow-x-hidden md:overflow-y-hidden scroll-smooth snap-y touch-pan-y no-scrollbar"
                >
                    <section
                        id="what?"
                        className="row-span-1 snap-start flex flex-col w-[88vw] h-[88vh] md:w-full md:h-[75vh] p-2"
                    >
                        <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100 lg:mb-5">
                            Simple, quick Kanban boards.
                        </h1>
                        {/* section content */}
                        <div className="flex flex-col gap-y-10">
                            <div className="flex flex-col gap-y-2">
                                <h3 className="">Kanban</h3>
                                <p>
                                    Easily create a board-like structure with
                                    columns and items within those columns...
                                    checklist or simple note types.
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <h3>Reorder, rearrange, restructure</h3>
                                <p>Drag and drop functionality...</p>
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <h3>No sign-up!</h3>
                                <p>IndexDB feature...</p>
                            </div>
                            <div className="flex flex-col">
                                <h3>Import and export database </h3>
                                <p>
                                    Cross device functionality... share .json
                                    between devices.
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <h3>Progressive Web App</h3>
                                <p>
                                    Works on all devices, downloadable the
                                    app!...
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <h3>Import and export database</h3>
                                <p>Cross device functionality...</p>
                            </div>

                            <div className="flex flex-col">
                                <h3>Filter boards</h3>
                                <p>filter by tags, and time</p>
                            </div>
                        </div>
                    </section>
                    <section
                        id="why?"
                        className="row-span-1 snap-start flex flex-col w-[88vw] h-[88vh] md:w-full md:h-[75vh] p-2"
                    >
                        <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                            A bit about the app
                        </h1>
                    </section>
                    <section
                        id="how?"
                        className="row-span-1 snap-start flex flex-col  w-[88vw] h-[88vh] md:w-full md:h-[75vh] p-2"
                    >
                        <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                            Technical talk
                        </h1>
                    </section>
                    <section
                        id="who?"
                        className="row-span-1 snap-start flex flex-col  w-[88vw] h-[88vh] md:w-full md:h-[75vh] p-2"
                    >
                        <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                            KoJaco
                        </h1>
                    </section>

                    {/* psuedo border element */}
                </div>
                {/* side slider wrapper */}
                <div className="flex self-center md:h-[75vh]">
                    <span
                        className={clsx(
                            'flex w-[1/3] h-[3px] md:w-[3px] md:h-1/3 transition-translate duration-500 rounded-full bg-red-500',
                            currentLink === 'why?' && 'translate-y-[18vh]',
                            currentLink === 'how?' && 'translate-y-[35vh]',
                            currentLink === 'who?' && 'translate-y-[50vh]'
                        )}
                        style={{ backgroundColor: conditionalColoring() }}
                    ></span>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Home;
