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
import { BiSortAlt2 } from 'react-icons/bi';

import InfoCard from '@/components/displays/InfoCard';

import InstallPWA from '@/components/InstallApp/InstallPWA';

const navigationLinks = [
    { id: 0, name: 'what?', href: '/#what', color: '#6967CE' },
    { id: 1, name: 'why?', href: '/#why', color: '#FFC414' },
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
        content: 'Categorise boards by time or give them custom tags.',
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
        title: 'Sharable DB',
        content:
            'Import and export your database as a JSON (.json) file to share your boards across devices.',
        icon: <BsShareFill className="w-7 h-7 text-blue-500" />,
    },
];

const learningCards = [
    'Learn Next.js and React to create a fully functioning application.',
    'Apply styling using tailwind and really cement my knowledge of css in the context of tailwind as my styling framework of choice (I much prefer tailwind to plain css).',
    'Get familiar with using forms and controlling inputs, submitting form data to a db after parsing & sanitising client-side data, etc.',
    'Implement styling in both a light and a dark mode.',
    'Make use of the dnd-kit library and create some cool drag, drop, and item filtering animations.',
    'Interact with a database and send data between a database and a UI (even though it is an in-browser DB).',
    'Make something that I may actually use for organising information into kanban boards (I do know that Trello exists).',
    'Just getting coding myself without the help of any tutorials or guides.',
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

            default:
                return '#6967CE';
        }
    };

    return (
        <HomeLayout>
            <div className="flex flex-col lg:flex-row w-full h-auto lg:relative absolute top-20 dark:bg-slate-900">
                {/* Page scroll menu */}
                <div className="lg:absolute lg:left-0 flex flex-col w-auto lg:h-1/2 border-b-1 dark:border-slate-600 lg:border-0 md:shadow-none self-center justify-center lg:mx-0 ">
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
                                                'text-slate-700 dark:text-slate-200 opacity-75',
                                                link.name === currentLink.name
                                                    ? 'tracking-wider opacity-100'
                                                    : 'group-hover:text-slate-800 dark:group-hover:text-slate-100 group-hover:tracking-wider group-hover:opacity-100 transition-opacity duration-300'
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
                    <nav className="lg:hidden my-10 flex w-[80vw] items-center">
                        <ul className="inline-flex flex-row items-center justify-center w-full gap-x-10">
                            {navigationLinks.map((link) => (
                                <li
                                    className="group flex"
                                    key={link.id}
                                    style={{
                                        borderColor: conditionalColoring(),
                                    }}
                                >
                                    <a
                                        type="button"
                                        className="flex cursor-pointer"
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
                    </nav>
                </div>

                {/* Main content section */}
                <div className="flex justify-center items-center overflow-x-hidden w-full lg:px-32 2xl:px-40 lg:ml-[5vw] 2xl:ml-[10vw]">
                    <div
                        id="contentWrapper"
                        className="grid grid-flow-col auto-cols-auto w-full h-full self-center transition-color duration-300 overflow-y-auto scroll-smooth snap-x touch-pan-x no-scrollbar snap-proximity mx-4"
                    >
                        <section
                            id="what?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-auto lg:w-[72vw] xl:w-[75vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            <h1 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-200 lg:mb-5">
                                Simple, quick Kanban boards.
                            </h1>
                            <p className="text-slate-800 dark:text-slate-400 mb-5">
                                Kan-banana is a free hobby application built for
                                creating and organising basic Kanban boards. It
                                uses IndexedDB, a database located within a
                                user&#39;s browser, to store board data. You can
                                also download the application, providing your
                                browser supports the operation, by clicking the
                                button below!
                            </p>
                            <div>
                                <InstallPWA />
                            </div>

                            {/* section content */}
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-12 gap-y-10 gap-x-8">
                                {infoCards.map((card, index) => (
                                    <li
                                        key={index}
                                        className="flex col-1 w-full h-full"
                                    >
                                        <InfoCard
                                            title={card?.title}
                                            icon={card?.icon}
                                            content={card.content}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col mt-5">
                                <p className="text-slate-800 dark:text-slate-400">
                                    Kan-banana does not store or track any data
                                    externally, solely relying on data stored
                                    within your own browser to operate. You can
                                    manually delete Kan-banana&#39;s database by
                                    opening up developer tools (right click &
                                    inspect) and following:
                                </p>
                                <br />
                                <br />
                                <div className="text-center py-5 rounded-sm bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300">
                                    {
                                        'Application  -->  IndexedDB --> Kan-banana --> Delete Database'
                                    }
                                </div>
                                <br />
                            </div>
                        </section>
                        <section
                            id="why?"
                            className="col-span-1 snap-start flex flex-col w-[100vw] h-[80vh] lg:w-[72vw] xl:w-[72vw] max-w-[1800px] px-10 xl:mx-40 py-10"
                        >
                            <h2 className="py-2 text-xl font-medium text-slate-700 dark:text-slate-200">
                                A bit about the app
                            </h2>

                            <p className="text-slate-700 dark:text-slate-400">
                                Kan-banana is a hobby project that I undertook
                                solely with the aim of learning react/next.js.
                                It is the first actual application I created and
                                released and, as I finished the development of
                                it quite some time ago, there are many things I
                                would do differently now. As it is a free app, I
                                have also not spent too much time in testing and
                                optimising.
                            </p>
                            <br />
                            <p className="text-slate-700 dark:text-slate-400">
                                The Specific skills that I wished to cover with
                                the creation of Kanbanana were as follows...
                            </p>
                            <ul className="grid grid-cols-2 my-10 gap-10">
                                {learningCards.map((c, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="flex col-1 w-full h-full"
                                        >
                                            <InfoCard
                                                title={`0${index + 1}.`}
                                                content={c}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                            <p className="text-slate-700 dark:text-slate-400">
                                If you wish to see more of my work or get in
                                contact with me, please check out{' '}
                                <span className="underline font-semibold">
                                    <a href="#" target="_blank">
                                        my portfolio website.
                                    </a>
                                </span>
                            </p>
                        </section>
                    </div>
                </div>

                {/* side slider wrapper */}
                <div className="hidden lg:absolute lg:flex right-0 self-center lg:h-full ml-auto mr-[7vw]">
                    <span
                        className={clsx(
                            'flex w-[3px] h-1/4 transition-translate duration-500 rounded-full',
                            currentLink.name === 'why?' && 'translate-y-[60vh]'
                        )}
                        style={{ backgroundColor: conditionalColoring() }}
                    />
                </div>
            </div>
        </HomeLayout>
    );
};

export default Home;
