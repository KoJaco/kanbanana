import type { NextPage } from 'next';
import { useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import { BsArrowRight } from 'react-icons/bs';
import clsx from 'clsx';

const navigationLinks = [
    { name: 'what?', href: '/#what', current: true },
    { name: 'why?', href: '/#why', current: false },
    { name: 'how?', href: '/#how', current: false },
    { name: 'who?', href: '/#who', current: false },
];

const Home: NextPage = () => {
    const [currentLink, setCurrentLink] = useState('what?');

    const conditionalColoring = (twIndicator: 'border' | 'text' | 'bg') => {
        switch (currentLink) {
            case 'what?':
                return `${twIndicator}-orange-500`;
            case 'why?':
                return `${twIndicator}-indigo-500`;
            case 'how?':
                return `${twIndicator}-yellow-500`;
            case 'who?':
                return `${twIndicator}-red-500`;
            default:
                return `${twIndicator}-orange-500`;
        }
    };

    return (
        <HomeLayout>
            <div className="grid grid-cols-3 w-[88vw] h-[88vh]">
                <div className="flex flex-col h-1/2  self-center justify-center">
                    <nav
                        className={clsx(
                            'border-l-2 transition-color duration-300',
                            conditionalColoring('border')
                        )}
                    >
                        <ul className="ml-10">
                            {navigationLinks.map((link, index) => (
                                <li className="mb-2" key={index}>
                                    <a
                                        type="button"
                                        className="flex items-center group cursor-pointer"
                                        href={link.href}
                                        onClick={() => {
                                            setCurrentLink(link.name);
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
                    className={clsx(
                        'col-span-2 flex flex-col w-full h-[75vh] self-center border-r-2 transition-color duration-300',
                        conditionalColoring('border')
                    )}
                >
                    <div id="what?"></div>
                    <div id="why?"></div>
                    <div id="how?"></div>
                    <div id="who?"></div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Home;
