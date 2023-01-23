import type { NextPage } from 'next';

import { useEffect, useRef, useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import clsx from 'clsx';

import { MdCategory, MdPalette } from 'react-icons/md';
import {
    BsList,
    BsDownload,
    BsShareFill,
    BsArrowRight,
    BsArrowLeft,
} from 'react-icons/bs';
import { BiSortAlt2, BiData } from 'react-icons/bi';
import {
    SiNextdotjs,
    SiTailwindcss,
    SiReact,
    SiTypescript,
    SiGithub,
    SiLinkedin,
} from 'react-icons/si';

import InfoCard from '@/components/displays/InfoCard';
import { useDebounce } from '@/core/hooks/index';

const navigationLinks = [
    { id: 0, name: 'what?', href: '/#what', color: '#6967CE' },
    { id: 1, name: 'why?', href: '/#why', color: '#FFC414' },
    { id: 2, name: 'how?', href: '/#how', color: '#0ea5e9' },
    { id: 3, name: 'who?', href: '/#who', color: '#f97316' },
];

const infoCards = [
    {
        title: 'Note Types',
        content:
            'Create checklists or take simple notes within a board column.',
        icon: <BsList className="w-7 h-7 text-offset" />,
    },
    {
        title: 'Categorisation',
        content: 'Categories boards by time or give them a custom tag.',
        icon: <MdCategory className="w-7 h-7 text-indigo-500" />,
    },
    {
        title: 'Organise',
        content: 'Reorder columns and notes by dragging and dropping them.',
        icon: <BiSortAlt2 className="w-7 h-7 text-orange-500" />,
    },

    {
        title: 'Customisation',
        content: 'Add colours to board tags, column badges, or notes.',
        icon: <MdPalette className="w-7 h-7 text-emerald-500" />,
    },
    {
        title: 'Progressive Web App',
        content: 'Download the app to access it from your home screen.',
        icon: <BsDownload className="w-7 h-7 text-red-500" />,
    },
    {
        title: 'Cross-platform',
        content:
            'Import and export your database as a JSON (.json) file to share your boards across devices.',
        icon: <BsShareFill className="w-7 h-7 text-blue-500" />,
    },
];

const Home: NextPage = () => {
    const [currentLink, setCurrentLink] = useState({
        id: 0,
        name: 'what?',
    });
    const [viewWidth, setViewWidth] = useState(0);
    const [leftRightDisabled, setLeftRightDisabled] = useState(false);

    const debounceTimer = useRef<null | ReturnType<typeof setInterval>>(null);

    const isClientSide = typeof window === 'undefined' ? false : true;

    useEffect(() => {
        if (isClientSide) {
            setViewWidth(window.innerWidth);
        }
    }, [isClientSide]);

    useEffect(() => {
        // event listener for window resize
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    });

    // function handleChangeSection(linkName: string) {
    //     const contentWrapper = document.getElementById('contentWrapper');
    //     const currentSection = document.getElementById(linkName);

    //     if (contentWrapper && currentSection) {
    //         contentWrapper.scrollLeft = currentSection.offsetLeft;
    //     }

    //     setCurrentLink(linkName);
    // }

    function handleWindowResize() {
        if (debounceTimer?.current) {
            // if user tries to resize the screen again
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            // set state variable and delay state changes after 0.5s
            setViewWidth(window.innerWidth);
        }, 500);
    }

    function handleLeftOrRight(direction: 'left' | 'right', value?: number) {
        const contentWrapper = document.getElementById('contentWrapper');

        let newLink: any;
        let currentIndex: number = currentLink.id;

        setLeftRightDisabled(true);

        if (contentWrapper && direction === 'left') {
            if (currentIndex > 0) {
                newLink = navigationLinks[currentLink.id - 1];
                contentWrapper.scrollLeft = value
                    ? contentWrapper.scrollLeft - value
                    : contentWrapper.scrollLeft - viewWidth * 0.9;

                setCurrentLink(newLink);
            }
        }
        if (contentWrapper && direction === 'right') {
            if (currentIndex < 3) {
                newLink = navigationLinks[currentLink.id + 1];
                contentWrapper.scrollLeft = value
                    ? contentWrapper.scrollLeft + value
                    : contentWrapper.scrollLeft + viewWidth * 0.9;

                setCurrentLink(newLink);
            }
        }

        setTimeout(() => {
            setLeftRightDisabled(false);
        }, 500);
    }

    function handleChangeSection(linkIndex: number, linkName: string) {
        const contentWrapper = document.getElementById('contentWrapper');
        const currentSection = document.getElementById(linkName);

        console.log(contentWrapper?.scrollLeft);
        console.log(currentSection?.offsetLeft);

        const newLink = { id: linkIndex, name: linkName };

        if (contentWrapper && currentSection) {
            contentWrapper.scrollLeft = currentSection.offsetLeft;
        }

        setCurrentLink(newLink);
    }

    const conditionalColoring = () => {
        switch (currentLink.name) {
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
            <div className="flex flex-col lg:flex-row w-full h-auto lg:relative absolute top-20">
                {/* Page scroll menu */}
                <div className="lg:absolute lg:left-0 flex flex-col w-auto lg:h-1/2 border-b-1 dark:border-slate-600 lg:border-0 md:shadow-none self-center justify-center lg:mx-0">
                    {/* desktop styling */}
                    <nav
                        className="hidden lg:block border-l-2 transition-color duration-500 ml-[7vw]"
                        style={{ borderColor: conditionalColoring() }}
                    >
                        <ul className="my-4">
                            {navigationLinks.map((link) => (
                                <li className="mb-2 group" key={link.id}>
                                    <a
                                        type="button"
                                        className="ml-6 flex items-center cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            handleChangeSection(
                                                link.id,
                                                link.name
                                            );
                                        }}
                                    >
                                        {link.name === currentLink.name ? (
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
                                                link.name === currentLink.name
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
                    <nav className="lg:hidden my-10 flex w-[88vw] items-center py-2">
                        <button
                            className="mr-auto hover:scale-105 disabled:opacity-50"
                            type="button"
                            aria-label="scroll-left"
                            onClick={() => handleLeftOrRight('left')}
                            disabled={leftRightDisabled}
                        >
                            <BsArrowLeft className="w-7 h-5" />
                        </button>

                        <ul className="inline-flex flex-row -ml-10 items-center justify-center">
                            {navigationLinks.map((link) => (
                                <li
                                    className="group flex mx-auto"
                                    key={link.id}
                                    style={{
                                        borderColor: conditionalColoring(),
                                    }}
                                >
                                    <a
                                        type="button"
                                        className="ml-10 flex cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            handleChangeSection(
                                                link.id,
                                                link.name
                                            );
                                        }}
                                    >
                                        <span
                                            className={clsx(
                                                'text-slate-700 dark:text-slate-200 hover:border-b-2 hover:-translate-y-1 transition-all duration-300',
                                                link.name ===
                                                    currentLink.name &&
                                                    `-translate-y-1 bg-[${link.color}] border-b-2`
                                            )}
                                            style={{ borderColor: link.color }}
                                        >
                                            {link.name}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="ml-auto hover:scale-105 disabled:opacity-50"
                            type="button"
                            aria-label="scroll-right"
                            onClick={() => {
                                handleLeftOrRight('right');
                            }}
                            disabled={leftRightDisabled}
                        >
                            <BsArrowRight className="w-7 h-5" />
                        </button>
                    </nav>
                </div>

                {/* Main content section */}
                <div className="flex justify-center items-center overflow-x-hidden w-full lg:px-32 2xl:px-40 lg:ml-[5vw] 2xl:ml-[10vw]">
                    <div
                        id="contentWrapper"
                        className="grid grid-flow-col auto-cols-auto w-full h-full  self-center transition-color duration-300 overflow-y-auto scroll-smooth snap-x touch-pan-x no-scrollbar snap-proximity"
                        // className="grid grid-flow-col md:grid-flow-row w-[88vw] md:w-2/3 md:ml-auto md:mr-1 h-[88vh] md:h-[75vh] self-center transition-color duration-300 overflow-x-hidden md:overflow-y-hidden scroll-smooth md:snap-y snap-x touch-pan-y no-scrollbar"
                    >
                        <section
                            id="what?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-auto lg:w-[72vw] xl:w-[75vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            {/* <section
                            id="what?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] md:w-[70vw] xl:w-[75vw] h-[75vh]"
       
                        > */}
                            <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100 lg:mb-5">
                                Simple, quick Kanban boards.
                            </h1>
                            <p className="text-slate-800 dark:text-slate-200 mb-5">
                                Kan-banana is a free application built for
                                creating and organising basic Kanban boards. It
                                uses IndexedDB, a database located within a
                                user&#39;s browser, to store board data.
                            </p>
                            {/* section content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-12 gap-y-10 gap-x-8">
                                {infoCards.map((card, index) => (
                                    <div
                                        key={index}
                                        className="flex col-1 w-full h-full"
                                    >
                                        <InfoCard
                                            title={card?.title}
                                            icon={card?.icon}
                                            content={card.content}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col mt-5">
                                <p>
                                    Kan-banana does not store or track any data
                                    externally, solely relying on data stored
                                    within your own browser to operate. You can
                                    manually delete Kan-banana&#39;s database by
                                    opening up developer tools (right click &
                                    inspect) and selecting:
                                </p>
                                <br />
                                <div className="text-center py-5 rounded-sm bg-slate-200/50 dark:bg-slate-700">
                                    {
                                        'Application  -->  IndexedDB  -->  Kan-bananaDB  -->  Delete Database'
                                    }
                                </div>
                                <br />
                            </div>
                        </section>
                        <section
                            id="why?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-[80vh] lg:w-[72vw] xl:w-[72vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                                A bit about the app
                            </h1>

                            <p>
                                Kan-banana is also a hobby or portfolio project,
                                it is not mean to be the most performant,
                                versatile, nor ground-breaking solution out
                                there. As it is a free app, I have also not
                                spent too much time in optimising, and testing
                                or bugs.
                            </p>
                        </section>
                        <section
                            id="how?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-[80vh] lg:w-[72vw] xl:w-[72vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                                Technical talk
                            </h1>
                        </section>
                        <section
                            id="who?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-[80vh] lg:w-[72vw] xl:w-[72vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-100">
                                KoJaco
                            </h1>
                        </section>
                        {/* psuedo border element */}
                    </div>
                </div>

                {/* side slider wrapper */}
                <div className="hidden lg:absolute lg:flex right-0 self-center lg:h-[75vh] ml-auto mr-[7vw]">
                    <span
                        className={clsx(
                            'flex w-[3px] h-1/4 transition-translate duration-500 rounded-full bg-red-500',
                            currentLink.name === 'why?' && 'translate-y-[15vh]',
                            currentLink.name === 'how?' && 'translate-y-[28vh]',
                            currentLink.name === 'who?' && 'translate-y-[40vh]'
                        )}
                        style={{ backgroundColor: conditionalColoring() }}
                    />
                </div>
            </div>
        </HomeLayout>
    );
};

export default Home;
