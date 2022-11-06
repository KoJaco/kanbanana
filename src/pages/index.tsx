import type { NextPage } from 'next';
import { useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import { BsArrowRight } from 'react-icons/bs';
import clsx from 'clsx';

const navigationLinks = [
    { name: 'what?', href: '/#what' },
    { name: 'why?', href: '/#why' },
    { name: 'how?', href: '/#how' },
    { name: 'who?', href: '/#who' },
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
            <div className="flex flex-row w-[88vw] h-[88vh]">
                <div className="flex flex-col h-1/2 self-center justify-center ">
                    <nav
                        className="border-l-2 transition-color duration-500"
                        style={{ borderColor: conditionalColoring() }}
                    >
                        <ul className="my-8">
                            {navigationLinks.map((link, index) => (
                                <li className="mb-2 group" key={index}>
                                    <a
                                        type="button"
                                        className="ml-10 flex items-center cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            handleChangeSection(link.name);
                                        }}
                                    >
                                        {link.name === currentLink ? (
                                            <span className="text-slate-800 dark:text-slate-100">
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
                </div>

                <div
                    id="contentWrapper"
                    className="grid grid-flow-row w-2/3 ml-auto mr-1 h-[75vh] self-center transition-color duration-300 overflow-y-hidden scroll-smooth snap-y touch-pan-y no-scrollbar"
                >
                    <section
                        id="what?"
                        className="row-span-1 snap-start flex flex-col bg-green-200 w-full h-[75vh]"
                    >
                        <div></div>
                    </section>
                    <section
                        id="why?"
                        className="row-span-1 snap-start flex bg-orange-200 w-full h-[75vh]"
                    ></section>
                    <section
                        id="how?"
                        className="row-span-1 snap-start flex bg-blue-200 w-full h-[75vh]"
                    ></section>
                    <section
                        id="who?"
                        className="row-span-1 snap-start flex bg-red-200 w-full h-[75vh]"
                    ></section>

                    {/* psuedo border element */}
                </div>
                {/* side slider wrapper */}
                <div className="flex self-center h-[75vh]">
                    <span
                        className={clsx(
                            'flex w-[3px] h-1/3 transition-translate duration-500 rounded-full',
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
